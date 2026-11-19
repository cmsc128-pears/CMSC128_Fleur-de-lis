// blumeService.js — formats user picks and fetches AI replies from Gemini

import { GoogleGenAI } from "@google/genai";
import { getAllInventory } from "./inventoryService";
import { generateBouquetImageUrl } from "./bouquetImageGenerator";

// ---------- Gemini setup ----------
const STEP_NAMES = {
  1: "Step 1 (Flowers)",
  2: "Step 2 (Fillers)",
  3: "Step 3 (Wrappers)",
  4: "Step 4 (Add-ons)",
};

const GEMINI_MODELS = [
  "gemini-3.5-flash-lite",
  "gemini-3.8-flash",
  "gemini-3.1-flash-lite",
];

const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

// ---------- user picks formatter ----------
// Summarizes current bouquet items and estimated total for Blume's context
export function formatUserPicks(draftBouquet = {}, currentStep = 1) {
  const items = draftBouquet?.items || {};
  const catalogFlowers = getAllInventory().flowers;

  const flowers = (items.flowers || [])
    .map((f) => {
      const name = f.name || "Flower";
      const hasColor = f.color && name.toLowerCase().includes(f.color.toLowerCase());
      const label = hasColor || !f.color ? name : `${f.color} ${name}`;
      return `${f.quantity || 1}x ${label}`;
    })
    .join(", ");

  const fillers = (items.fillers || [])
    .map((f) => `${f.quantity || 1}x ${f.name}`)
    .join(", ");

  const wrapper = items.wrapper
    ? `${items.wrapper.color || ""} ${items.wrapper.name || "Wrapper"}`.trim()
    : "None";

  const addOns = (items.addOns || [])
    .map((a) => a.selectedOption || a.name)
    .join(", ");

  const allSelected = [
    ...(items.flowers || []),
    ...(items.fillers || []),
    ...(items.addOns || []),
  ];

  const total = allSelected.reduce((sum, item) => {
    let price = Number(item.price ?? item.unitPrice);
    if (!price && item.name) {
      const match = catalogFlowers.find((cf) =>
        cf.name.toLowerCase().includes(item.name.toLowerCase().replace(/^red\s+/i, ""))
      );
      price = Number(match?.price) || 0;
    }
    return sum + price * (Number(item.quantity) || 1);
  }, 0);

  const stepLabel = STEP_NAMES[currentStep] || `Step ${currentStep}`;

  return {
    stepLabel,
    flowers: flowers || "None",
    fillers: fillers || "None",
    wrapper,
    addOns: addOns || "None",
    total,
    summary: `Current User Picks (${stepLabel}) — Flowers: ${flowers || "None"}, Fillers: ${
      fillers || "None"
    }, Wrapper: ${wrapper}, Add-ons: ${addOns || "None"}, Estimated Total: ₱${total.toFixed(2)}`,
  };
}

// ---------- system prompt builder ----------
// Combines Blume's personality, user picks, and shop catalog
function buildSystemPrompt(draftBouquet, currentStep) {
  const picks = formatUserPicks(draftBouquet, currentStep);
  const { flowers, fillers, wrappers, addons } = getAllInventory();

  const flowerList = flowers
    .map((f) => `${f.name} (₱${f.price ?? "bundle"}, colors: ${f.color?.join("/")}, meaning: ${f.description})`)
    .join("; ");
  const fillerList = fillers.map((f) => `${f.name} (${f.description})`).join("; ");
  const wrapperList = wrappers.map((w) => `${w.color} ${w.name}`).join(", ");
  const addonList = addons.map((a) => `${a.name} (₱${a.price ?? "TBD"})`).join(", ");

  return [
    "You are Blume, a sweet, warm, and aesthetic AI florist assistant for Fleur in the Philippines.",
    "Speak like a caring florist friend—gentle, encouraging, and enthusiastic about flower meanings, emotions, and color harmony.",
    "Use occasional cute floral or sparkle emojis (🌸, ✨, 🌷, 🤍) naturally, and match the user's language (English or light Taglish).",
    "Format your replies neatly for a mobile chat bubble using:",
    "- A short heading when recommending or explaining (e.g. '### 🌸 Blume\\'s Picks' or '### ✨ Flower Meanings')",
    "- Bullet points ('- ') with **bold** item names and prices (e.g. '**Local Rose (₱30/stem)**') and *italics* for flower meanings or vibes",
    "- A short, warm closing tip (keep the whole reply concise—around 1 short intro + 2–3 bullets + 1 short tip, no markdown tables).",
    "Only recommend items from the Fleur shop catalog below and quote prices in Philippine Pesos (₱).",
    picks.summary,
    `Flowers: ${flowerList}`,
    `Fillers: ${fillerList}`,
    `Wrappers: ${wrapperList}`,
    `Add-ons: ${addonList}`,
  ].join("\n");
}

// ---------- offline fallback ----------
// Used when VITE_GEMINI_API_KEY is missing or offline
function getOfflineFallback(userText, picks) {
  const { flowers, fillers } = getAllInventory();
  const match = [...flowers, ...fillers].find((item) =>
    userText.toLowerCase().includes(item.name.toLowerCase())
  );

  if (match) {
    return `${match.name} (₱${match.price ?? "bundle"}): ${match.description}`;
  }

  return `You're on ${picks.stepLabel} with ${picks.flowers} (₱${picks.total.toFixed(
    2
  )}). Add VITE_GEMINI_API_KEY to .env to chat with Blume AI!`;
}

// ---------- main chat handler ----------
// Sends user message to Gemini or returns an AI bouquet image preview
export async function getBlumeResponse({
  userText,
  draftBouquet,
  currentStep,
  previousInteractionId,
}) {
  const picks = formatUserPicks(draftBouquet, currentStep);
  const wantsPreview = /\b(preview|visualize|image|picture|photo|look like)\b/i.test(userText);

  if (wantsPreview) {
    return {
      replyText: `Here is an AI preview based on your current picks (${picks.flowers})!`,
      imageUrl: generateBouquetImageUrl(draftBouquet, { seed: Date.now() % 1000 }),
      nextInteractionId: previousInteractionId,
    };
  }

  if (ai) {
    const systemInstruction = buildSystemPrompt(draftBouquet, currentStep);

    for (const model of GEMINI_MODELS) {
      try {
        const interaction = await ai.interactions.create({
          model,
          system_instruction: systemInstruction,
          input: userText,
          previous_interaction_id: previousInteractionId,
        });

        if (interaction.output_text) {
          return {
            replyText: interaction.output_text.trim(),
            imageUrl: null,
            nextInteractionId: interaction.id || previousInteractionId,
          };
        }
      } catch {
        // try next model
      }
    }
  }

  return {
    replyText: getOfflineFallback(userText, picks),
    imageUrl: null,
    nextInteractionId: previousInteractionId,
  };
}

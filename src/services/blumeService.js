import { GoogleGenAI } from "@google/genai";
import { getAllInventory } from "./inventoryService";
import { generateBouquetImageUrl } from "./bouquetImageGenerator";

const STEP_NAMES = {
  1: "Step 1 (Flowers)",
  2: "Step 2 (Fillers)",
  3: "Step 3 (Wrappers)",
  4: "Step 4 (Add-ons)",
};

// Models to try in order (falls back if one model has a temporary 503 spike)
const GEMINI_MODELS = [
  "gemini-3.5-flash-lite",
  "gemini-3.8-flash",
  "gemini-3.1-flash-lite",
];

const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

// Formats the user's current bouquet selections into a short summary string for Blume.
// TODO: Check field names once all 4 customization steps are connected to `draftBouquet`.
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

// Builds the system instruction containing the shop catalog and the user's current picks.
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
    "You are Blume, the friendly AI florist assistant for Fleur de Lis in the Philippines.",
    "Reply in 1 to 3 short sentences (plain text only, no markdown tables) so it fits in a mobile chat bubble.",
    "Only recommend items from the shop catalog below and use Philippine Pesos (₱).",
    picks.summary,
    `Flowers: ${flowerList}`,
    `Fillers: ${fillerList}`,
    `Wrappers: ${wrapperList}`,
    `Add-ons: ${addonList}`,
  ].join("\n");
}

// Simple fallback used only if VITE_GEMINI_API_KEY is missing or the user is offline.
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

// Main function called by FloatingBlume.jsx when the user sends a message.
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
        // Try the next Gemini model in GEMINI_MODELS
      }
    }
  }

  return {
    replyText: getOfflineFallback(userText, picks),
    imageUrl: null,
    nextInteractionId: previousInteractionId,
  };
}

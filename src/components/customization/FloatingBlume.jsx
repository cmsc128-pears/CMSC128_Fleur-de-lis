import { useEffect, useRef, useState } from "react";
import { getAllInventory } from "../../services/inventoryService";
import blumeAvatar from "../../assets/images/blume.png";
import "./FloatingBlume.css";

// ============================================================================
// [BLUME-PICKS-CONTEXT]
// Formats the user's current manual customization selections into a prompt string
// so Blume knows what is already in the bouquet.
// TODO: Verify property names match Yona's `draftBouquet`
// state and Member 2 & 3's item schemas (`flowers`, `fillers`, `wrapper`, `addOns`).
// DEBUG: Search "[BLUME-PICKS-CONTEXT]" to inspect how user selections are parsed.
// ============================================================================
function buildUserPicksContext(draftBouquet = {}, currentStep = 1) {
  const items = draftBouquet?.items || {};
  const flowers = (items.flowers || [])
    .map((f) => `${f.quantity || 1}x ${f.color ? `${f.color} ` : ""}${f.name}`)
    .join(", ");
  const fillers = (items.fillers || [])
    .map((f) => `${f.quantity || 1}x ${f.name}`)
    .join(", ");
  const wrapper = items.wrapper
    ? `${items.wrapper.color || ""} ${items.wrapper.name || items.wrapper.type || "Wrapper"}`.trim()
    : "None yet";
  const addOns = (items.addOns || [])
    .map((a) => a.selectedOption || a.name)
    .join(", ");

  return {
    step: currentStep,
    flowers: flowers || "None yet",
    fillers: fillers || "None yet",
    wrapper,
    addOns: addOns || "None yet",
    summaryPrompt: `[Current User Picks — Step ${currentStep}/4 | Flowers: ${
      flowers || "None"
    } | Fillers: ${fillers || "None"} | Wrapper: ${wrapper} | Add-ons: ${
      addOns || "None"
    }]`,
  };
}

// ============================================================================
// [BLUME-REPLY-ENGINE]
// Generates a contextual Blume reply using the user's message and current picks.
// TODO: Replace or expand keyword rules if connecting to a live LLM API
// (e.g., Gemini API) or adding more specific tag/occasion matching from JSON data.
// DEBUG: Search "[BLUME-REPLY-ENGINE]" if Blume returns unexpected recommendations.
// ============================================================================
function generateBlumeReply(userText, draftBouquet, currentStep) {
  const q = userText.toLowerCase();
  const picks = buildUserPicksContext(draftBouquet, currentStep);
  const inventory = getAllInventory();
  const sampleFillers =
    inventory.fillers
      .slice(0, 2)
      .map((f) => f.name)
      .join(" or ") || "Baby's Breath or Eucalyptus";
  const sampleFlowers =
    inventory.flowers
      .slice(0, 2)
      .map((f) => f.name)
      .join(" or ") || "Roses or Sunflowers";
  const hasFlowers = (draftBouquet?.items?.flowers || []).length > 0;

  if (q.includes("match") || q.includes("pair") || q.includes("filler") || q.includes("go with")) {
    if (hasFlowers) {
      return `With your ${picks.flowers}, ${sampleFillers} fillers and a Cream Kraft wrapper would look lovely!`;
    }
    return `Try starting with focal blooms like ${sampleFlowers}, then pair them with ${sampleFillers}!`;
  }

  if (q.includes("wrapper") || q.includes("wrap") || q.includes("color")) {
    return hasFlowers
      ? `To complement your ${picks.flowers}, I suggest a soft Cream, Blush Pink, or Matte Kraft wrapper.`
      : "Warm tones (Red, Yellow, Peach) look great with Kraft or Cream paper, while pastels pop with Frosted or White wraps!";
  }

  if (q.includes("romance") || q.includes("anniversary") || q.includes("valentine")) {
    return "For a romantic vibe, classic Red or Pink Roses with Baby's Breath and chocolates are always a favorite!";
  }

  if (q.includes("birthday") || q.includes("graduation") || q.includes("cheerful")) {
    return "Sunflowers or Tulips paired with greenery fillers and a cute stuffed toy add-on make a bright, cheerful gift!";
  }

  if (hasFlowers) {
    return `You currently have ${picks.flowers} in your bouquet! Would you like filler, wrapper, or add-on ideas to match?`;
  }

  return "I can help you pick flowers, fillers, wrappers, or add-ons! Tell me the occasion, mood, or colors you like.";
}

// ============================================================================
// [BLUME-AVATAR-ICON]
// Renders the Blume PNG asset (`src/assets/images/blume.png`).
// DEBUG: Search "[BLUME-AVATAR-ICON]" if the avatar image fails to load or scale.
// ============================================================================
function BlumeBotIcon({ className = "blume__bot-img" }) {
  return (
    <img
      src={blumeAvatar}
      alt=""
      className={className}
      aria-hidden="true"
    />
  );
}

// ============================================================================
// [BLUME-MAIN-COMPONENT]
// Floating Blume AI trigger + expandable popover chat drawer.
// TODO: Mount `<FloatingBlume />` inside the Manual
// Customization header row next to the 1-2-3-4 stepper and pass:
//   - `userInitials` (from logged-in user profile, e.g. first + last initials)
//   - `draftBouquet` (live bouquet state from ManualCustomize.jsx)
//   - `currentStep` (active step 1..4)
// ============================================================================
export default function FloatingBlume({
  userInitials = "FN",
  draftBouquet = {},
  currentStep = 1,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [inputText, setInputText] = useState("");
  const [messages, setMessages] = useState([
    {
      id: "msg_welcome",
      sender: "blume",
      text: "Hi! I'm Blume. Ask me what flowers, fillers, or wrappers match your picks!",
    },
  ]);

  const chatListRef = useRef(null);
  const containerRef = useRef(null);

  // [BLUME-AUTOSCROLL] Scrolls chat container to the latest message on send/open
  useEffect(() => {
    if (isOpen && chatListRef.current) {
      chatListRef.current.scrollTop = chatListRef.current.scrollHeight;
    }
  }, [messages, isOpen]);

  // [BLUME-OUTSIDE-CLICK] Closes the popover drawer when user clicks outside of it
  useEffect(() => {
    function handleClickOutside(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  const handleToggle = () => {
    setIsOpen((prev) => !prev);
  };

  // [BLUME-SEND-HANDLER] Builds prompt with user's picks and appends Blume's reply
  // TODO: If saving AI chat history to Firestore `ai_sessions`
  // is needed later, call your Firestore service inside `handleSend`.
  const handleSend = (e) => {
    e.preventDefault();
    const trimmed = inputText.trim();
    if (!trimmed) return;

    const picksContext = buildUserPicksContext(draftBouquet, currentStep);
    const promptWithPicks = `${picksContext.summaryPrompt} User asks: ${trimmed}`;

    // DEBUG: Uncomment the console.log below when testing to see the exact prompt with user picks
    // console.log("[DEBUG BLUME PROMPT]:", promptWithPicks);

    const userMsg = {
      id: `user_${Date.now()}`,
      sender: "user",
      text: trimmed,
      promptSent: promptWithPicks,
    };

    const replyText = generateBlumeReply(trimmed, draftBouquet, currentStep);
    const blumeMsg = {
      id: `blume_${Date.now() + 1}`,
      sender: "blume",
      text: replyText,
    };

    setMessages((prev) => [...prev, userMsg, blumeMsg]);
    setInputText("");
  };

  return (
    <div className="blume" ref={containerRef}>
      {/* [BLUME-CLOSED-PILL] Speech bubble shown only when chat drawer is closed */}
      {!isOpen && (
        <button
          type="button"
          className="blume__greeting-pill"
          onClick={handleToggle}
        >
          Hi I&apos;m <strong>Blume</strong>, your AI Assistant. Ask me anything!
        </button>
      )}

      {/* [BLUME-TRIGGER-BTN] Circular Blume avatar button that toggles chat open/closed */}
      <button
        type="button"
        className="blume__avatar-btn"
        onClick={handleToggle}
        aria-expanded={isOpen}
        aria-label={isOpen ? "Close Blume AI chat" : "Open Blume AI chat"}
      >
        <BlumeBotIcon />
        <span className="blume__status-dot" aria-hidden="true" />
      </button>

      {/* [BLUME-OPEN-DRAWER] Floating chat box ("open chat-bot" wireframe) */}
      {isOpen && (
        <section className="blume__drawer" aria-label="Blume AI Assistant Chat">
          <div className="blume__messages" ref={chatListRef}>
            {messages.map((msg) =>
              msg.sender === "blume" ? (
                <div key={msg.id} className="blume__row blume__row--bot">
                  <span className="blume__mini-avatar" aria-hidden="true">
                    <BlumeBotIcon className="blume__mini-img" />
                  </span>
                  <div className="blume__bubble blume__bubble--bot">
                    {msg.text}
                  </div>
                </div>
              ) : (
                <div key={msg.id} className="blume__row blume__row--user">
                  <div className="blume__bubble blume__bubble--user">
                    {msg.text}
                  </div>
                  <span className="blume__user-badge" aria-hidden="true">
                    {userInitials}
                  </span>
                </div>
              )
            )}
          </div>

          {/* [BLUME-INPUT-FORM] User question input + paper-plane submit button */}
          <form className="blume__form" onSubmit={handleSend}>
            <input
              type="text"
              className="blume__input"
              placeholder="Ask Blume.."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              aria-label="Ask Blume"
            />
            <button
              type="submit"
              className="blume__send-btn"
              disabled={!inputText.trim()}
              aria-label="Send message"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="currentColor"
                aria-hidden="true"
              >
                <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
              </svg>
            </button>
          </form>
        </section>
      )}
    </div>
  );
}

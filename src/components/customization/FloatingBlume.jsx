import { useCallback, useEffect, useRef, useState } from "react";
import { getAllInventory } from "../../services/inventoryService";
import blumeAvatar from "../../assets/images/blume.png";
import "./FloatingBlume.css";

// ---------- prompt helper (formats current user selections for Blume) ----------
// TODO: Verify property names match the shared `draftBouquet` state once
// the Flowers, Fillers, Wrappers, and Add-ons steps are connected.
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

// ---------- reply generator (uses user's picks + inventory data) ----------
// TODO: Expand keyword matching or connect to the live AI service if needed.
function generateBlumeReply(userText, draftBouquet, currentStep) {
  const query = userText.toLowerCase();
  const picks = buildUserPicksContext(draftBouquet, currentStep);
  const inventory = getAllInventory();

  const sampleFillers =
    inventory.fillers.slice(0, 2).map((f) => f.name).join(" or ") ||
    "Baby's Breath or Eucalyptus";

  const sampleFlowers =
    inventory.flowers.slice(0, 2).map((f) => f.name).join(" or ") ||
    "Roses or Sunflowers";

  const hasFlowers = (draftBouquet?.items?.flowers || []).length > 0;

  if (query.includes("match") || query.includes("pair") || query.includes("filler") || query.includes("go with")) {
    if (hasFlowers) {
      return `With your ${picks.flowers}, ${sampleFillers} fillers and a Cream Kraft wrapper would look lovely!`;
    }
    return `Try starting with focal blooms like ${sampleFlowers}, then pair them with ${sampleFillers}!`;
  }

  if (query.includes("wrapper") || query.includes("wrap") || query.includes("color")) {
    return hasFlowers
      ? `To complement your ${picks.flowers}, I suggest a soft Cream, Blush Pink, or Matte Kraft wrapper.`
      : "Warm tones (Red, Yellow, Peach) look great with Kraft or Cream paper, while pastels pop with Frosted or White wraps!";
  }

  if (query.includes("romance") || query.includes("anniversary") || query.includes("valentine")) {
    return "For a romantic vibe, classic Red or Pink Roses with Baby's Breath and chocolates are always a favorite!";
  }

  if (query.includes("birthday") || query.includes("graduation") || query.includes("cheerful")) {
    return "Sunflowers or Tulips paired with greenery fillers and a cute stuffed toy add-on make a bright, cheerful gift!";
  }

  if (hasFlowers) {
    return `You currently have ${picks.flowers} in your bouquet! Would you like filler, wrapper, or add-on ideas to match?`;
  }

  return "I can help you pick flowers, fillers, wrappers, or add-ons! Tell me the occasion, mood, or colors you like.";
}

// ---------- Blume avatar image ----------
function BlumeBotIcon({ className = "blume__bot-img" }) {
  return <img src={blumeAvatar} alt="" className={className} aria-hidden="true" />;
}

// ---------- main component ----------
// TODO: Mount `<FloatingBlume />` inside the Manual Customization header and pass:
//   - `userInitials` (logged-in user's initials, e.g. "PS")
//   - `draftBouquet` (current bouquet selections state)
//   - `currentStep` (active step number 1–4)
export default function FloatingBlume({
  userInitials = "FN",
  draftBouquet = {},
  currentStep = 1,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [showGreetingPill, setShowGreetingPill] = useState(true);
  const [inputText, setInputText] = useState("");
  const [drawerMetrics, setDrawerMetrics] = useState({
    top: "120px",
    left: "0px",
    width: "390px",
    height: "500px",
    pointerRight: "20px",
  });
  const [messages, setMessages] = useState([
    {
      id: "msg_welcome",
      sender: "blume",
      text: "Hi! I'm Blume. Ask me what flowers, fillers, or wrappers match your picks!",
    },
  ]);

  const chatListRef = useRef(null);
  const containerRef = useRef(null);
  const avatarBtnRef = useRef(null);

  // Show the greeting pill for 5 seconds on each visit to the page
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowGreetingPill(false);
    }, 5000);
    return () => clearTimeout(timer);
  }, []);

  // Align the open chat sheet to the full width of `.shell` and adjust height when the mobile keyboard opens
  const updateDrawerLayout = useCallback(() => {
    if (!avatarBtnRef.current) return;

    const btnRect = avatarBtnRef.current.getBoundingClientRect();
    const shellEl = avatarBtnRef.current.closest(".shell") || document.documentElement;
    const shellRect = shellEl.getBoundingClientRect();

    // Center the upward triangle pointer directly under the Blume chat head
    const pointerRight = Math.max(
      12,
      shellRect.right - btnRect.right + btnRect.width / 2 - 10
    );

    // Shrink height when the mobile keyboard opens so the input bar stays visible above it
    const vv = window.visualViewport;
    const visibleBottom = vv ? vv.offsetTop + vv.height : window.innerHeight;
    const effectiveBottom = Math.min(shellRect.bottom, visibleBottom);

    const drawerTop = btnRect.bottom + 10;
    const availableHeight = Math.max(160, effectiveBottom - drawerTop);

    setDrawerMetrics({
      top: `${drawerTop}px`,
      left: `${shellRect.left}px`,
      width: `${shellRect.width}px`,
      height: `${availableHeight}px`,
      pointerRight: `${pointerRight}px`,
    });

    if (chatListRef.current) {
      chatListRef.current.scrollTop = chatListRef.current.scrollHeight;
    }
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    const vv = window.visualViewport;
    window.addEventListener("resize", updateDrawerLayout);
    window.addEventListener("scroll", updateDrawerLayout, true);
    vv?.addEventListener("resize", updateDrawerLayout);
    vv?.addEventListener("scroll", updateDrawerLayout);

    return () => {
      window.removeEventListener("resize", updateDrawerLayout);
      window.removeEventListener("scroll", updateDrawerLayout, true);
      vv?.removeEventListener("resize", updateDrawerLayout);
      vv?.removeEventListener("scroll", updateDrawerLayout);
    };
  }, [isOpen, updateDrawerLayout]);

  // Auto-scroll to the newest message whenever a message is sent or the chat opens
  useEffect(() => {
    if (isOpen && chatListRef.current) {
      chatListRef.current.scrollTop = chatListRef.current.scrollHeight;
    }
  }, [messages, isOpen]);

  // Close the chat sheet when clicking outside of it
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
    setShowGreetingPill(false);
    setIsOpen((prev) => {
      const next = !prev;
      if (next) updateDrawerLayout();
      return next;
    });
  };

  // TODO: Connect to Firestore AI session saving here if chat persistence is required.
  const handleSend = (e) => {
    e.preventDefault();
    const trimmed = inputText.trim();
    if (!trimmed) return;

    const picksContext = buildUserPicksContext(draftBouquet, currentStep);
    const promptWithPicks = `${picksContext.summaryPrompt} User asks: ${trimmed}`;

    // DEBUG: Uncomment below to inspect the formatted prompt in the browser console
    // console.log("[BLUME PROMPT]:", promptWithPicks);

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
      {/* Greeting pill (auto-hides after 5s or when chat opens) */}
      {!isOpen && showGreetingPill && (
        <button
          type="button"
          className="blume__greeting-pill"
          onClick={handleToggle}
        >
          Hi I&apos;m <strong>Blume</strong>, your AI Assistant. Ask me anything!
        </button>
      )}

      {/* Blume circular chat-head button */}
      <button
        ref={avatarBtnRef}
        type="button"
        className="blume__avatar-btn"
        onClick={handleToggle}
        aria-expanded={isOpen}
        aria-label={isOpen ? "Close Blume AI chat" : "Open Blume AI chat"}
      >
        <BlumeBotIcon />
        <span className="blume__status-dot" aria-hidden="true" />
      </button>

      {/* Open Messenger-style full-width chat sheet */}
      {isOpen && (
        <section
          className="blume__drawer"
          aria-label="Blume AI Assistant Chat"
          style={{
            top: drawerMetrics.top,
            left: drawerMetrics.left,
            width: drawerMetrics.width,
            height: drawerMetrics.height,
            "--blume-pointer-right": drawerMetrics.pointerRight,
          }}
        >
          <header className="blume__header">
            <div className="blume__header-info">
              <span className="blume__header-avatar" aria-hidden="true">
                <BlumeBotIcon className="blume__mini-img" />
              </span>
              <span className="blume__header-title">Blume • AI Assistant</span>
            </div>
            <button
              type="button"
              className="blume__close-btn"
              onClick={() => setIsOpen(false)}
              aria-label="Minimize Blume chat"
            >
              ✕
            </button>
          </header>

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

          <form className="blume__form" onSubmit={handleSend}>
            <input
              type="text"
              className="blume__input"
              placeholder="Ask Blume.."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onFocus={updateDrawerLayout}
              aria-label="Ask Blume"
            />
            <button
              type="submit"
              className="blume__send-btn"
              disabled={!inputText.trim()}
              aria-label="Send message"
            >
              <svg
                width="20"
                height="20"
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

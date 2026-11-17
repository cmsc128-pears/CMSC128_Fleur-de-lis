import { useCallback, useEffect, useRef, useState } from "react";
import { getBlumeResponse } from "../../services/blumeService";
import blumeAvatar from "../../assets/images/blume.png";
import "./FloatingBlume.css";

// TODO: Pass `userInitials`, `draftBouquet`, and `currentStep` from ManualCustomize.jsx
export default function FloatingBlume({
  userInitials = "FN",
  draftBouquet = {},
  currentStep = 1,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [showPill, setShowPill] = useState(true);
  const [inputText, setInputText] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [interactionId, setInteractionId] = useState(undefined);
  const [sheetStyle, setSheetStyle] = useState({});
  const [messages, setMessages] = useState([
    {
      id: "welcome",
      sender: "blume",
      text: "Hi! I'm Blume. Ask me what flowers, fillers, or wrappers match your picks!",
    },
  ]);

  const chatListRef = useRef(null);
  const containerRef = useRef(null);
  const avatarBtnRef = useRef(null);

  // Show the greeting pill for 5 seconds on each visit to the page
  useEffect(() => {
    const timer = setTimeout(() => setShowPill(false), 5000);
    return () => clearTimeout(timer);
  }, []);

  // Match the phone frame's width and resize height when the mobile keyboard opens
  const syncSheetPosition = useCallback(() => {
    if (!avatarBtnRef.current) return;

    const btn = avatarBtnRef.current.getBoundingClientRect();
    const shell = (avatarBtnRef.current.closest(".shell") || document.documentElement).getBoundingClientRect();
    const vv = window.visualViewport;

    const visibleBottom = vv ? vv.offsetTop + vv.height : window.innerHeight;
    const top = btn.bottom + 10;
    const height = Math.max(160, Math.min(shell.bottom, visibleBottom) - top);
    const pointerRight = Math.max(12, shell.right - btn.right + btn.width / 2 - 10);

    setSheetStyle({
      top: `${top}px`,
      left: `${shell.left}px`,
      width: `${shell.width}px`,
      height: `${height}px`,
      "--blume-pointer-right": `${pointerRight}px`,
    });
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    const vv = window.visualViewport;
    window.addEventListener("resize", syncSheetPosition);
    vv?.addEventListener("resize", syncSheetPosition);
    return () => {
      window.removeEventListener("resize", syncSheetPosition);
      vv?.removeEventListener("resize", syncSheetPosition);
    };
  }, [isOpen, syncSheetPosition]);

  // Scroll to the bottom when a new message arrives or the chat opens
  useEffect(() => {
    if (isOpen && chatListRef.current) {
      chatListRef.current.scrollTop = chatListRef.current.scrollHeight;
    }
  }, [messages, isOpen]);

  // Close when clicking outside the chat
  useEffect(() => {
    const onOutsideClick = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    if (isOpen) document.addEventListener("mousedown", onOutsideClick);
    return () => document.removeEventListener("mousedown", onOutsideClick);
  }, [isOpen]);

  const toggleChat = () => {
    setShowPill(false);
    setIsOpen((prev) => {
      if (!prev) syncSheetPosition();
      return !prev;
    });
  };

  const handleSend = async (e) => {
    e.preventDefault();
    const trimmed = inputText.trim();
    if (!trimmed || isSending) return;

    const userMsg = { id: `u_${Date.now()}`, sender: "user", text: trimmed };
    setMessages((prev) => [...prev, userMsg]);
    setInputText("");
    setIsSending(true);

    const { replyText, imageUrl, nextInteractionId } = await getBlumeResponse({
      userText: trimmed,
      draftBouquet,
      currentStep,
      previousInteractionId: interactionId,
    });

    if (nextInteractionId) setInteractionId(nextInteractionId);

    const botMsg = {
      id: `b_${Date.now()}`,
      sender: "blume",
      text: replyText,
      imageUrl,
    };
    setMessages((prev) => [...prev, botMsg]);
    setIsSending(false);
  };

  return (
    <div className="blume" ref={containerRef}>
      {!isOpen && showPill && (
        <button type="button" className="blume__greeting-pill" onClick={toggleChat}>
          Hi I&apos;m <strong>Blume</strong>, your AI Assistant. Ask me anything!
        </button>
      )}

      <button
        ref={avatarBtnRef}
        type="button"
        className="blume__avatar-btn"
        onClick={toggleChat}
        aria-expanded={isOpen}
        aria-label={isOpen ? "Close Blume AI chat" : "Open Blume AI chat"}
      >
        <img src={blumeAvatar} alt="" className="blume__bot-img" aria-hidden="true" />
        <span className="blume__status-dot" aria-hidden="true" />
      </button>

      {isOpen && (
        <section className="blume__drawer" style={sheetStyle} aria-label="Blume AI Assistant Chat">
          <header className="blume__header">
            <div className="blume__header-info">
              <span className="blume__header-avatar" aria-hidden="true">
                <img src={blumeAvatar} alt="" className="blume__mini-img" />
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
                    <img src={blumeAvatar} alt="" className="blume__mini-img" />
                  </span>
                  <div className="blume__bubble blume__bubble--bot">
                    {msg.text}
                    {msg.imageUrl && (
                      <img
                        src={msg.imageUrl}
                        alt="AI bouquet preview"
                        className="blume__preview-img"
                        loading="lazy"
                      />
                    )}
                  </div>
                </div>
              ) : (
                <div key={msg.id} className="blume__row blume__row--user">
                  <div className="blume__bubble blume__bubble--user">{msg.text}</div>
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
              onFocus={syncSheetPosition}
              aria-label="Ask Blume"
            />
            <button
              type="submit"
              className="blume__send-btn"
              disabled={!inputText.trim() || isSending}
              aria-label="Send message"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
              </svg>
            </button>
          </form>
        </section>
      )}
    </div>
  );
}

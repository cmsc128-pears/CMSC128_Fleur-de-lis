import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { getBlumeResponse } from "../../services/blumeService";
import blumeAvatar from "../../assets/images/blume.png";
import "./FloatingBlume.css";

// ---------- message text formatting ----------

// Converts **bold** and *italic* text into <strong> and <em>
function renderInlineText(line) {
  const parts = line.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={i}>{part.slice(2, -2)}</strong>;
    }
    if (part.startsWith("*") && part.endsWith("*")) {
      return <em key={i}>{part.slice(1, -1)}</em>;
    }
    return part;
  });
}

// Converts headings (###), bullet lists (-), and paragraphs into chat elements
function renderFormattedMessage(text = "") {
  const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);
  const blocks = [];
  let listItems = [];

  // Wraps consecutive bullet items in a <ul>
  const flushList = (key) => {
    if (listItems.length > 0) {
      blocks.push(
        <ul key={`list_${key}`} className="blume__msg-list">
          {listItems}
        </ul>
      );
      listItems = [];
    }
  };

  lines.forEach((line, idx) => {
    if (/^#{1,4}\s+/.test(line)) {
      flushList(idx);
      const headingText = line.replace(/^#{1,4}\s+/, "");
      blocks.push(
        <h4 key={`h_${idx}`} className="blume__msg-heading">
          {renderInlineText(headingText)}
        </h4>
      );
    } else if (/^[-•*]\s+/.test(line)) {
      const itemText = line.replace(/^[-•*]\s+/, "");
      listItems.push(<li key={`li_${idx}`}>{renderInlineText(itemText)}</li>);
    } else {
      flushList(idx);
      blocks.push(
        <p key={`p_${idx}`} className="blume__msg-para">
          {renderInlineText(line)}
        </p>
      );
    }
  });

  flushList("end");
  return blocks;
}

// ---------- FloatingBlume component ----------
export default function FloatingBlume({
  userInitials = "FN",
  draftBouquet = {},
  currentStep = 1,
}) {
  // state and refs
  const [isOpen, setIsOpen] = useState(false);
  const [showPill, setShowPill] = useState(true);
  const [inputText, setInputText] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isCompact, setIsCompact] = useState(false);
  const [interactionId, setInteractionId] = useState(undefined);
  const [sheetStyle, setSheetStyle] = useState({});
  const [messages, setMessages] = useState([
    {
      id: "welcome",
      sender: "blume",
      text: "Hi! I'm Blume 🌸 Your Fleur AI florist friend! Ask me what blooms, fillers, or wrappers match your picks ✨",
    },
  ]);

  const chatListRef = useRef(null);
  const containerRef = useRef(null);
  const drawerRef = useRef(null);
  const avatarBtnRef = useRef(null);
  const inputRef = useRef(null);

  // auto-resize textarea up to 3 lines, then scroll vertically
  const resizeTextarea = (el) => {
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 78)}px`;
  };

  // hide greeting pill after 5 seconds
  useEffect(() => {
    const timer = setTimeout(() => setShowPill(false), 5000);
    return () => clearTimeout(timer);
  }, []);

  // fit chat sheet below Blume without overlapping the chat head, and adjust height for keyboard
  const syncSheetPosition = useCallback(() => {
    if (!avatarBtnRef.current) return;

    const btn = avatarBtnRef.current.getBoundingClientRect();
    const shellEl = avatarBtnRef.current.closest(".shell") || document.documentElement;
    const shell = shellEl.getBoundingClientRect();
    const vv = window.visualViewport;

    const visibleBottom = vv ? vv.offsetTop + vv.height : window.innerHeight;
    const bottomEdge = Math.min(shell.bottom, visibleBottom);

    // 12px gap below Blume so the 10px upward triangle sits 2px below the chat head and never covers it
    const top = btn.bottom + 12;
    const height = Math.max(110, bottomEdge - top);
    const pointerRight = Math.max(12, shell.right - btn.right + btn.width / 2 - 10);

    const compact = visibleBottom < shell.bottom - 80;
    setIsCompact((prev) => (prev === compact ? prev : compact));
    setSheetStyle((prev) => {
      const nextTop = `${Math.round(top)}px`;
      const nextLeft = `${Math.round(shell.left)}px`;
      const nextWidth = `${Math.round(shell.width)}px`;
      const nextHeight = `${Math.round(height)}px`;
      const nextPointer = `${Math.round(pointerRight)}px`;

      if (
        prev.top === nextTop &&
        prev.left === nextLeft &&
        prev.width === nextWidth &&
        prev.height === nextHeight &&
        prev["--blume-pointer-right"] === nextPointer
      ) {
        return prev;
      }

      return {
        top: nextTop,
        left: nextLeft,
        width: nextWidth,
        height: nextHeight,
        "--blume-pointer-right": nextPointer,
      };
    });
  }, []);

  // follow Blume in real time when the pull-up tab is dragged or when the mobile keyboard changes
  useEffect(() => {
    if (!isOpen) return;
    const vv = window.visualViewport;
    let rafId;

    const trackPosition = () => {
      syncSheetPosition();
      rafId = requestAnimationFrame(trackPosition);
    };
    rafId = requestAnimationFrame(trackPosition);

    window.addEventListener("resize", syncSheetPosition);
    vv?.addEventListener("resize", syncSheetPosition);
    vv?.addEventListener("scroll", syncSheetPosition);
    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("resize", syncSheetPosition);
      vv?.removeEventListener("resize", syncSheetPosition);
      vv?.removeEventListener("scroll", syncSheetPosition);
    };
  }, [isOpen, syncSheetPosition]);

  // auto-scroll to latest message
  useEffect(() => {
    if (isOpen && chatListRef.current) {
      chatListRef.current.scrollTop = chatListRef.current.scrollHeight;
    }
  }, [messages, isOpen, isSending]);

  // close chat when clicking outside (ignores the pull-up tab bar so you can drag it while chat is open)
  useEffect(() => {
    const onOutsideClick = (e) => {
      const clickedButton = containerRef.current?.contains(e.target);
      const clickedDrawer = drawerRef.current?.contains(e.target);
      const clickedPullGrip = e.target.closest?.(".drawer__grip");
      if (!clickedButton && !clickedDrawer && !clickedPullGrip) {
        setIsOpen(false);
      }
    };
    if (isOpen) document.addEventListener("mousedown", onOutsideClick);
    return () => document.removeEventListener("mousedown", onOutsideClick);
  }, [isOpen]);

  // toggle chat sheet open or closed
  const toggleChat = () => {
    setShowPill(false);
    setIsOpen((prev) => {
      if (!prev) syncSheetPosition();
      return !prev;
    });
  };

  // send message to Blume and append reply
  const handleSend = async (e) => {
    e.preventDefault();
    const trimmed = inputText.trim();
    if (!trimmed || isSending) return;

    const userMsg = { id: `u_${Date.now()}`, sender: "user", text: trimmed };
    setMessages((prev) => [...prev, userMsg]);
    setInputText("");
    if (inputRef.current) inputRef.current.style.height = "auto";
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

  // mount chat overlay directly on .shell
  const portalTarget =
    (typeof document !== "undefined" && document.querySelector(".shell")) ||
    (typeof document !== "undefined" ? document.body : null);

  return (
    <div
      className="blume"
      ref={containerRef}
      onPointerDown={(e) => e.stopPropagation()}
      onPointerUp={(e) => e.stopPropagation()}
      onKeyDown={(e) => e.stopPropagation()}
    >
      {/* 5-second greeting pill */}
      {!isOpen && showPill && (
        <button type="button" className="blume__greeting-pill" onClick={toggleChat}>
          Hi! I&apos;m <strong>Blume</strong>, your AI<br />Assistant. Ask me anything!
        </button>
      )}

      {/* Blume button on drawer edge */}
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

      {/* full-width chat overlay */}
      {isOpen &&
        portalTarget &&
        createPortal(
          <section
            ref={drawerRef}
            className={`blume__drawer${isCompact ? " blume__drawer--compact" : ""}`}
            style={sheetStyle}
            aria-label="Blume AI Assistant Chat"
          >
            {/* header */}
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

            {/* messages list */}
            <div className="blume__messages" ref={chatListRef}>
              {messages.map((msg) =>
                msg.sender === "blume" ? (
                  <div key={msg.id} className="blume__row blume__row--bot">
                    <span className="blume__mini-avatar" aria-hidden="true">
                      <img src={blumeAvatar} alt="" className="blume__mini-img" />
                    </span>
                    <div className="blume__bubble blume__bubble--bot">
                      {renderFormattedMessage(msg.text)}
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

              {/* typing indicator */}
              {isSending && (
                <div className="blume__row blume__row--bot" role="status" aria-label="Blume is typing">
                  <span className="blume__mini-avatar" aria-hidden="true">
                    <img src={blumeAvatar} alt="" className="blume__mini-img" />
                  </span>
                  <div className="blume__bubble blume__bubble--bot blume__bubble--typing">
                    <span className="blume__typing-dot" />
                    <span className="blume__typing-dot" />
                    <span className="blume__typing-dot" />
                  </div>
                </div>
              )}
            </div>

            {/* input bar */}
            <form className="blume__form" onSubmit={handleSend}>
              <textarea
                ref={inputRef}
                rows={1}
                className="blume__input"
                placeholder="Ask Blume.."
                value={inputText}
                onChange={(e) => {
                  setInputText(e.target.value);
                  resizeTextarea(e.target);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSend(e);
                  }
                }}
                onFocus={() => {
                  syncSheetPosition();
                  setTimeout(syncSheetPosition, 120);
                  setTimeout(syncSheetPosition, 300);
                }}
                onBlur={() => setTimeout(syncSheetPosition, 150)}
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
          </section>,
          portalTarget
        )}
    </div>
  );
}

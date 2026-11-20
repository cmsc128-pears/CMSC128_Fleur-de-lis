import { useEffect, useRef, useState } from "react";
import bookmarkIcon from "../assets/icons/bookmark.svg";
import chevronIcon from "../assets/icons/down-chevron.svg";
import downloadIcon from "../assets/icons/download.svg";
import sampleImage from "../assets/images/ai_img_sample.jpg"; //hardcoded image
import "./Preview.css";


const DOWNLOAD_OPTIONS = [
  { id: "image", label: "Download as image" },
  { id: "details", label: "Download as image with details" },
];

const CATEGORIES = [
  { key: "flowers", label: "Flowers" },
  { key: "fillers", label: "Fillers" },
  { key: "wrapper", label: "Wrapper" },
  { key: "addOns", label: "Add-ons" },
];

// hardcoded bouquet details
const DEMO_BOUQUET = {
  flowers: [
    { name: "Red Rose", color: "Red", quantity: 3 },
    { name: "Tulip", color: "Pink", quantity: 2 },
  ],
  fillers: [{ name: "Baby's Breath", quantity: 1 }],
  wrapper: { name: "Kraft Paper" },
  addOns: [{ name: "Ribbon", quantity: 1 }],
};

function Icon({ src, size = 22 }) {
  return (
    <span
      className="icon"
      aria-hidden="true"
      style={{ "--icon-src": `url("${src}")`, width: size, height: size }}
    />
  );
}


const itemsOf = (bouquet, key) => {
  const value = bouquet?.[key];
  if (!value) return [];
  return Array.isArray(value) ? value : [value];
};

const formatItem = (item) =>
  `${item.quantity > 1 ? `${item.quantity}× ` : ""}${item.name}`;

const plural = (n, word) => `${n} ${word}${n === 1 ? "" : "s"}`;

// one-line summary shown while the details are collapsed
function summarize(bouquet) {
  const flowers = itemsOf(bouquet, "flowers").reduce((sum, f) => sum + (f.quantity ?? 1), 0);
  const fillers = itemsOf(bouquet, "fillers").length;
  const wrapper = itemsOf(bouquet, "wrapper")[0];
  const addOns = itemsOf(bouquet, "addOns").length;

  const parts = [];
  if (flowers) parts.push(plural(flowers, "flower"));
  if (fillers) parts.push(plural(fillers, "filler"));
  if (wrapper) parts.push(wrapper.name);
  if (addOns) parts.push(plural(addOns, "add-on"));
  return parts.length ? parts.join(" · ") : "No details yet";
}

/**
 * imageSrc: the finished bouquet image.
 * bouquet: { flowers: [], fillers: [], wrapper: {} | null, addOns: [] }
 * The details are read-only.
 */
export default function Preview({
  imageSrc = sampleImage,        // TODO: drop the sample default once the real image is passed in
  bouquet = DEMO_BOUQUET,      
  onSaveDesign = () => {},
  onSaveImage = () => {},
  onCopyLink = () => {},
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const downloadRef = useRef(null);
  const detailsRef = useRef(null);

  const handlers = { image: onSaveImage, link: onCopyLink };

  // close either popover on outside tap or Escape
  useEffect(() => {
    if (!menuOpen && !detailsOpen) return;
    const onPointerDown = (e) => {
      if (menuOpen && !downloadRef.current?.contains(e.target)) setMenuOpen(false);
      if (detailsOpen && !detailsRef.current?.contains(e.target)) setDetailsOpen(false);
    };
    const onKey = (e) => {
      if (e.key === "Escape") {
        setMenuOpen(false);
        setDetailsOpen(false);
      }
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [menuOpen, detailsOpen]);

  const choose = (id) => {
    setMenuOpen(false);
    handlers[id]();
  };

  return (
    <main className="preview-page">
      <h1 className="preview-title">Your design is finished!</h1>

      <div className="preview-stage">
        <div className="preview-frame">
          {imageSrc ? (
            <img src={imageSrc} alt="Your finished bouquet design" />
          ) : (
            <div className="preview-frame-empty" />
          )}
        </div>
      </div>

      <section className="summary" ref={detailsRef}>
        <button
          type="button"
          className="summary__toggle"
          aria-expanded={detailsOpen}
          aria-controls="bouquet-details"
          onClick={() => setDetailsOpen((o) => !o)}
        >
          <span className="summary__text">
            <span className="summary__title">Bouquet details</span>
            <span className="summary__line">{summarize(bouquet)}</span>
          </span>
          <span className={`summary__chevron${detailsOpen ? " is-open" : ""}`}>
            <Icon src={chevronIcon} size={20} />
          </span>
        </button>

        {detailsOpen && (
          <div id="bouquet-details" className="summary__panel">
            <ul className="summary__list">
              {CATEGORIES.map(({ key, label }) => {
                const items = itemsOf(bouquet, key);
                return (
                  <li key={key} className="summary__row">
                    <h2 className="summary__label">{label}</h2>
                    {items.length ? (
                      <p className="summary__items">{items.map(formatItem).join(", ")}</p>
                    ) : (
                      <p className="summary__items summary__items--none">None</p>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </section>

      <div className="save-actions">
        <div className="download" ref={downloadRef}>
          <button
            type="button"
            className="btn btn-download"
            aria-haspopup="menu"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((o) => !o)}
          >
            <Icon src={downloadIcon} /> Download Design
            <span className={`btn-download__chevron${menuOpen ? " is-open" : ""}`}>
              <Icon src={chevronIcon} size={20} />
            </span>
          </button>

          {menuOpen && (
            <ul className="download__menu" role="menu">
              {DOWNLOAD_OPTIONS.map((opt) => (
                <li key={opt.id} role="none">
                  <button type="button" role="menuitem" onClick={() => choose(opt.id)}>
                    {opt.label}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <button type="button" className="btn btn-save" onClick={onSaveDesign}>
          <Icon src={bookmarkIcon} /> Save to Your Designs
        </button>
      </div>

      <p className="preview-disclaimer">
        <strong>Disclaimer:</strong> This is an AI-generated image for
        illustration purposes only. Actual product may vary.
      </p>
    </main>
  );
}
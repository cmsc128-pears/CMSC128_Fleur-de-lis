import { useState, useEffect, useRef } from "react";
import "./ItemDrawer.css";

const peso = new Intl.NumberFormat("en-PH", { style: "currency", currency: "PHP" });

const MOVE_THRESHOLD = 6;    // px before a press counts as a drag
const CLOSE_DISTANCE = 80;   // px dragged down that closes the drawer
const FLICK_SPEED    = 0.5;  // px/ms downward flick that closes it

const titleCase = (v) => v.split(/[-\s]+/).map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");

// most color names work directly as CSS colors. add overrides here for any that don't (e.g. peach)
const SWATCHES = { cream: "#FFFDD0", peach: "#FFDAB9" };

// item: { id, name, description, tags, colors, stock, price, image }
//   tags is display only. colors (array of lowercase names) is selectable; items without it get no Colors section
// initialQty: quantity already in the bouquet (null = not added yet)
// initialColor: color already chosen for that bouquet entry (null = none yet)
// onSave(item, qty, color): add or update in the bouquet
// onRemove(item): called when an already-added item is saved with quantity 0
// isGuest: guests cannot favorite, so the heart is hidden
export default function ItemDrawer({ item, initialQty, initialColor = null, onSave, onRemove, onClose, isGuest = false }) {
    const colors = item.colors ?? [];
    const [qty, setQty]           = useState(initialQty ?? 1);
    const [color, setColor]       = useState(colors.includes(initialColor) ? initialColor : null);
    const [favorite, setFavorite] = useState(false); // TEMP: local only, hook up to saved favorites later
    const isAdded = initialQty !== null;

    // drag the grip down to close
    const [dragY, setDragY] = useState(0);
    const drag = useRef(null);

    const handleDown = (e) => {
        drag.current = { startY: e.clientY, lastY: e.clientY, lastT: e.timeStamp, speed: 0, moved: false };
        e.currentTarget.setPointerCapture(e.pointerId);
    };

    const handleMove = (e) => {
        const d = drag.current;
        if (!d) return;
        const dy = e.clientY - d.startY;
        if (!d.moved && Math.abs(dy) < MOVE_THRESHOLD) return;
        d.moved = true;

        const dt = e.timeStamp - d.lastT;
        if (dt > 0) d.speed = (e.clientY - d.lastY) / dt;   // positive = moving down
        d.lastY = e.clientY;
        d.lastT = e.timeStamp;

        setDragY(Math.max(0, dy));                           // can't drag above rest position
    };

    const handleUp = (e) => {
        const d = drag.current;
        drag.current = null;
        if (!d) return;

        if (!d.moved) { onClose(); return; }                 // plain tap closes

        const dy = Math.max(0, e.clientY - d.startY);
        const idle = e.timeStamp - d.lastT > 100;            // finger paused before lifting
        const flick = !idle && d.speed > FLICK_SPEED;
        if (dy > CLOSE_DISTANCE || flick) onClose();
        else setDragY(0);                                    // snap back
    };

    const handleCancel = () => {
        drag.current = null;
        setDragY(0);
    };

    // quantity 0 on an added item removes it from the bouquet
    const isRemoving = isAdded && qty === 0;
    // items that have colors need one picked before they can be added
    const needsColor = colors.length > 0 && !color && qty > 0;
    const canSave    = !needsColor && (qty > 0 || isAdded);

    const handleSave = () => {
        if (qty === 0) onRemove(item);
        else onSave(item, qty, color);
        onClose();
    };

    return (
        <>
            <div
                className="item-drawer__backdrop"
                style={{ opacity: Math.max(0, 1 - dragY / 300) }}
                onClick={onClose}
            />
            <section
                className={`item-drawer${dragY > 0 ? " is-dragging" : ""}`}
                style={{ transform: `translateY(${dragY}px)` }}
                role="dialog"
                aria-label={item.name}
            >
                <button
                    type="button"
                    className="item-drawer__grip"
                    aria-label="Close"
                    onPointerDown={handleDown}
                    onPointerMove={handleMove}
                    onPointerUp={handleUp}
                    onPointerCancel={handleCancel}
                    onClick={(e) => e.detail === 0 && onClose()} /* keyboard only; taps close on pointer up */
                >
                    <span className="item-drawer__pill" aria-hidden="true" />
                </button>

                {/* only this part scrolls. the grip above and the actions below stay put */}
                <div className="item-drawer__scroll">
                    <div className="item-drawer__top">
                        <div className="item-drawer__img">
                            <img src={item.image} alt="" />
                        </div>

                        <div className="item-drawer__info">
                            <h2 className="item-drawer__name">{item.name}</h2>
                            <p className="item-drawer__desc">{item.description}</p>

                            {/* Tag pills moved here, header removed */}
                            {item.tags?.length > 0 && (
                                <ul className="item-drawer__tags">
                                    {item.tags.map((t) => (
                                        <li key={t} className="item-drawer__tag">{t}</li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    </div>

                    {(colors.length > 0 || item.stock != null) && (
                        <section className="item-drawer__meta">
                            <div className="item-drawer__meta-left">
                                {colors.length > 0 && (
                                    <h3 className="item-drawer__tags-title">
                                        Pick a color:
                                    </h3>
                                )}
                                {item.stock != null && (
                                    <span className="item-drawer__stock">{item.stock} in stock</span>
                                )}
                            </div>
                            {colors.length > 0 && (
                                <div className="item-drawer__colors" role="radiogroup" aria-label="Choose a color">
                                    {colors.map((c) => (
                                        <button
                                            key={c}
                                            type="button"
                                            role="radio"
                                            aria-checked={color === c}
                                            className="item-drawer__color"
                                            onClick={() => setColor(c)}
                                        >
                                            <span
                                                className="item-drawer__swatch"
                                                style={{ background: SWATCHES[c] ?? c }}
                                                aria-hidden="true"
                                            />
                                            {titleCase(c)}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </section>
                    )}

                    {/* Price and quantity moved below colors */}
                    <div className="item-drawer__buy">
                        <span className="item-drawer__price">{peso.format(item.price * qty)}</span>
                        <div className="item-drawer__qty">
                            <button
                                type="button"
                                aria-label="Decrease quantity"
                                disabled={qty <= 0}
                                onClick={() => setQty((q) => q - 1)}
                            >
                                −
                            </button>
                            <span aria-live="polite">{qty}</span>
                            <button
                                type="button"
                                aria-label="Increase quantity"
                                onClick={() => setQty((q) => q + 1)}
                            >
                                +
                            </button>
                        </div>
                    </div>
                </div>

                <div className="item-drawer__actions">
                    {!isGuest && (
                        <button
                            type="button"
                            className={`item-drawer__heart${favorite ? " is-on" : ""}`}
                            aria-pressed={favorite}
                            aria-label="Favorite"
                            onClick={() => setFavorite((f) => !f)}
                        >
                            <svg viewBox="0 0 24 24" width="36" height="36" aria-hidden="true">
                                <path
                                    d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
                                    fill="currentColor"
                                    stroke="currentColor"
                                    strokeWidth="1"
                                    fillOpacity={favorite ? 1 : 0.35}
                                />
                            </svg>
                        </button>
                    )}

                    <button
                        type="button"
                        className="btn item-drawer__add"
                        disabled={!canSave}
                        onClick={handleSave}
                    >
                        {isRemoving
                            ? "Remove from Bouquet"
                            : needsColor
                                ? "Choose a Color"
                                : isAdded ? "Update Bouquet" : "Add to Bouquet"}
                    </button>
                </div>
            </section>
        </>
    );
}
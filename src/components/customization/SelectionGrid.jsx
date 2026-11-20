import "./SelectionGrid.css";

const peso = new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    minimumFractionDigits: 0,   // ₱60 instead of ₱60.00 to keep it compact
});

// items: [{ id, name, image, price?, color }]  (price is optional, e.g. wrappers have none)
// quantities: { [id]: qty } for items already in the bouquet (shown as selected + badge)
// onItemClick: called with the item when a card is clicked (parent opens the item drawer)
// showQuantity: false hides the quantity badge (e.g. wrappers). selected cards still get the outline
export default function SelectionGrid({ items, quantities = {}, onItemClick, showQuantity = true }) {
    return (
        <ul className="sel-grid">
            {items.map((item) => {
                const qty = quantities[item.id];
                const selected = qty > 0;
                return (
                    <li key={item.id}>
                        <button
                            type="button"
                            className={`sel-card${selected ? " is-selected" : ""}`}
                            aria-haspopup="dialog"
                            onClick={() => onItemClick(item)}
                        >
                            {selected && showQuantity && (
                                <span className="sel-card__qty" aria-label={`Quantity: ${qty}`}>
                                    {qty}
                                </span>
                            )}
                            <span className="sel-card__img">
                                <img src={item.image} alt="" />
                            </span>
                            <span className="sel-card__label">
                                <span className="sel-card__name">{item.name}</span>
                                {item.price != null && (
                                    <span className="sel-card__price">{peso.format(item.price)}</span>
                                )}
                            </span>
                        </button>
                    </li>
                );
            })}
        </ul>
    );
}
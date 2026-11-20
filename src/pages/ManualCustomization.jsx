import { useState, useLayoutEffect, useRef } from "react";
import Drawer from "../components/customization/Drawer";
import FloatingBlume from "../components/customization/FloatingBlume";
import SelectionGrid from "../components/customization/SelectionGrid";
import ItemDrawer from "../components/customization/ItemDrawer";
import "./ManualCustomization.css";

const STEPS = [
    { label: "Flowers",  key: "flowers", prompt: "Pick your flowers!" },
    { label: "Fillers",  key: "fillers", prompt: "Pick your fillers!" },
    { label: "Wrappers", key: "wrapper", prompt: "Pick your wrappers!" },
    { label: "Add-ons",  key: "addOns",  prompt: "Pick your add-ons!" },
];

// TEMP placeholder items
const CATALOG = {
    flowers: [
        { id: "rose",      name: "Rose",          price: 60, color: "Red",    image: "/flowers/rose.png",      description: "", tags: ["Attraction", "Red", "Love"] },
    ],
    fillers: [
    ],
    wrapper: [
        { id: "kraft",      name: "Kraft Paper", price: 30, color: "Brown", image: "/wrappers/kraft.png",      description: "Rustic brown paper with a natural look.", tags: ["Rustic", "Brown"] },
        { id: "cellophane", name: "Cellophane",  price: 25, color: "Clear", image: "/wrappers/cellophane.png", description: "Clear, glossy wrap that shows off the blooms.", tags: ["Clear", "Classic"] },
        { id: "korean",     name: "Korean Wrap", price: 45, color: "Cream", image: "/wrappers/korean.png",     description: "Soft layered paper in a modern style.",   tags: ["Modern", "Cream"] },
    ],
    addOns: [
        { id: "ribbon", name: "Ribbon",       price: 15,  color: "Red",   image: "/addons/ribbon.png", description: "A satin ribbon to finish the bouquet.", tags: ["Satin", "Red"] },
        { id: "card",   name: "Message Card", price: 20,  color: "White", image: "/addons/card.png",   description: "A small card for your personal note.",  tags: ["Personal", "White"] },
        { id: "teddy",  name: "Mini Teddy",   price: 120, color: "Brown", image: "/addons/teddy.png",  description: "A cuddly little bear to go with the flowers.", tags: ["Cute", "Brown"] },
    ],
};

// draft to compute prices later
const EMPTY_DRAFT = {
    items: { flowers: [], fillers: [], wrapper: [], addOns: [] },
};

const peso = new Intl.NumberFormat("en-PH", { style: "currency", currency: "PHP" })

export default function ManualCustomization({ onFinish, isGuest = false }) {
    const [step, setStep]             = useState(0);    // 0 to 3
    const [furthest, setFurthest]     = useState(0);    // highest step reached so far
    const [draft, setDraft]           = useState(EMPTY_DRAFT);
    const [activeItem, setActiveItem] = useState(null); // item whose drawer is open (null = closed)

    // drawer rests just below the header so it needs the header's height
    const headRef = useRef(null);
    const [headH, setHeadH] = useState(0);
    useLayoutEffect(() => {
        const el = headRef.current;
        const update = () => setHeadH(el.offsetHeight);
        update();
        const ro = new ResizeObserver(update);
        ro.observe(el);
        return () => ro.disconnect();
    }, []);

    const { flowers, fillers, wrapper, addOns } = draft.items;
    const hasFlowers = flowers.length > 0;
    const isLast = step === STEPS.length - 1;

    // each item needs a price (and qty, optional)
    const total = [...flowers, ...fillers, ...wrapper, ...addOns]
        .reduce((sum, it) => sum + (it.price ?? 0) * (it.quantity ?? 1), 0);

    // require flowers so later steps stay locked until one is picked
    const canReach = (i) => i === 0 || hasFlowers;

    const goTo = (i) => {
        if (!canReach(i)) return;
        setActiveItem(null); // close any open item drawer when changing steps
        setStep(i);
        setFurthest((f) => Math.max(f, i));
    };

    const handleNext = () => (isLast ? onFinish?.(draft) : goTo(step + 1));

    // items already added for the current step
    const key = STEPS[step].key;
    const currentEntries = draft.items[key];

    // { [id]: qty } so each grid card can show its quantity badge
    const quantities = Object.fromEntries(
        currentEntries.map((it) => [it.id, it.quantity ?? 1])
    );

    // clicking a card only opens the item drawer, nothing is added yet
    const openItem  = (item) => setActiveItem(item);
    const closeItem = () => setActiveItem(null);

    // quantity already in the bouquet for the open item (null = not added yet)
    const activeEntry = !activeItem
        ? null
        : currentEntries.find((it) => it.id === activeItem.id) ?? null;

    // add or update an item with a quantity. every step is multi-select
    const saveItem = (item, quantity) =>
        setDraft((d) => {
            const list = d.items[key];
            const exists = list.some((it) => it.id === item.id);
            return {
                items: {
                    ...d.items,
                    [key]: exists
                        ? list.map((it) => (it.id === item.id ? { ...it, quantity } : it))
                        : [...list, { ...item, quantity }],
                },
            };
        });

    // remove an item from the bouquet
    const removeItem = (item) =>
        setDraft((d) => ({
            items: { ...d.items, [key]: d.items[key].filter((it) => it.id !== item.id) },
        }));

    return (
        <main className="mc">
            <div className="mc__stage">
                <header ref={headRef} className="mc__head">
                    <h1 className="mc__title">Create Your Own</h1>
                    <p className="mc__sub">Finish selection steps to generate a bouquet.</p>

                    <nav aria-label="Bouquet steps">
                        <ol className="mc-stepper">
                            {STEPS.map(({ label }, i) => (
                                <li key={label} className={`mc-step${i <= furthest ? " is-reached" : ""}`}>
                                    <span className="mc-step__label">{label}</span>
                                    <button
                                        type="button"
                                        className="mc-step__dot"
                                        aria-current={i === step ? "step" : undefined}
                                        aria-label={`Step ${i + 1}: ${label}`}
                                        disabled={!canReach(i)}
                                        onClick={() => goTo(i)}
                                    >
                                        {i + 1}
                                    </button>
                                </li>
                            ))}
                        </ol>
                    </nav>
                </header>

                <Drawer
                    collapsedTop={headH}
                    handle={<FloatingBlume currentStep={step + 1} draftBouquet={draft} />}
                >
                    <h2 className="mc__prompt">Step {step + 1}: {STEPS[step].prompt}</h2>

                    <SelectionGrid
                        items={CATALOG[key]}
                        quantities={quantities}
                        onItemClick={openItem}
                    />
                </Drawer>
            </div>

            <footer className="mc-bar">
                <p className="mc-bar__label">
                    Estimated Total: <strong className="mc-bar__amount">{peso.format(total)}</strong>
                </p>
                <div className="mc-bar__actions">
                    {step > 0 && (
                        <button type="button" className="btn btn--outline" onClick={() => goTo(step - 1)}>
                            Back
                        </button>
                    )}
                    <button type="button" className="btn" disabled={!hasFlowers} onClick={handleNext}>
                        {isLast ? "Preview" : "Next"}
                    </button>
                </div>
            </footer>

            {/* outside the stage so it overlays the estimated total bar too. key resets its quantity per item */}
            {activeItem && (
                <ItemDrawer
                    key={activeItem.id}
                    item={activeItem}
                    initialQty={activeEntry ? activeEntry.quantity : null}
                    onSave={saveItem}
                    onRemove={removeItem}
                    onClose={closeItem}
                    isGuest={isGuest}
                />
            )}
        </main>
    );
}
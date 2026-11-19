import { useState, useLayoutEffect, useRef } from "react";
import Drawer from "../components/customization/Drawer";
import "./ManualCustomization.css";

const STEPS = ["Flowers","Fillers", "Wrappers", "Add-ons"];

// draft to compute prices later
const EMPTY_DRAFT = {
    items: { flowers: [], fillers: [], wrapper: null, addOns: [] },
};

const peso = new Intl.NumberFormat("en-PH", { style: "currency", currency: "PHP" })

export default function ManualCustomization({ onFinish }) {
    const [step, setStep]           = useState(0);    // 0 to 3
    const [furthest, setFurthest]   = useState(0);  // highest step reached so far
    const [draft, setDraft]         = useState(EMPTY_DRAFT);
    
    // drawer rests just below the header so it needs the header's height
    const headRef = useRef(null);
    const [headH, setHeadH] = useState(0);
    useLayoutEffect(() => {
        const el = headRef.current;
        const update  = () => setHeadH(el.offsetHeight);
        update();
        const ro = new ResizeObserver(update);
        ro.observe(el);
        return () => ro.disconnect();
    }, []);

    const { flowers, fillers, wrapper, addOns } = draft.items;
    const hasFlowers = flowers.length > 0;
    const isLast = step === STEPS.length - 1;

    // each item needs a price (and qty, optional)
    const total = [...flowers, ...fillers, ...(wrapper ? [wrapper] : []), ...addOns]
    .reduce((sum, it) => sum + (it.price ?? 0) * (it.quantity ?? 1), 0);

    // require flowers so later steps stay locked until one is picked
    const canReach = (i) => i === 0 || hasFlowers;

    const goTo = (i) => {
        if (!canReach(i)) return;
        setStep(i);
        setFurthest((f) => Math.max(f,i));
    };

    const handleNext = () => (isLast ? onFinish?.(draft) : goTo(step + 1));

    return (
        <main className="mc">
            <div className="mc__stage">
                <header ref={headRef} className="mc__head">
                    <h1 className="mc__title">Create Your Own</h1>
                    <p className="mc__sub">Finish selection steps to generate a bouquet.</p>

                    <nav aria-label="Bouquet steps">
                        <ol className="mc-stepper">
                            {STEPS.map((label, i) => (
                                <li key={label} className={`mc-step${i <= furthest ? " is-reached" : ""}`}>
                                    <span className="mc-step__label">{label}</span>
                                    <button
                                        type="button"
                                        className="mc-step__dot"
                                        aria-current={i ==step ? "step" : undefined}
                                        aria-label={`Step ${i + 1}: ${label}`}
                                        disabled={!canReach(i)}
                                        onClick={() => goTo(i)}
                                    >
                                        {i+1}
                                    </button>
                                </li>
                            ))}
                        </ol>
                    </nav>
                </header>

                {/* TEMP: tall dummy content for testing. sam & erine will replace */}
                <Drawer 
                    collapsedTop={headH}
                    handle={<div style={{ width: 96, height: 5, borderRadius: 999, background: "var(--COLOR-DOT)" }} />}
                >
                    <button
                        type="button"
                        className="btn btn--outline"
                        onClick={() =>
                            setDraft((d) => ({
                                items: {
                                    ...d.items,
                                    flowers: [...d.items.flowers, { name: "Red Rose", color: "Red", quantity: 1, price: 60 }],              
                                },
                            }))
                        }
                    >
                        TEMP: add a rose (₱60)
                    </button>
                    {Array.from({ length: 30 }, (_, i)=> (
                        <p key={i}>Placeholder row {i + 1}</p>
                    ))}
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
        </main>
    );
}
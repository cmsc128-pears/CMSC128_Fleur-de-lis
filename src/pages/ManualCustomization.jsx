import { useState } from "react";
import "./ManualCustomization.css";
import Drawer from "../components/customization/Drawer";

const STEPS = ["Flowers","Fillers", "Wrappers", "Add-ons"];

export default function ManualCustomization() {
    const [step, setStep] = useState(0);    // 0 to 3

    return (
        <main className="mc">
            <header className="mc__head">
                <h1 className="mc__title">Manual Customization</h1>
                <p className="mc__sub">Finish selection steps to generate a bouquet preview.</p>

                <nav aria-label="Bouquet steps">
                    <ol className="mc__stepper">
                        {STEPS.map((label, i) => (
                            <li key={label} className={`mc-step${i <= step ? " is-reached" : ""}`}>
                                <span className="mc-step__label">{label}</span>
                                <button
                                    type="button"
                                    className="mc-step__dot"
                                    aria-current={i ==step ? "step" : undefined}
                                    aria-label={`Step ${i + 1}: ${label}`}
                                    onClick={() => setStep(i)}
                                >
                                    {i+1}
                                </button>
                            </li>
                        ))}
                    </ol>
                </nav>
            </header>

            {/* TEMP: tall dummy content to test scrolling. sam & erine will replace */}
            <Drawer handle={<div style={{ width: 96, height: 5, borderRadius: 999, background: "var(--COLOR-DOT)" }} />}>
                        {Array.from({ length: 30 }, (_, i)=> (
                            <p key={i}>Placeholder row {i + 1}</p>
                        ))}
            </Drawer>
            
            <section className="mc-bar" />
        </main>
    );
}
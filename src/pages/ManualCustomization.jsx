import { useState } from "react";
import "./ManualCustomization.css";

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

            <section className="mc-drawer" />
            
            <section className="mc-bar" />
        </main>
    );
}
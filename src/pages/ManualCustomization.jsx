import { useState, useLayoutEffect, useRef } from "react";
import Drawer from "../components/customization/Drawer";
import FloatingBlume from "../components/customization/FloatingBlume";
import "./ManualCustomization.css";

const STEPS = ["Flowers","Fillers", "Wrappers", "Add-ons"];

export default function ManualCustomization() {
    const [step, setStep] = useState(0);    // 0 to 3

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

    return (
        <main className="mc">
            <div className="mc__stage">
                <header ref={headRef} className="mc__head">
                    <h1 className="mc__title">Manual Customization</h1>
                    <p className="mc__sub">Finish selection steps to generate a bouquet preview.</p>

                    <nav aria-label="Bouquet steps">
                        <ol className="mc-stepper">
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
                <Drawer 
                    collapsedTop={headH}
                    handle={
                        <>
                            <div style={{ width: 96, height: 5, borderRadius: 999, background: "var(--COLOR-DOT)" }} />
                            <FloatingBlume currentStep={step + 1} />
                        </>
                    }
                >
                    {Array.from({ length: 30 }, (_, i)=> (
                        <p key={i}>Placeholder row {i + 1}</p>
                    ))}
                </Drawer>
            </div>

            <section className="mc-bar" />
        </main>
    );
}

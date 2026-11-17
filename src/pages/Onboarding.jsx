import { useEffect, useRef, useState } from "react";
import { slides } from "./slides";
import "./Onboarding.css";

import logoImage from "../assets/images/logo.png";            // the "Fleur" wordmark (SVG or PNG)
import watermarkImage from "../assets/images/flower-watermark.png"; // faint plant silhouette behind the text

export default function Onboarding({ onBack, onLogin, onJoin, onGuest }) {
    const [index, setIndex] = useState(0);
    const last = slides.length - 1;
    const isLast = index === last;
    const startX = useRef(null);

    const go = (i) => setIndex(Math.min(Math.max(i, 0), last));

    // left arrow: previous slide, or back to the landing page from the first slide
    const goBack = () => (index === 0 ? onBack?.() : go(index - 1));

    // arrow keys
    useEffect(() => {
        const onKey = (e) => {
        if (e.key === "ArrowRight") setIndex((i) => Math.min(i + 1, last));
        if (e.key === "ArrowLeft") setIndex((i) => Math.max(i - 1, 0));
        };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [last]);

    // swipe
    const onPointerDown = (e) => { startX.current = e.clientX; };
    const onPointerUp = (e) => {
        if (startX.current == null) return;
        const dx = e.clientX - startX.current;
        startX.current = null;
        if (Math.abs(dx) > 48) go(index + (dx < 0 ? 1 : -1));
    };

    return (
        <main className="onboarding">
        {watermarkImage && (
            <img className="onboarding__watermark" src={watermarkImage} alt="" aria-hidden="true" />
        )}

        <p className="sr-only" aria-live="polite">Step {index + 1} of {slides.length}</p>

        <header className="onboarding__header">
            {logoImage ? (
            <img className="onboarding__logo" src={logoImage} alt="Fleur" />
            ) : (
            <span className="brand onboarding__logo-text">Fleur</span>
            )}
        </header>

        <div className="onboarding__viewport" onPointerDown={onPointerDown} onPointerUp={onPointerUp}>
            <div className="track" style={{ transform: `translateX(-${index * 100}%)` }}>
            {slides.map((s, i) => (
                <section key={s.id} className="slide" aria-hidden={i !== index}>
                {s.image ? (
                    <img className="slide__image" src={s.image} alt={s.alt} />
                    ) : (
                    <div className="slide__image slide__image--empty" aria-hidden="true" />
                )}
                <h2 className="brand slide__title">{s.title}</h2>
                <p className="slide__body">{s.body}</p>
                </section>
            ))}
            </div>
        </div>

        <div className="dots" role="group" aria-label="Onboarding progress">
            {slides.map((s, i) => (
            <button key={s.id} type="button" className="dot" aria-label={`Go to step ${i + 1}`}
                    aria-current={i === index} onClick={() => go(i)} />
            ))}
        </div>

        {/* Skip only on the first slide; Log In / Join Now / Continue as Guest on the last.
            The area keeps its height on every slide so nothing jumps. */}
        <div className="onboarding__actions">
            {index === 0 && (
            <button type="button" className="btn btn--outline onboarding__skip" onClick={() => go(last)}>
                Skip
            </button>
            )}

            {isLast && (
            <>
                <div className="onboarding__auth">
                <button type="button" className="btn btn--outline" onClick={onLogin}>Log In</button>
                <button type="button" className="btn" onClick={onJoin}>Join Now</button>
                </div>
                <button type="button" className="link onboarding__guest" onClick={onGuest}>
                Continue as Guest
                </button>
            </>
            )}
        </div>

        <nav className="onboarding__nav" aria-label="Onboarding">
            <button type="button" className="arrow" aria-label="Back" onClick={goBack}
                    disabled={index === 0 && !onBack}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M19 12H5M12 5l-7 7 7 7" />
            </svg>
            </button>
            <button type="button" className="arrow" aria-label="Next" onClick={() => go(index + 1)} disabled={isLast}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
            </button>
        </nav>
        </main>
    );
}

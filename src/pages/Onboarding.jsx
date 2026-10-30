import { useEffect, useRef, useState } from "react";
import ImageSlot from "../components/ImageSlot";
import { slides } from "./slides";

export default function Onboarding({ onGuest, onAuth }) {
    const [index, setIndex] = useState(0);
    const last = slides.length - 1;
    const startX = useRef(null);

    const go = (i) => setIndex(Math.min(Math.max(i, 0), last));

    // arrow keys
    useEffect(() => {
        const onKey = (e) => {
            if (e.key === "ArrowRight") setIndex((i) => Math.min(i + 1, last));
            if (e.key === "ArrowLeft") setIndex((i) => Math.max(i - 1, 0));
        };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [last]);

    //swipe
    const onPointerDown = (e) => { startX.current = e.clientX; };
    const onPointerUp   = (e) => {
        if (startX.current == null) return;
        const dx = e.clientX - startX.current;
        startX.current = null;
        if (Math.abs(dx) > 48) go(index + (dx < 0 ? 1 : -1));
    };

    const isLast = index === last;

    return (
        <main className="onboarding">
            <p className="sr-only" aria-live="polite">{index +1} of {slides.length}</p>

            <div className="onboarding__viewport" onPointerDown={onPointerDown} onPointerUp={onPointerUp}>
                <div className="track" style={{ transform: `translateX(-${index * 100}%)` }}>
                    {slides.map((s, i) => (
                        <section key={s.id} className="slide" aria-hidden={i !== index}>
                            <ImageSlot className="slide__image" src={s.image} alt={s.alt} />
                            <h1 className="brand slide__title">{s.title}</h1>
                            <p className="slide__body">{s.body}</p>
                        </section>
                    ))}
                </div>
            </div>

            {/*sign-in choices appear on the last step; space is reserved so nothing jumps*/}
            <div className="onboarding__actions">
                {isLast && (
                    <>
                        <button type="button" className="btn" onClick={onGuest}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                                <circle cx="12" cy="8" r="4.2" /><path d="M3.5 21c0-4.6 3.8-7.5 8.5-7.5s8.5 2.9 8.5 7.5z" />
                            </svg>
                            Log In as Guest
                        </button>
                        <button type="button" className="btn" onClick={onAuth}>Log in or Sign up</button>
                    </>
                )}
            </div>

            <div className="dots" role="group" aria-label="Onboarding progress">
                {slides.map((s, i) => (
                    <button key={s.id} type="button" className="dot" aria-label={`Go to step ${i+1}`} aria-current={i === index} onClick={() => go(i)} />
                ))}
            </div>

            <nav className="onboarding__nav" aria-label="Onboarding">
                {isLast ? (
                    <>
                        <button type="button" className="link" onClick={() => go(index - 1)}>back</button>
                        <span />
                    </>
                ) : (
                    <>
                        <button type="button" className="link" onClick={() => go(last)}>skip</button>
                        <button type="button" className="link" onClick={() => go(index + 1)}>next</button>
                    </>
                )}
            </nav>
        </main>
    );
}
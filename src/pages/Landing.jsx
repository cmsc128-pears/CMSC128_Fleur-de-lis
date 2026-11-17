/* ---------------------------------------------------------------
    landing.jsx
---------------------------------------------------------------- */
import "./Landing.css";

import heroImage from "../assets/images/hero-img.png";          // tall flower strip on the left
import logoImage from "../assets/images/logo.png";            // the "Fleur" wordmark (SVG or PNG)
import watermarkImage from "../assets/images/flower-watermark.png"; // faint plant silhouette behind the text

export default function Landing({ onStart }) {
    return (
        <main className="landing">
        {watermarkImage && (
            <img className="landing__watermark" src={watermarkImage} alt="" aria-hidden="true" />
        )}

        {heroImage ? (
            <img className="landing__hero" src={heroImage} alt="" />
        ) : (
            <div className="landing__hero landing__hero--empty" aria-hidden="true" />
        )}

        <section className="landing__copy">
            <h1 className="landing__logo">
            {logoImage ? (
                <img src={logoImage} alt="Fleur" />
            ) : (
                <span className="brand">Fleur</span>
            )}
            </h1>
            <p className="landing__text">
            From the first bloom to the final touch,
            <br />
            Fleur makes it easy to design a bouquet that&rsquo;s uniquely yours.
            </p>
        </section>

        <button type="button" className="btn landing__cta" onClick={onStart}>
            Get Started
        </button>
        </main>
    );
}

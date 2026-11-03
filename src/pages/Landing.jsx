import ImageSlot from "../components/ImageSlot";

export default function Landing({ onStart }) {
    return (
        <main className="landing">
            <ImageSlot className="landing__hero" src="src/assets/images/hero-sample.jpg" alt="" />

            <section className="landing__copy">
                <h1 className="landing__title">
                    flowers for you,
                    <em>fleur de lis</em>
                </h1>
                <p className="landing__text">bring your dream bouquet to life</p>
            </section>

            <button type="button" className="btn landing__cta" onClick={onStart}>
                Get Started
            </button>
        </main>
    );
}
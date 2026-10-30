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

            {/* taped-on photo that overlaps side image */}
            <figure className="landing__photo" >
                <ImageSlot src="src/assets/images/logo-sample.png" alt="" />
                <span className="tape tape--tl" aria-hidden="true" />
                <span className="tape tape--tr" aria-hidden="true" />
                <span className="tape tape--bl" aria-hidden="true" />
                <span className="tape tape--br" aria-hidden="true" />
            </figure>

            <button type="button" className="btn landing__cta" onClick={onStart}>
                Get Started
            </button>
        </main>
    );
}
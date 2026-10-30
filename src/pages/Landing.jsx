import ImageSlot from "../components/ImageSlot";

export default function Landing({ onStart }) {
    return (
        <main className="landing">
            <ImageSlot className="landing__hero" alt="" />

            <section className="landing__copy">
                <h1 className="landing__title">
                    flowers for you,
                    <em>fleur de lis</em>
                </h1>
                <p className="landing__text">lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do</p>
            </section>

            {/* taped-on photo that overlaps side image */}
            <figure className="landing__photo">
                <ImageSlot alt="" />
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
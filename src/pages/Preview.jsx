import "./Preview.css";

const STEPS = ["Flowers", "Fillers", "Wrappers", "Add-ons"];

const CheckIcon = () => (
  <svg>
  </svg>
);


/**
 * mode: manual shows edit bouquet buttons, ai skips them
 * imageSrc: the finished bouquet image
 */
export default function Preview({
  mode = "manual",
  imageSrc,
  onStepClick = () => {},
  onSaveTemplate = () => {},
  onSaveImage = () => {},
  onCopyLink = () => {},
}) {
  return (
    <main className="preview-page">
      <h1 className="preview-title">Your design is finished!</h1>

      <div className="preview-frame">
        {imageSrc ? (
          <img src="/assets/images/ai_img_sample.jpg" alt="Your finished bouquet design" />
        ) : (
          <div className="preview-frame-empty" />
        )}
      </div>

      {mode === "manual" && (
        <section className="edit-card" aria-labelledby="edit-heading">
          <div className="edit-card-head">
            <h2 id="edit-heading">Edit bouquet</h2>
            <p>Click a step button to go back and make changes.</p>
          </div>
          <nav aria-label="Edit bouquet steps">
            <ol className="mc-stepper">
              {STEPS.map((label, i) => (
                <li key={label} className="mc-step is-reached">
                  <span className="mc-step__label">{label}</span>
                  <button
                    type="button"
                    className="mc-step__dot"
                    aria-label={`Edit step ${i + 1}: ${label}`}
                    onClick={() => onStepClick(i)}
                  >
                    <CheckIcon />
                  </button>
                </li>
              ))}
            </ol>
          </nav>
        </section>
      )}

      <div className="save-actions">
        <button type="button" className="btn btn-template" onClick={onSaveTemplate}>
           Save as template
        </button>
        <button type="button" className="btn btn-image" onClick={onSaveImage}>
           Save as image
        </button>
        <button type="button" className="btn btn-link" onClick={onCopyLink}>
          Copy and share as link
        </button>
      </div>

      <p className="preview-disclaimer">
        <strong>Disclaimer:</strong> This is an AI-generated image for
        illustration purposes only. Actual product may vary.
      </p>
    </main>
  );
}
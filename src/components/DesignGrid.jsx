// Shows 6 empty grey cells when there are no designs yet.
// Each design is { id, name, imageUrl }. To swap a picture, just change its
// imageUrl in the data you pass in; nothing is hardcoded in this component.
// A design without an imageUrl renders as a grey cell instead of a broken image.
const PLACEHOLDER_COUNT = 6;

function DesignGrid({ designs = [] }) {
  if (designs.length === 0) {
    return (
      <section className="design-grid" aria-label="No designs yet">
        {Array.from({ length: PLACEHOLDER_COUNT }, (_, i) => (
          <div key={i} className="design-grid__item" />
        ))}
      </section>
    );
  }

  return (
    <section className="design-grid" aria-label="Designs">
      {designs.map((design) => (
        <div key={design.id} className="design-grid__item">
          {design.imageUrl && (
            <img src={design.imageUrl} alt={design.name ?? ""} loading="lazy" />
          )}
        </div>
      ))}
    </section>
  );
}

export default DesignGrid;
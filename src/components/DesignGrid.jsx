// shows 6 empty grey cells when there are no designs yet (matches the wireframe)
const PLACEHOLDER_COUNT = 6;

function DesignGrid({ designs }) {
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
    <section className="design-grid">
      {designs.map((design) => (
        <div key={design.id} className="design-grid__item">
          <img src={design.imageUrl} alt={design.name} />
        </div>
      ))}
    </section>
  );
}

export default DesignGrid;
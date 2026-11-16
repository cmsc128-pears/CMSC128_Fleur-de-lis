const EMPTY_MESSAGES = {
  your: "You haven't made any designs yet.",
  liked: "Designs you like will show up here.",
};
const DEFAULT_EMPTY_MESSAGE = "No designs yet.";

function DesignGrid({ designs, type }) {
  // covers undefined, null and an empty array
  if (!designs || designs.length === 0) {
    return (
      <p className="profile__empty">
        {EMPTY_MESSAGES[type] ?? DEFAULT_EMPTY_MESSAGE}
      </p>
    );
  }

  return (
    <section className="design-grid">
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
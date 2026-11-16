function ProfileCard({ profile }) {
  const initials = `${profile.firstName?.[0] ?? ""}${profile.lastName?.[0] ?? ""}`.toUpperCase();
  const fullName = `${profile.firstName ?? ""} ${profile.lastName ?? ""}`.trim();

  return (
    <section className="profile-card">
      <div className="avatar profile-card__avatar">{initials}</div>
      <div className="profile-card__info">
        <h1 className="profile-card__name">{fullName}</h1>
        <p className="profile-card__line">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M20 4H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2zm0 4-8 5-8-5V6l8 5 8-5v2z" />
          </svg>
          {profile.email}
        </p>
        <p className="profile-card__line">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M6.6 10.8a15.1 15.1 0 0 0 6.6 6.6l2.2-2.2a1 1 0 0 1 1-.25 11.4 11.4 0 0 0 3.6.57 1 1 0 0 1 1 1V20a1 1 0 0 1-1 1A17 17 0 0 1 3 4a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1c0 1.25.2 2.45.57 3.57a1 1 0 0 1-.25 1z" />
          </svg>
          {profile.contactNumber}
        </p>
      </div>
    </section>
  );
}

export default ProfileCard;
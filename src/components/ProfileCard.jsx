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
      </div>
    </section>
  );
}

export default ProfileCard;
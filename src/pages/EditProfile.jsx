import { useState } from "react";
import useUserProfile from "../services/userUserProfile.js";
import { auth } from "../services/firebase";
import { updateUserProfile } from "../services/userService";
import "./EditProfile.css";

function EditProfileForm({ profile, onBack }) {
  const [firstName, setFirstName] = useState(profile.firstName ?? "");
  const [lastName, setLastName] = useState(profile.lastName ?? "");
  const [contactNumber, setContactNumber] = useState(profile.contactNumber ?? "");
  const [email, setEmail] = useState(profile.email ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const initials = `${firstName[0] ?? ""}${lastName[0] ?? ""}`.toUpperCase();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const user = auth.currentUser;
    if (!user) {
      setError("You need to be logged in to save changes.");
      return;
    }

    setSaving(true);
    try {
      await updateUserProfile(user.uid, { firstName, lastName, contactNumber, email });
      onBack();
    } catch (err) {
      console.error(err);
      setError("Could not save your changes.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="edit">
      <header className="topbar">
        <div className="topbar__logo">LOGO</div>
        <span className="topbar__brand">fleur de lis</span>
      </header>

      <div className="edit__body">
        <button type="button" className="edit__back" onClick={onBack}>
          <span aria-hidden="true">←</span> Edit Profile
        </button>

        <div className="edit__avatar">
          <div className="avatar avatar--lg">{initials}</div>
          <button type="button" className="edit__avatar-btn" aria-label="Change photo">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M3 17.25V21h3.75L17.8 9.94l-3.75-3.75L3 17.25zm17.7-10.2a1 1 0 0 0 0-1.41l-2.34-2.34a1 1 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" />
            </svg>
          </button>
        </div>

        <form className="form" onSubmit={handleSubmit}>
          <h2 className="form__section">Personal Information</h2>

          <div className="form__row">
            <label className="field">
              <span className="field__label">First Name *</span>
              <input
                className="field__input"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
              />
            </label>
            <label className="field">
              <span className="field__label">Last Name *</span>
              <input
                className="field__input"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
              />
            </label>
          </div>

          <label className="field">
            <span className="field__label">Contact Number *</span>
            <input
              className="field__input"
              type="tel"
              value={contactNumber}
              onChange={(e) => setContactNumber(e.target.value)}
              required
            />
          </label>

          <label className="field">
            <span className="field__label">Email Address</span>
            <input
              className="field__input"
              type="email"
              placeholder="e.g. myemail@address.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </label>

          <button type="button" className="form__link-row">
            Change Password
            <span aria-hidden="true">›</span>
          </button>

          {error && <p className="form__error" role="alert">{error}</p>}

          <button type="submit" className="btn form__save" disabled={saving}>
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </form>
      </div>
    </main>
  );
}

export default function EditProfile({ onBack }) {
  const { profile, loading, error } = useUserProfile();

  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;
  if (!profile) return <p>Please log in to edit your profile.</p>;

  return <EditProfileForm profile={profile} onBack={onBack} />;
}
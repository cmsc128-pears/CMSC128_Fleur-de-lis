import { useState } from "react";
import {
  EmailAuthProvider,
  reauthenticateWithCredential,
  sendPasswordResetEmail,
  updatePassword,
} from "firebase/auth";
import { auth } from "../services/firebase";
import "./ChangePassword.css";

const MIN_LENGTH = 8;

// turn Firebase error codes into messages a person can act on
function friendlyError(err) {
  switch (err?.code) {
    case "auth/wrong-password":
    case "auth/invalid-credential":
      return "Your current password is incorrect.";
    case "auth/weak-password":
      return `Your new password must be at least ${MIN_LENGTH} characters.`;
    case "auth/too-many-requests":
      return "Too many attempts. Please wait a moment and try again.";
    case "auth/requires-recent-login":
      return "For security, please log out and log back in, then try again.";
    case "auth/network-request-failed":
      return "Network error. Check your connection and try again.";
    default:
      return "Could not change your password. Please try again.";
  }
}

function ChangePassword({ onBack }) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setNotice("");

    const user = auth.currentUser;
    if (!user) {
      setError("You need to be logged in to change your password.");
      return;
    }

    // accounts that sign in with Google etc. don't have a password to change
    const hasPassword = user.providerData.some((p) => p.providerId === "password");
    if (!hasPassword) {
      setError("This account signs in with another provider, so it has no password to change.");
      return;
    }

    if (newPassword.length < MIN_LENGTH) {
      setError(`Your new password must be at least ${MIN_LENGTH} characters.`);
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Your new passwords don't match.");
      return;
    }
    if (newPassword === currentPassword) {
      setError("Your new password must be different from your current one.");
      return;
    }

    setSaving(true);
    try {
      // Firebase needs a recent sign-in before a password change,
      // so confirm the current password first.
      const credential = EmailAuthProvider.credential(user.email, currentPassword);
      await reauthenticateWithCredential(user, credential);
      await updatePassword(user, newPassword);
      onBack();
    } catch (err) {
      console.error(err);
      setError(friendlyError(err));
    } finally {
      setSaving(false);
    }
  };

  const handleForgot = async () => {
    setError("");
    setNotice("");

    const user = auth.currentUser;
    if (!user?.email) {
      setError("You need to be logged in to reset your password.");
      return;
    }

    try {
      await sendPasswordResetEmail(auth, user.email);
      setNotice(`We sent a password reset link to ${user.email}.`);
    } catch (err) {
      console.error(err);
      setError(friendlyError(err));
    }
  };

  return (
    <main className="password">
      <div className="password__body">
        <button type="button" className="password__back" onClick={onBack}>
          <span aria-hidden="true">←</span> Change Password
        </button>

        <p className="password__intro">
          You’ll use this password the next time you log in to your account. Use at least{" "}
          {MIN_LENGTH} characters.
        </p>

        <form className="password__form" onSubmit={handleSubmit}>
          <label className="password__field">
            <span className="password__label">Current Password</span>
            <input
              className="password__input"
              type="password"
              autoComplete="current-password"
              placeholder="Your current password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
            />
          </label>

          <label className="password__field">
            <span className="password__label">New Password</span>
            <input
              className="password__input"
              type="password"
              autoComplete="new-password"
              placeholder={`Must be at least ${MIN_LENGTH} characters`}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
          </label>

          <label className="password__field">
            <span className="password__label">Confirm New Password</span>
            <input
              className="password__input"
              type="password"
              autoComplete="new-password"
              placeholder={`Must be at least ${MIN_LENGTH} characters`}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </label>

          <button type="button" className="password__forgot" onClick={handleForgot}>
            Forgot your current password?
          </button>

          {error && <p className="password__error" role="alert">{error}</p>}
          {notice && <p className="password__notice" role="status">{notice}</p>}

          <button type="submit" className="password__save" disabled={saving}>
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </form>
      </div>
    </main>
  );
}

export default ChangePassword;
import { useState } from "react";
import useUserProfile from "../services/userUserProfile.js";
import ProfileCard from "../components/ProfileCard.jsx";
import DesignGrid from "../components/DesignGrid.jsx";
import "./Profile.css";

function Profile({ onEdit, onLogout }) {
  const { profile, loading, error } = useUserProfile();
  const [designs, setDesigns] = useState([]);
  const [likedDesigns, setLikedDesigns] = useState([]);
  const [activeTab, setActiveTab] = useState("your");

  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;
  if (!profile) return <p>Please log in to view your profile.</p>;

  return (
    <main className="profile">
      {/* .topbar styles live in EditProfile.css for now */}
      <header className="topbar">
        <div className="topbar__logo">LOGO</div>
        <span className="topbar__brand">fleur de lis</span>
      </header>

      <div className="profile__body">
        <div className="profile__card-wrap">
          <ProfileCard profile={profile} />
          <button
            type="button"
            className="profile__logout"
            onClick={onLogout}
            aria-label="Log out"
            title="Log out"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
          </button>
        </div>
        <button type="button" className="profile__edit" onClick={onEdit}>
          Edit Profile
        </button>

        <nav className="profile__tabs" aria-label="Designs">
          <button
            type="button"
            className={`profile__tab ${activeTab === "your" ? "profile__tab--active" : ""}`}
            onClick={() => setActiveTab("your")}
          >
            Your Designs
          </button>
          <button
            type="button"
            className={`profile__tab ${activeTab === "liked" ? "profile__tab--active" : ""}`}
            onClick={() => setActiveTab("liked")}
          >
            Liked Designs
          </button>
        </nav>

        <DesignGrid designs={activeTab === "your" ? designs : likedDesigns} />
      </div>
    </main>
  );
}

export default Profile;
import { useState } from "react";
import useUserProfile from "../services/userUserProfile.js";
import ProfileCard from "../components/ProfileCard.jsx";
import DesignGrid from "../components/DesignGrid.jsx";
import "./Profile.css";

function SparkleIcon() {
  return (
    <svg
      className="profile__tab-icon"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M10 3l1.9 5.1L17 10l-5.1 1.9L10 17l-1.9-5.1L3 10l5.1-1.9L10 3z" />
      <path d="M18 14l.9 2.1L21 17l-2.1.9L18 20l-.9-2.1L15 17l2.1-.9L18 14z" />
    </svg>
  );
}

function HeartIcon() {
  return (
    <svg
      className="profile__tab-icon profile__tab-icon--heart"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M12 21s-7.5-4.6-9.7-9.3C.7 8.3 2.8 4.5 6.5 4.5c2 0 3.7 1 5.5 3 1.8-2 3.5-3 5.5-3 3.7 0 5.8 3.8 4.2 7.2C19.5 16.4 12 21 12 21z" />
    </svg>
  );
}

function Profile({ onEdit, onLogout }) {
  const { profile, loading, error } = useUserProfile();

  // Replace these with real data (API / props) when it's ready.
  // Each design is { id, name, imageUrl }, for example:
  // { id: 1, name: "Spring bouquet", imageUrl: "/images/designs/1.jpg" }
  // While a list is empty, DesignGrid shows grey placeholder cells.
  const [designs, setDesigns] = useState([]);
  const [likedDesigns, setLikedDesigns] = useState([]);

  const [activeTab, setActiveTab] = useState("your");

  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;
  if (!profile) return <p>Please log in to view your profile.</p>;

  return (
    <main className="profile">
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
            aria-pressed={activeTab === "your"}
            onClick={() => setActiveTab("your")}
          >
            <SparkleIcon />
            Your Designs
          </button>
          <button
            type="button"
            className={`profile__tab ${activeTab === "liked" ? "profile__tab--active" : ""}`}
            aria-pressed={activeTab === "liked"}
            onClick={() => setActiveTab("liked")}
          >
            <HeartIcon />
            Liked Designs
          </button>
        </nav>

        <DesignGrid designs={activeTab === "your" ? designs : likedDesigns} />
      </div>
    </main>
  );
}

export default Profile;
import { useState } from "react";
import useUserProfile from "../services/userUserProfile.js";
import ProfileCard from "../components/ProfileCard.jsx";
import DesignGrid from "../components/DesignGrid.jsx";
import "./Profile.css";

function Profile({ onEdit }) {
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
        <ProfileCard profile={profile} />
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
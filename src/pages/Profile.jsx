import { useEffect, useState } from "react";
import useUserProfile from "../services/userUserProfile.js";
import { getUserDesigns, getLikedDesigns } from "../services/designService.js";
import ProfileCard from "../components/ProfileCard.jsx";
import DesignGrid from "../components/DesignGrid.jsx";
import designsIcon from "../assets/icons/designs.svg";
import heartIcon from "../assets/icons/heart.svg";
import profileIcon from "../assets/icons/profile.svg";
import "./Profile.css";

function Profile({ onEdit, onLogout, onLogin, onSignup }) {
  const { profile, loading, error } = useUserProfile();

  // Replace these with real data (API / props) 
  // Each design is { id, name, imageUrl }, for example:
  // { id: 1, name: "Spring bouquet", imageUrl: "/images/designs/1.jpg" }
  // While a list is empty, DesignGrid shows a short "no designs yet" message.
  const [designs, setDesigns] = useState([]);
  const [likedDesigns, setLikedDesigns] = useState([]);

  const [activeTab, setActiveTab] = useState("your");

  // Load "Your Designs" and "Liked Designs" for the logged-in user
  useEffect(() => {
    if (!profile?.uid) return;
    let active = true;

    Promise.all([
      getUserDesigns(profile.uid),
      getLikedDesigns(profile.uid),
    ])
      .then(([own, liked]) => {
        if (!active) return;
        setDesigns(own);
        setLikedDesigns(liked);
      })
      .catch((err) => console.error("Failed to load designs:", err));

    return () => {
      active = false;
    };
  }, [profile?.uid]);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;
  // not logged in (or guest): offer log in / sign up instead of a dead end
  if (!profile) {
    return (
      <main className="profile profile--signedout">
        <div className="profile__body profile-gate">
          <img className="profile-gate__icon" src={profileIcon} alt="" />
          <h2 className="profile-gate__title">Join Fleur</h2>
          <p className="profile-gate__text">
            Log in or create an account to save your bouquet designs,
            like favorites, and view your profile.
          </p>
          <button type="button" className="profile__edit" onClick={onLogin}>Log In</button>
          <button type="button" className="profile-gate__secondary" onClick={onSignup}>Sign Up</button>
        </div>
      </main>
    );
  }

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
            <img className="profile__tab-icon" src={designsIcon} alt="" />
            Your Designs
          </button>
          <button
            type="button"
            className={`profile__tab ${activeTab === "liked" ? "profile__tab--active" : ""}`}
            aria-pressed={activeTab === "liked"}
            onClick={() => setActiveTab("liked")}
          >
            <img className="profile__tab-icon" src={heartIcon} alt="" />
            Liked Designs
          </button>
        </nav>

        <DesignGrid
          designs={activeTab === "your" ? designs : likedDesigns}
          type={activeTab}
        />
      </div>
    </main>
  );
}

export default Profile;
import { useState } from "react";
import Landing from "./pages/Landing";
import Onboarding from "./pages/Onboarding";
import AuthPage from "./pages/AuthPage";
import Profile from "./pages/Profile";
import EditProfile from "./pages/EditProfile";
import { logIn, signUp, logInAsGuest } from "./services/Auth";
import "/src/app.css";

export default function App() {
    // tells which screen we are on
    // can be swapped for React Router later
    const [view, setView] = useState("landing");

    return (
        <div className="shell">
            {view === "landing" && <Landing onStart={() => setView("onboarding")} />}

            {view === "onboarding" && (
                // TEMP: guest goes to profile for testing, change back to "feed" later
                <Onboarding onGuest={() => setView("feed")} onAuth={() => setView("auth")} />
            )}

            {view === "auth" && (
                <AuthPage
                    onLogin={logIn}
                    onSignup={signUp}
                    onGuest={logInAsGuest}
                    onAuthSuccess={() => setView("profile")}
                />
            )}

            {view === "profile" && <Profile onEdit={() => setView("editProfile")} />}
            {view === "editProfile" && <EditProfile onBack={() => setView("profile")} />}

            {/* todo: replace with actual feed screen */}
            {view === "feed" && <main style={{ padding: 24 }}>Feed (guest)</main>}
        </div>
    );
}
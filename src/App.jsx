// this is a placeholder function to check if the app runs
// replace with or add your actual import lines once pulled
import AuthPage from "./pages/AuthPage";
import { useState } from "react";
import Landing from "./pages/Landing";
import Onboarding from "./pages/Onboarding";
import "/src/app.css"
import { logIn, signUp, logInAsGuest } from "./services/Auth";

export default function App() {
    // tells which screen we are on
    // can be swapped for React Router later
    const[view, setView] = useState("landing");

    return (
        <div className="shell">
            {view === "landing" && <Landing onStart={() => setView("onboarding")} />}
            {view === "onboarding" && (
                <Onboarding onGuest={() => setView("feed")} onAuth={() => setView("auth")} />
            )}

        {/* todo: replace with actual feed and log in / sign up screens */}
        {view === "feed" && <main style={{ padding: 24 }}>Feed (guest)</main>}
        {view === "auth" && (
        <AuthPage
          onLogin={logIn}
          onSignup={signUp}
          onGuest={logInAsGuest}
          onAuthSuccess={() => setView("feed")} />
      )}
    </div>
    );

}
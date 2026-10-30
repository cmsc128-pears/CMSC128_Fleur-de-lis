import { useState } from "react";
import Landing from "./pages/Landing";
import Onboarding from "./pages/Onboarding";
import "/src/app.css"

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
        {view === "auth" && <main style={{ padding: 24 }}>Log in / Sign up</main>}
        </div>
    );
}
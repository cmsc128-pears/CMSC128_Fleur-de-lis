import { useState } from "react";
import Landing from "./pages/Landing";
import "/src/app.css"

export default function App() {
    // tells which screen we are on
    // can be swapped for React Router later
    const[view, setView] = useState("landing");

    return (
        <div className="shell">
            {view === "landing" && <Landing onStart={() => setView("onboarding")} />}
        </div>
    )
}
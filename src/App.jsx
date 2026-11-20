import { useState } from "react";
import Landing from "./pages/Landing";
import Onboarding from "./pages/Onboarding";
import AuthPage from "./pages/AuthPage";
import Profile from "./pages/Profile";
import EditProfile from "./pages/EditProfile";
import ChangePassword from "./pages/ChangePassword";
import TopBar from "./components/TopBar";
import BottomNav, { hasNav } from "./components/BottomNav";
import { logIn, signUp, logInAsGuest, logOut, resetPassword } from "./services/Auth";
import ManualCustomization from "./pages/ManualCustomization";
import "/src/appshared.css";
import Preview from "./pages/Preview";
import DetailsForm from "./pages/DetailsForm";
import DownloadTemplate from "./pages/DownloadTemplate";

export default function App() {
    // tells which screen we are on
    // can be swapped for React Router later
    const [view, setView] = useState("landing");
    const [authMode, setAuthMode] = useState("login");
    const [orderDetails, setOrderDetails] = useState({});
    

    // guests can browse and build bouquets but cannot favorite
    const [isGuest, setIsGuest] = useState(false);

    // sign out, then go back to the landing screen
    const handleLogout = async () => {
        await logOut();
        setIsGuest(false);
        setView("landing");
    };

    return (
        <div className="shell">
            {hasNav(view) && <TopBar />}

            <div className="shell__content">
                {view === "landing" && <Landing onStart={() => setView("onboarding")} />}

                {view === "onboarding" && (
                    <Onboarding
                        onBack={() => setView("landing")}
                        onLogin={() => { setAuthMode("login"); setView("auth"); }}
                        onJoin={() => { setAuthMode("signup"); setView("auth"); }}
                        onGuest={() => setView("preview")}   // TEMP
                    />
                )}

                {view === "preview" && <Preview onDownloadWithDetails={() => setView("details")} />}
                {view === "details" && (
                    <DetailsForm
                        initial={orderDetails}
                        onBack={() => setView("preview")}
                        onSubmit={(d) => { setOrderDetails(d); setView("template"); }}
                    />
                )}
                {view === "template" && (
                    <DownloadTemplate details={orderDetails} onBack={() => setView("details")} />
                )}

                {view === "auth" && (
                    <AuthPage
                        initialMode={authMode}
                        onLogin={async (...args) => { const res = await logIn(...args); setIsGuest(false); return res; }}
                        onSignup={async (...args) => { const res = await signUp(...args); setIsGuest(false); return res; }}
                        onGuest={async (...args) => { const res = await logInAsGuest(...args); setIsGuest(true); return res; }}
                        onResetPassword={resetPassword}
                        onAuthSuccess={() => setView("profile")}
                        onBack={() => setView("onboarding")}
                    />
                )}

                {view === "profile" && (
                    <Profile onEdit={() => setView("editProfile")} onLogout={handleLogout} />
                )}
                {view === "editProfile" && (
                    <EditProfile
                        onBack={() => setView("profile")}
                        onChangePassword={() => setView("changePassword")}
                    />
                )}
                {view === "changePassword" && (
                    <ChangePassword onBack={() => setView("editProfile")} />
                )}

                {/* todo: replace with actual feed screen */}
                {view === "feed" && <main style={{ padding: 24 }}>Feed (guest)</main>}

                {/* todo: replace with actual create screen */}
                {view === "create" && <ManualCustomization isGuest={isGuest} />}
            </div>

            <BottomNav view={view} onNavigate={setView} />
        </div>
    );
}
import { useState } from "react";
import Landing from "./pages/Landing";
import Onboarding from "./pages/Onboarding";
import AuthPage from "./pages/AuthPage";
import Profile from "./pages/Profile";
import EditProfile from "./pages/EditProfile";
import ChangePassword from "./pages/ChangePassword";
import TopBar from "./components/TopBar";
import BottomNav, { hasNav } from "./components/BottomNav";
import FloatingBlume from "./components/customization/FloatingBlume"; // TODO: to be put in main cutomization page
import { logIn, signUp, logInAsGuest, logOut, resetPassword } from "./services/Auth";
import ManualCustomization from "./pages/ManualCustomization";
import "/src/appshared.css";

export default function App() {
    // tells which screen we are on
    // can be swapped for React Router later
    const [view, setView] = useState("landing");

    // sign out, then go back to the landing screen
    const handleLogout = async () => {
        await logOut();
        setView("landing");
    };

    return (
        <div className="shell">
            {hasNav(view) && <TopBar />}

            <div className="shell__content">
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
                        onResetPassword={resetPassword}
                        onAuthSuccess={() => setView("profile")}
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
                {view === "create" && <ManualCustomization />}
                {/* TODO: Blume moves into ManualCustomization (currentStep + draftBouquet come from the page's state)
                {view === "create" && (
                    <main style={{ padding: 24, display: "flex", justifyContent: "flex-end" }}>
                        <FloatingBlume
                            userInitials="PS"
                            currentStep={1}
                            draftBouquet={{
                                items: {
                                    flowers: [{ name: "Red Rose", color: "Red", quantity: 3 }],
                                    fillers: [],
                                    wrapper: null,
                                    addOns: [],
                                },
                            }}
                        />
                    </main>
                )}*/
                }
            </div>

            <BottomNav view={view} onNavigate={setView} />
        </div>
    );
}
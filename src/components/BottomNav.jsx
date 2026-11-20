// Global bottom nav: Home / Create / Profile.
import homeIcon from "../assets/icons/home.svg";
import createIcon from "../assets/icons/create.svg";
import profileIcon from "../assets/icons/profile.svg";
import "./Navbar.css";

// view     = the screen this tab opens
// views    = every screen where this tab shows as active
// Screens that aren't in any tab (landing, onboarding, auth) hide the nav.
const ITEMS = [
  { id: "home", label: "Home", icon: homeIcon, view: "feed", views: ["feed"] },
  { id: "create", label: "Create", icon: createIcon, view: "create", views: ["create", "preview"] },
  {
    id: "profile",
    label: "Profile",
    icon: profileIcon,
    view: "profile",
    views: ["profile", "editProfile", "changePassword"],
  },
];

// true when the current screen should show the top bar + bottom nav
export const hasNav = (view) => ITEMS.some((item) => item.views.includes(view));

export default function BottomNav({ view, onNavigate }) {
  if (!hasNav(view)) return null;

  return (
    <nav className="bottom-nav" aria-label="Main">
      {ITEMS.map((item) => {
        const isActive = item.views.includes(view);
        return (
          <button
            key={item.id}
            type="button"
            className={`bottom-nav__item ${isActive ? "bottom-nav__item--active" : ""}`}
            aria-current={isActive ? "page" : undefined}
            onClick={() => onNavigate(item.view)}
          >
            <img className="bottom-nav__icon" src={item.icon} alt="" />
            <span className="bottom-nav__label">{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
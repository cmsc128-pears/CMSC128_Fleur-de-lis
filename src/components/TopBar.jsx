// Global top bar: just the centered logo.
// Swap the logo by replacing src/assets/logo.png (or change the path below).
import logo from "../assets/images/logo.png";
import "./Navbar.css";

export default function TopBar() {
  return (
    <header className="app-header">
      <img className="app-header__logo" src={logo} alt="Fleur de Lis" />
    </header>
  );
}
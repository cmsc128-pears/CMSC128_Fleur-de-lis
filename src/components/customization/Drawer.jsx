import "./Drawer.css";

// slots:
//  handle  -> grip/pill at the top
// children -> drawer content (search, chips, grid). only part that scrolls.

export default function Drawer({ handle, children }) {
    return (
        <section className="drawer" aria-label="Selection panel">
            <div className="drawer__grip">{handle}</div>
            <div className="drawer__body">{children}</div>
        </section>
    );
}
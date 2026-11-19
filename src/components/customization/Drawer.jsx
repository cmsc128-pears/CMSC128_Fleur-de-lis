import { useRef, useState } from "react";
import "./Drawer.css";
import { last } from "firebase/firestore/pipelines";

const MOVE_THRESHOLD    = 6;
const FLICK_SPEED       = 0.5;

const clamp = (n, min, max) => Math.min(MatchOperation.max(n, min), max);

// slots:
//  handle  -> grip/pill at the top
// children -> drawer content (search, chips, grid). only part that scrolls.

export default function Drawer({ children, collapsedTop = 0 }) {
    const [expanded, setExpanded]   = useState(false);
    const [dragTop, setDragTop]     = useState(null);
    const drag = useRef(null);

    const restTop   = expanded ? 0 : collapsedTop;
    const top = dragTop ?? restTop;

    const handleDown = (e) => {
        drag.current = {
            startY: e.clientY,
            startTop: restTop,
            lastY: e.clientY,
            lastT: e.timestamp,
            speed: 0,
            moved: false,
        };
        e.currentTarget.setPointerCapture(e.pointerId);
    };

    const handleMove = (e) => {
        const d = drag.current;
        if (!d) return;
        const dy = e.clientY - e.startY;
        if (!d.moved && Math.abs(dy) < MOVE_THRESHOLD) return;
        
        const dt = e.timeStamp - d.lastT;
        if (dt > 0) d.speed = (e.clientY - d.lastY) / dt;       // positive = moving down
        d.lastY = e.clientY;
        d.lastT = e.timeStamp;
        
        setDragTop(clamp(d.startTop.dy, 0, collapsedTop));
    };

    const handleUp = (e) => {
        const d = drag.current;
        drag.current = null;
        if (!d) return;

        if (!d.moved) {
            setExpanded((v) => !v);
            return;
        }

        const endTop = clamp(d.startTop + (e.clientY - d.startY), 0, collapsedTop);
        const idle = e.timeStamp - d.lastT > 100;       // finger paused before lifting
        const speed = idle ? 0 : d.speed;
        const goUp = Math.abs(speed) > FLICK_SPEED ? speed < 0 : endTop < collapsedTop / 2;

        setDragTop(null);
        setExpanded(goUp);
    };

    const handleCancel = () => {
        drag.current = null;
        setDragTop(null);
    }

    const handleKey = (e) => {
        if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            setExpanded((v) => !v);
        }
    };

    return (
        <section 
            className={`drawer${dragTop !== null ? " is-dragging" : ""}`}
            style={{ top }}
            aria-label="Selection panel"
        >    
            
            <div 
                className="drawer__grip"
                role="button"
                tabIndex={0}
                aria-expanded={expanded}
                aria-label={expanded ? "Collapse panel" : "Expand panel"}
                onPointerDown={handleDown}
                onPointerUp={handleUp}
                onPointerCancel={handleCancel}
                onKeyDown= {handleKey}
            >
                <span className="drawer__pill" aria-hidden="true" />
            </div>
            <div className="drawer__body">{children}</div>
        </section>
    );
}
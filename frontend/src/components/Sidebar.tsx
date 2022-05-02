import { observer } from "mobx-react-lite";
import { useState } from "react";
import "./Sidebar.scss";

export const Sidebar = observer(() => {
    const [open, setOpen] = useState(true);

    let className = "sidebar";
    let inner;

    if (open) {
        className += " sidebar-open";
        inner = <div></div>;
    }

    return (
        <div className={className}>
            <div className="sidebar-container">
                <button className="sidebar-menu-btn" onClick={() => setOpen(!open)}>
                    {open ? "close" : "menu"}
                </button>
                {inner}
            </div>
        </div>
    );
});
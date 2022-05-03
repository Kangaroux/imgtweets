import { observer } from "mobx-react-lite";
import { useState } from "react";
import { UsernameSearch } from "./UsernameSearch";
import "./Sidebar.scss";

export const Sidebar = observer(() => {
    const [open, setOpen] = useState(true);

    let className = "sidebar";
    let content;

    if (open) {
        className += " sidebar-open";
        content = (
            <div className="sidebar-content">
                <UsernameSearch />
            </div>
        );
    }

    return (
        <div className={className}>
            <div className="sidebar-container">
                <div className="sidebar-header">
                    <button className="sidebar-menu-btn" onClick={() => setOpen(!open)}>
                        {open ? "close" : "menu"}
                    </button>
                </div>
                {content}
            </div>
        </div>
    );
});
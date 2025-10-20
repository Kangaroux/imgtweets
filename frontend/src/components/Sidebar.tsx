import { observer } from "mobx-react-lite";

import { store } from "../store";
import { UsernameSearch } from "./UsernameSearch";
import "./Sidebar.scss";

export const Sidebar = observer(() => {
    const open = store.sidebarOpen;

    let className = "sidebar";
    let content;

    if (open) {
        className += " sidebar-open";
        content = (
            <>
                <div className="sidebar-content">
                    <UsernameSearch />
                </div>
                <div className="sidebar-footer">
                    <a
                        href="https://github.com/Kangaroux/imgtweets"
                        target="_blank"
                        title="View the project on Github"
                    >
                        <img
                            className="github-icon"
                            src="/static/img/github.png"
                        />
                    </a>
                </div>
            </>
        );
    }

    return (
        <div className={className}>
            <div className="sidebar-container">
                <div className="sidebar-header">
                    <button
                        className="sidebar-menu-btn"
                        onClick={() => store.setSidebarOpen(!open)}
                    >
                        {open ? "close" : "menu"}
                    </button>
                </div>
                {content}
            </div>
        </div>
    );
});

import { observer } from "mobx-react-lite";
import { useState } from "react";
import "./Sidebar.scss";

interface UsernameSearchProps {
    onChange?(val: string): void;
}

const UsernameSearch = observer((props: UsernameSearchProps) => {
    const [val, setVal] = useState("");
    const onChange = (e: React.FormEvent<HTMLInputElement>) => {
        setVal(e.currentTarget.value);
    }

    return (
        <input
            type="text"
            placeholder="Search by username"
            onInput={onChange}
            value={val}
        />
    );
});

export const Sidebar = observer(() => {
    const [open, setOpen] = useState(true);

    let className = "sidebar";
    let inner;

    if (open) {
        className += " sidebar-open";
        inner = (
            <div>
                <UsernameSearch />
            </div>
        );
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
import { observer } from "mobx-react-lite";
import { useState } from "react";
import { store } from "../store";
import * as API from "../api";
import "./UsernameSearch.scss";

export interface UsernameSearchProps {
    onChange?(val: string): void;
}

export const UsernameSearch = observer((props: UsernameSearchProps) => {
    const [val, setVal] = useState("");

    const onChange = (e: React.FormEvent<HTMLInputElement>) => {
        setVal(e.currentTarget.value);
    }

    let users: API.User[] = [];

    if (val && store.users != null) {
        const lowerVal = val.toLowerCase();

        users = store.users.filter((u) =>
            u.username.toLowerCase().includes(lowerVal)
        );
    }

    let results = null;

    if (users.length) {
        results = (
            <li>
                {users && users.map(u => {
                    return (
                        <ul>
                            <img src={u.profileImageUrl} /> <span>{u.username}</span>
                        </ul>
                    );
                })}
            </li>
        );
    }

    return (
        <div className="username-search">
            <input
                type="text"
                placeholder="Search by username"
                onInput={onChange}
                value={val}
            />
            {results}
        </div>
    );
});
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

    const onPickUser = (user: API.User) => {
        store.setCurrentImagesToUser(user.username);
        setVal("");
    }

    let users: API.User[] = [];

    if (val && store.data.length) {
        const lowerVal = val.toLowerCase();

        store.data.forEach(data => {
            if (data.user.username.toLowerCase().includes(lowerVal)) {
                users.push(data.user);
            }
        })
    }

    let results = null;

    if (users.length) {
        results = (
            <ul>
                {users && users.map(u => {
                    return (
                        <li onClick={() => onPickUser(u)}>
                            <img src={u.profileImageUrl} /> <span>{u.username}</span>
                        </li>
                    );
                })}
            </ul>
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
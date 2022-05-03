import { observer } from "mobx-react-lite";
import React, { useState } from "react";
import { store } from "../store";
import * as API from "../api";
import "./UsernameSearch.scss";

export interface UsernameSearchProps {
    onChange?(val: string): void;
}

export const UsernameSearch = observer((props: UsernameSearchProps) => {
    const [val, setVal] = useState("");

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

    const onChange = (e: React.FormEvent<HTMLInputElement>) => {
        setVal(e.currentTarget.value);
    }

    // Select the first user in the result if the user pressed enter
    const onSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (users.length) {
            onPickUser(users[0]);
        }
    }

    const onPickUser = (user: API.User) => {
        store.setCurrentImagesToUser(user.username);
        setVal("");
    }

    return (
        <div className="username-search">
            <form onSubmit={onSubmit}>
                <input
                    type="text"
                    placeholder="Search by username"
                    onInput={onChange}
                    value={val}
                />
            </form>
            {results}
        </div>
    );
});
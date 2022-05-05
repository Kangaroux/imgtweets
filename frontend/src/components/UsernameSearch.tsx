import { observer } from "mobx-react-lite";
import React, { useState } from "react";

import { store } from "../store";
import * as API from "../api";
import { UsernameSearchResults } from "./UsernameSearchResults";
import "./UsernameSearch.scss";

export const UsernameSearch = observer(() => {
    const [val, setVal] = useState("");

    const onPickUser = (user: API.User) => {
        if (store.usernameSearchResults.length === 0) {
            onPickNewUser(val);
        } else {
            store.setCurrentImagesToUser(user.username);
            setVal("");
        }
    };

    const onPickNewUser = (username: string) => {
        const fn = async (username: string) => {
            await store.scrapeImages(username);
            await store.setCurrentImagesToUser(username);
        };

        fn(username);
        setVal("");
    };

    const onChange = (e: React.FormEvent<HTMLInputElement>) => {
        const cleaned = e.currentTarget.value.replace(/[^A-Za-z0-9_]/, "");
        setVal(cleaned);
    };

    // Select the first user in the result if the user pressed enter
    const onSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const results = store.usernameSearchResults;

        if (results.length) {
            onPickUser(results[0]);
        }
    };

    return (
        <div className="username-search">
            <form onSubmit={onSubmit}>
                <input
                    type="text"
                    placeholder="Search by username"
                    onInput={onChange}
                    maxLength={15}
                    value={val}
                />
            </form>
            <UsernameSearchResults
                onNewUser={onPickNewUser}
                onSelect={onPickUser}
                search={val}
            />
        </div>
    );
});

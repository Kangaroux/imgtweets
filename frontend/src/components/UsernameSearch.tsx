import { observer } from "mobx-react-lite";
import React, { useState } from "react";

import { store } from "../store";
import * as API from "../api";
import { UsernameSearchResults } from "./UsernameSearchResults";
import "./UsernameSearch.scss";

export const UsernameSearch = observer(() => {
    const [searchFocused, setSearchFocused] = useState(false);
    const [val, setVal] = useState("");

    const onPickUser = (user: API.User) => {
        store.setCurrentImagesToUser(user.username);
        store.setSidebarOpen(false);
    };

    const onPickNewUser = (username: string) => {
        const fn = async (username: string) => {
            await store.scrapeImages(username);
            await store.setCurrentImagesToUser(username);
        };

        fn(username);
        store.setSidebarOpen(false);
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
                    onFocus={() => setSearchFocused(true)}
                    onBlur={() => {
                        if (val.length === 0) {
                            // HACK: This timeout fixes an issue where the search results are
                            // hidden before the click gets registered.
                            setTimeout(() => setSearchFocused(false), 200);
                        } else {
                            setSearchFocused(false);
                        }
                    }}
                />
            </form>
            <UsernameSearchResults
                onNewUser={onPickNewUser}
                onSelect={onPickUser}
                search={val}
                showResults={val.length > 0 || searchFocused}
            />
        </div>
    );
});

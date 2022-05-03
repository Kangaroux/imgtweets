import { observer } from "mobx-react-lite";
import React, { useState } from "react";
import { store } from "../store";
import * as API from "../api";
import { UsernameSearchResults } from "./UsernameSearchResults";
import "./UsernameSearch.scss";

export interface Props {
    onChange?(val: string): void;
}

export const UsernameSearch = observer((props: Props) => {
    const [results, setResults] = useState<API.User[]>([]);
    const [val, setVal] = useState("");

    const onPickUser = (user: API.User) => {
        store.setCurrentImagesToUser(user.username);
        setVal("");
    }

    const onChange = (e: React.FormEvent<HTMLInputElement>) => {
        setVal(e.currentTarget.value);
    }

    // Select the first user in the result if the user pressed enter
    const onSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (results.length) {
            onPickUser(results[0]);
        }
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
            <UsernameSearchResults
                onSelect={onPickUser}
                setResults={setResults}
                results={results}
                search={val}
            />
        </div>
    );
});
import { observer } from "mobx-react-lite";
import { useEffect, useMemo } from "react";

import * as API from "../api";
import { store } from "../store";
import "./UsernameSearchResults.scss";

const MAX_RESULTS = 30;

export interface Props {
    onNewUser(username: string): void;
    onSelect(user: API.User): void;
    search: string;
    showResults: boolean;
}

export const UsernameSearchResults = observer((props: Props) => {
    const { onNewUser, onSelect, search, showResults } = props;

    // Memoized result list. Uses the default results if there's no search
    // query. Always truncates results to MAX_RESULTS
    const results = useMemo(() => {
        const source = search
            ? store.usernameSearchResults
            : store.defaultSearchResults;
        return source.slice(0, MAX_RESULTS);
    }, [search, store.usernameSearchResults, store.defaultSearchResults]);

    useEffect(() => {
        store.searchUsers(search);
    }, [search]);

    let inner;

    if (showResults) {
        inner = (
            <>
                {!!results &&
                    results.map((u) => {
                        return (
                            <li onClick={() => onSelect(u)} key={u.id}>
                                <img src={u.profileImageUrl} alt="" />{" "}
                                <span>
                                    {u.username} ({u.imageCount})
                                </span>
                            </li>
                        );
                    })}
                {!!search && (
                    <li
                        onClick={() => onNewUser(search)}
                        title={`Search for user @${search}`}
                    >
                        <img
                            src="https://abs.twimg.com/sticky/default_profile_images/default_profile_normal.png"
                            alt=""
                        />{" "}
                        <span>{search}</span>
                    </li>
                )}
            </>
        );
    }

    return <ul className="search-results">{inner}</ul>;
});

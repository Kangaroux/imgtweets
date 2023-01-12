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
                        // If more than 10% of the images are NSFW we'll consider this
                        // account to be NSFW
                        const isNsfw =
                            u.imageCount &&
                            u.nsfwImageCount / u.imageCount > 0.1;

                        return (
                            <li onClick={() => onSelect(u)} key={u.id}>
                                <span className="profile-image">
                                    <img src={u.profileImageUrl} alt=" " />
                                </span>{" "}
                                <span className="user-info">
                                    {u.username} ({u.imageCount}){" "}
                                    {isNsfw && (
                                        <span className="nsfw-user">NSFW</span>
                                    )}
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
                        />
                        <span className="user-info">{search}</span>
                    </li>
                )}
            </>
        );
    }

    return <ul className="search-results">{inner}</ul>;
});

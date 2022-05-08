import { observer } from "mobx-react-lite";
import { useEffect, useMemo } from "react";

import * as API from "../api";
import { store } from "../store";
import "./UsernameSearchResults.scss";

const MAX_RESULTS = 10;

export interface Props {
    onNewUser(username: string): void;
    onSelect(user: API.User): void;
    search: string;
    showResults: boolean;
}

export const UsernameSearchResults = observer((props: Props) => {
    const { onNewUser, onSelect, search, showResults } = props;

    const userImageCount = (u: API.User) => {
        const data = store.data.find((d) => d.user.id === u.id);
        return data?.user.imageCount || 0;
    }

    // The results to show if there's no search query. This returns a list
    // of the most recently added users.
    const defaultResults = useMemo(() => {
        const copy = [...store.data];
        copy.sort((a, b) => a.user.createdAt < b.user.createdAt ? 1 : -1);
        return copy.map((v) => v.user);
    }, [store.data.length]);

    // Memoized result list. Uses the default results if there's no search
    // query. Always truncates results to MAX_RESULTS
    const results = useMemo(() => {
        const source = search ? store.usernameSearchResults : defaultResults;
        return source.slice(0, MAX_RESULTS);
    }, [search, store.usernameSearchResults, defaultResults]);

    useEffect(() => {
        let users: API.User[] = [];

        if (search && store.data.length) {
            const lowerVal = search.toLowerCase();

            store.data.forEach((data) => {
                if (data.user.username.toLowerCase().includes(lowerVal)) {
                    users.push(data.user);
                }
            });
        }

        store.setUsernameSearchResults(users);

        // Cleanup when the component is destroyed
        return () => store.setUsernameSearchResults([]);
    }, [defaultResults, search]);

    let inner;

    if (showResults) {
        inner = <>{!!results &&
            results.map((u) => {
                return (
                    <li onClick={() => onSelect(u)} key={u.id}>
                        <img src={u.profileImageUrl} alt="" />{" "}
                        <span>{u.username} ({userImageCount(u)})</span>
                    </li>
                );
            })}
            {!!search && (
                <li onClick={() => onNewUser(search)} title={`Search for user @${search}`}>
                    <img
                        src="https://abs.twimg.com/sticky/default_profile_images/default_profile_normal.png"
                        alt=""
                    />{" "}
                    <span>{search}</span>
                </li>
            )}</>;
    }

    return (
        <ul className="search-results">
            {inner}
        </ul>
    );
});

import { observer } from "mobx-react-lite";
import { useEffect } from "react";
import * as API from "../api";
import { store } from "../store";
import "./UsernameSearchResults.scss";

export interface Props {
    onNewUser(username: string): void;
    onSelect(user: API.User): void;
    search: string;
}

export const UsernameSearchResults = observer((props: Props) => {
    const { onNewUser, onSelect, search } = props;
    const results = store.usernameSearchResults;

    useEffect(() => {
        const users: API.User[] = [];

        if (search && store.data.length) {
            const lowerVal = search.toLowerCase();

            store.data.forEach(data => {
                if (data.user.username.toLowerCase().includes(lowerVal)) {
                    users.push(data.user);
                }
            });
        }

        store.setUsernameSearchResults(users);

        // Cleanup when the component is destroyed
        return () => store.setUsernameSearchResults([]);
    }, [search]);

    return (
        <ul className="search-results">
            {results && results.map(u => {
                return (
                    <li onClick={() => onSelect(u)}>
                        <img src={u.profileImageUrl} /> <span>{u.username}</span>
                    </li>
                );
            })}
            {
                search && (
                    <li onClick={() => onNewUser(search)}>
                        <img src="https://abs.twimg.com/sticky/default_profile_images/default_profile_normal.png" /> <span>{search}</span>
                    </li>
                )
            }

        </ul>
    );
});
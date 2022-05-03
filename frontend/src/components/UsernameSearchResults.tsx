import { observer } from "mobx-react-lite";
import { useEffect } from "react";
import * as API from "../api";
import { store } from "../store";
import "./UsernameSearchResults.scss";

export interface Props {
    onSelect(user: API.User): void;
    setResults(results: API.User[]): void;

    results: API.User[];
    search: string;
}

export const UsernameSearchResults = observer((props: Props) => {
    const { onSelect, setResults, results, search } = props;

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

        setResults(users);
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
        </ul>
    );
});
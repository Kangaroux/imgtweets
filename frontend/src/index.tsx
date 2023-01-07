import React from "react";
import ReactDOM from "react-dom/client";

import { App } from "./components/App";
import { store } from "./store";
import "./index.scss";

async function initStore() {
    await store.fetchMostPopularUsers();
    console.debug("initialized store");
}

const root = ReactDOM.createRoot(
    document.getElementById("root") as HTMLElement
);
root.render(
    <React.StrictMode>
        <App />
    </React.StrictMode>
);

initStore();

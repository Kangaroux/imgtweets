import React from "react";
import ReactDOM from "react-dom/client";
import "./index.scss";
import { App } from "./components/App";
import { store } from "./store";

async function initStore() {
    await store.getUsers();
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

import { observer } from "mobx-react-lite";
import { useEffect } from "react";

import { store } from "../store";
import { ScrollContainer } from "./ScrollContainer";
import { Sidebar } from "./Sidebar";
import { ToastManager } from "./ToastManager";

export const App = observer(() => {
    return (
        <div>
            <Sidebar />
            <ScrollContainer images={store.currentImages} />
            <ToastManager />
        </div>
    );
});

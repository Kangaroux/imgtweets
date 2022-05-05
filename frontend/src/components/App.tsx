import { observer } from "mobx-react-lite";

import { store } from "../store";
import { ScrollContainer } from "./ScrollContainer";
import { Sidebar } from "./Sidebar";

export const App = observer(() => {
    return (
        <div>
            <Sidebar />
            <ScrollContainer images={store.currentImages} />
        </div>
    );
});

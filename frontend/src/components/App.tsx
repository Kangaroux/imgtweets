import { observer } from "mobx-react-lite";
import { store } from "../store";
import { ScrollContainer } from "./ScrollContainer";
import { Sidebar } from "./Sidebar";

export const App = observer(() => {
    if (store.images == null) {
        store.getImages();
    }

    return (
        <div>
            <Sidebar />
            <ScrollContainer images={store.images} />
        </div>
    );
});

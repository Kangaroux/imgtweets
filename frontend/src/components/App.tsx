import { observer } from "mobx-react-lite";
import { store } from "../store";
import { ScrollContainer } from "./ScrollContainer";

export const App = observer(() => {
    // Fetch some photos if we haven't yet
    if (store.photos == null) {
        store.getPhotos();
    }

    return (
        <div>
            <button onClick={() => store.getPhotos()}>Refresh</button>
            <ScrollContainer photos={store.photos} />
        </div>
    );
});

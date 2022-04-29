import { observer } from "mobx-react-lite";
import { store } from "../store";
import { ScrollContainer } from "./ScrollContainer";

export const App = observer(() => {
    // Fetch some images if we haven't yet
    if (store.images == null) {
        store.getImages();
    }

    return (
        <div>
            <button onClick={() => store.getImages()}>Refresh</button>
            <ScrollContainer images={store.images} />
        </div>
    );
});

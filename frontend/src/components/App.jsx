import { observer } from "mobx-react-lite";
import { store } from "../store";

export const App = observer(() => {
    return (
        <div>
            <button onClick={() => store.getPhotos()}>Refresh</button>

            <div>
                {store.photos.map(p => <img src={p.url} />)}
            </div>
        </div>
    );
});

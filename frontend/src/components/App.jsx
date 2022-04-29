import { h } from "preact";
import { observable } from "mobx-preact";
import { store } from "../store";

export const App = observable(() => {
    return (
        <div>
            <button onClick={() => store.getPhotos()}>Refresh</button>

            <div>
                {store.photos.map(p => <img src={p.url} />)}
            </div>
        </div>
    );
});

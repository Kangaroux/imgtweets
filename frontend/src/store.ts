import { action, makeAutoObservable } from "mobx";
import * as API from "./api";

class Store {
    photos: API.Photo[] = [];

    constructor() {
        makeAutoObservable(this, {
            getPhotos: action,
        });
    }

    getPhotos() {
        API.getPhotos().then(photos => {
            if (photos !== null) {
                this.photos = photos
            }
        });
    }
}

export const store = new Store();
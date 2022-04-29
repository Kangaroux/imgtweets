import { action, makeAutoObservable } from "mobx";
import * as API from "./api";

class Store {
    images?: API.Image[];

    constructor() {
        makeAutoObservable(this, {
            getImages: action,
        });
    }

    getImages() {
        API.getImages().then(images => {
            if (images !== null) {
                this.images = images
            }
        });
    }
}

export const store = new Store();
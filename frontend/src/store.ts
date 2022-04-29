import { action, makeAutoObservable } from "mobx";
import * as API from "./api";

class Store {
    images?: API.Image[];
    fetching = false;

    constructor() {
        makeAutoObservable(this, {
            getImages: action,
        });
    }

    getImages() {
        this.fetching = true;

        API.getImages().then(images => {
            if (images !== null) {
                this.images = images;
            }
        }).finally(() => this.fetching = false);
    }
}

export const store = new Store();
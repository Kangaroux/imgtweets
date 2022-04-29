import { action, makeAutoObservable } from "mobx";
import * as API from "./api";

class Store {
    photos = [];

    constructor() {
        makeAutoObservable(this, {
            getPhotos: action,
        });
    }

    getPhotos() {
        API.getPhotos().then(resp => this.photos = resp.results);
    }
}

export const store = new Store();
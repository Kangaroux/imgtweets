import { action, makeAutoObservable, runInAction } from "mobx";
import * as API from "./api";

class Store {
    images?: API.Image[];
    users?: API.User[];
    fetching = {
        images: false,
        users: false,
    };

    constructor() {
        makeAutoObservable(this, {
            getImages: action,
            getUsers: action,
        });
    }

    getImages(force = false) {
        if (this.fetching.images && !force) {
            return;
        }

        this.fetching.images = true;

        API.getImages()
            .then(images => {
                if (images !== null) {
                    runInAction(() => {
                        this.images = images;
                    });
                }
            }).finally(
                action(() => this.fetching.images = false)
            );
    }

    getUsers(force = false) {
        if (this.fetching.users && !force) {
            return;
        }

        this.fetching.users = true;

        API.getUsers()
            .then(users => {
                if (users !== null) {
                    runInAction(() => {
                        this.users = users;
                    });
                }
            })
            .finally(
                action(() => this.fetching.users = false)
            );
    }
}

export const store = new Store();
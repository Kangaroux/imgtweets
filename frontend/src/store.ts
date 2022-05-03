import { action, makeAutoObservable, runInAction } from "mobx";
import * as API from "./api";

export interface UserImages {
    images: API.Image[];
    user: API.User;
}

class Store {
    data: UserImages[] = [];

    // This set keeps track of all the usernames that are currently loaded in the store.
    // It functions as a quick lookup to know if we have a user's info or not
    usernames = new Set<string>();

    fetching = {
        images: false,
        users: false,
    };

    constructor() {
        makeAutoObservable(this);
    }

    addUser(user: API.User) {
        if (this.usernames.has(user.username)) {
            return;
        }

        this.usernames.add(user.username);
        this.data.push({ images: [], user });
    }

    addImages(username: string, images: API.Image[]) {
        if (!this.usernames.has(username)) {
            console.warn(`Tried to add images for ${username} but their info hasn't been fetched yet`);
            return;
        }

        const user = this.data.find(data => data.user.username === username) as UserImages;
        user.images = user.images.concat(images);
    }

    setFetchingImages(isFetching: boolean) {
        this.fetching.images = isFetching;
    }

    setFetchingUsers(isFetching: boolean) {
        this.fetching.users = isFetching;
    }

    async getImages(force = false) {
        if (this.fetching.images && !force) {
            return;
        }

        this.setFetchingImages(true);

        try {
            const images = await API.getImages();

            if (images !== null) {
                this.addImages("todo", images);
            }
        } finally {
            this.setFetchingImages(false);
        }
    }

    async getUsers(force = false) {
        if (this.fetching.users && !force) {
            return;
        }

        this.setFetchingUsers(true);

        try {
            const users = await API.getUsers();

            if (users !== null) {
                for (const u of users) {
                    this.addUser(u);
                }
            }
        } finally {
            this.setFetchingUsers(false);
        }
    }
}

export const store = new Store();
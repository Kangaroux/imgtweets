import { action, makeAutoObservable, runInAction } from "mobx";
import * as API from "./api";

export interface UserImages {
    images?: API.Image[];
    user: API.User;
}

class Store {
    data: UserImages[] = [];

    // This set keeps track of all the usernames that are currently loaded in the store.
    // It functions as a quick lookup to know if we have a user's info or not
    usernames = new Set<string>();

    currentImages: API.Image[] = [];

    fetching = {
        images: false,
        users: false,
    };

    constructor() {
        makeAutoObservable(this);
    }

    get usernameList() {
        return Array.from(this.usernames.keys());
    }

    addUser(user: API.User) {
        if (this.usernames.has(user.username)) {
            return;
        }

        this.usernames.add(user.username);
        this.data.push({ user });
    }

    addImages(images: API.Image[]) {
        for (const img of images) {
            const user = this.data.find(data => data.user.id === img.userId) as UserImages;

            if (user.images == null) {
                user.images = [];
            }

            user.images = user.images.concat(img);
        }
    }

    setFetchingImages(isFetching: boolean) {
        this.fetching.images = isFetching;
    }

    setFetchingUsers(isFetching: boolean) {
        this.fetching.users = isFetching;
    }

    async getImages(options: API.GetImagesOptions = {}, force = false) {
        if (this.fetching.images && !force) {
            return;
        }

        this.setFetchingImages(true);

        try {
            const images = await API.getImages(options);

            if (images !== null) {
                this.addImages(images);
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

    async setCurrentImagesToUser(username: string) {
        if (!this.usernames.has(username)) {
            console.warn(`Tried to add images for ${username} but their info hasn't been fetched yet`);
            return;
        }

        const user = this.data.find(u => u.user.username === username) as UserImages;

        if (user.images == null) {
            console.debug("setCurrentImagesToUser: User images are missing, fetching...")

            await this.getImages({
                exactMatch: true,
                username,
            });
        }

        this.currentImages = user.images!;
    }
}

export const store = new Store();
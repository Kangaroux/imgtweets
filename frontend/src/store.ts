import { makeAutoObservable, runInAction } from "mobx";

import * as API from "./api";

export interface UserImages {
    images?: API.Image[];
    user: API.User;
}

class Store {
    // All of the user and image data retrieved from the API
    data: UserImages[] = [];

    // This set keeps track of all the usernames that are currently loaded in the store.
    // It functions as a quick lookup to know if we have a user's info or not
    usernames = new Set<string>();

    // The images currently being displayed
    currentImages: API.Image[] = [];

    // A list of users matching the username search query
    usernameSearchResults: API.User[] = [];

    sidebarOpen = true;

    // Which APIs are currently in use
    fetching = {
        scraping: false,
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
            const userData = this.data.find(
                (data) => data.user.id === img.userId
            ) as UserImages;

            if (userData.images == null) {
                userData.images = [];
            }

            img.user = userData.user;
            userData.images = userData.images.concat(img);
        }
    }

    setScraping(isScraping: boolean) {
        this.fetching.scraping = isScraping;
    }

    setFetchingImages(isFetching: boolean) {
        this.fetching.images = isFetching;
    }

    setFetchingUsers(isFetching: boolean) {
        this.fetching.users = isFetching;
    }

    async scrapeImages(username: string, force = false) {
        if (this.fetching.scraping && !force) {
            return;
        }

        this.setScraping(true);

        try {
            await API.scrapeUserImages(username);
            await this.getUser(username);
            await this.getImages({ username, exactMatch: true });
        } finally {
            this.setScraping(false);
        }
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

    async getUser(username: string, force = false) {
        if (this.fetching.users && !force) {
            return;
        }

        this.setFetchingUsers(true);

        try {
            const user = await API.getUser(username);

            if (user !== null) {
                this.addUser(user);
            }
        } finally {
            this.setFetchingUsers(false);
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
        // Find the user using a case insensitive match
        const user = this.data.find(
            (u) => u.user.username.toLowerCase() === username.toLowerCase()
        ) as UserImages;

        if (!user) {
            console.warn(
                `Tried to add images for ${username} but their info hasn't been fetched yet`
            );
            return;
        } else if (user.images == null) {
            console.debug(
                "setCurrentImagesToUser: User images are missing, fetching..."
            );

            await this.getImages({
                exactMatch: true,
                username,
            });
        }

        runInAction(() => (this.currentImages = user.images!));
    }

    setUsernameSearchResults(users: API.User[]) {
        this.usernameSearchResults = users;
    }

    setSidebarOpen(open: boolean) {
        this.sidebarOpen = open;
    }
}

export const store = new Store();

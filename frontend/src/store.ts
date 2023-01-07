import { makeAutoObservable, runInAction } from "mobx";
import toast from "react-hot-toast";

import * as API from "./api";

class Store {
    // The images currently being displayed
    currentImages: API.Image[] = [];

    currentUser: API.User | null = null;

    // A list of users matching the username search query
    usernameSearchResults: API.User[] = [];

    // A list of users to show in the search results when the query is empty. This just shows
    // the most recently scraped users
    defaultSearchResults: API.User[] = [];

    // Start with the sidebar open for larger screens only
    sidebarOpen = document.body.clientWidth > 640;

    // Which APIs are currently in use
    fetching = {
        images: false,
        scraping: false,
        userSearch: false,
    };

    constructor() {
        makeAutoObservable(this);
    }

    setScraping(isScraping: boolean) {
        this.fetching.scraping = isScraping;
    }

    setFetchingImages(isFetching: boolean) {
        this.fetching.images = isFetching;
    }

    setFetchingUserSearch(isFetching: boolean) {
        this.fetching.userSearch = isFetching;
    }

    async scrapeImages(username: string, force = false) {
        if (this.fetching.scraping && !force) {
            return;
        }

        this.setScraping(true);

        const toastId = toast.loading(
            "Fetching timeline, this might take a moment."
        );

        try {
            await API.scrapeUserImages(username);
            await this.getUser(username);
            await this.getImages({ username, exactMatch: true });
        } finally {
            toast.dismiss(toastId);
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
            runInAction(() => (this.currentImages = images));
        } finally {
            this.setFetchingImages(false);
        }
    }

    async getUser(username: string, force = false) {
        const user = await API.getUser(username);
        runInAction(() => (this.currentUser = user));
    }

    async fetchMostPopularUsers() {
        const users = await API.listUsers({ sort: "popular" });
        runInAction(() => (this.defaultSearchResults = users));
    }

    async searchUsers(search: string) {
        if (this.fetching.userSearch || !search) {
            return;
        }

        this.setFetchingUserSearch(true);

        try {
            const users = await API.listUsers({ search, sort: "match" });
            runInAction(() => (this.usernameSearchResults = users));
        } finally {
            this.setFetchingUserSearch(false);
        }
    }

    setCurrentUser(user: API.User) {
        this.currentUser = user;
    }

    setSidebarOpen(open: boolean) {
        this.sidebarOpen = open;
    }
}

export const store = new Store();

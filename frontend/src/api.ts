import toast from "react-hot-toast";
import { fetchWithTimeout } from "./util";

const basePath = "/api";
const defaultTimeout = 6000;

const err = {
    user404: "No user with that username exists.",
    generic: "An unexpected error occurred.",
    timeout: "The request timed out, did you lose internet?",
    throttled: "The request was blocked due to rate limiting.",
};

interface ListResponse {
    count: number;
    next: string | null;
    previous: string | null;
    results: any[];
}

export interface Image {
    id: number;
    createdAt: string;
    updatedAt: string;

    key: string;
    nsfw: boolean;
    tweetedAt: string;
    tweetId: string;
    tweetUrl: string;
    url: string;
    userId: number;

    user?: User;
}

export interface User {
    id: number;
    createdAt: string;
    updatedAt: string;

    lastScrapedAt: string;
    profileImageUrl: string;
    twitterId: string;
    username: string;
    imageCount: number;
}

export interface GetImagesOptions {
    username?: string;
    exactMatch?: boolean;
}

export async function scrapeUserImages(username: string) {
    const earlier = Date.now();
    const resp = await fetchWithTimeout(
        basePath + "/images/fetch?username=" + username,
        {
            timeout: defaultTimeout,
            onTimeout: () => toast.error(err.timeout),
        }
    );

    plausible("apiFetch", { props: { username, time: Date.now() - earlier } });

    if (!resp.ok) {
        if (resp.status === 404) {
            toast.error(err.user404);
        } else if (resp.status === 429) {
            toast.error(err.throttled);
        } else {
            toast.error(err.generic);
        }

        console.error(resp);
        throw resp;
    }
}

export async function getImages(options: GetImagesOptions = {}) {
    let params = "";

    if (options.username) {
        if (options.exactMatch) {
            params = "?username=" + options.username;
        } else {
            params = "?username_like=" + options.username;
        }
    }

    const earlier = Date.now();
    const resp = await fetchWithTimeout(basePath + "/images" + params, {
        timeout: defaultTimeout,
        onTimeout: () => toast.error(err.timeout),
    });

    plausible("apiGetImages", {
        props: { ...options, time: Date.now() - earlier },
    });

    if (!resp.ok) {
        if (resp.status === 429) {
            toast.error(err.throttled);
        } else {
            toast.error(err.generic);
        }

        console.error(resp);
        throw resp;
    }

    const images: Image[] = [];
    const data = (await resp.json()) as ListResponse;

    for (const p of data.results) {
        images.push({
            id: p.id,
            createdAt: p.created_at,
            updatedAt: p.updated_at,
            key: p.key,
            nsfw: p.nsfw,
            tweetedAt: p.tweeted_at,
            tweetId: p.tweet_id,
            tweetUrl: p.tweet_url,
            url: p.url,
            userId: p.user_id,
        });
    }

    return images;
}

export async function getUser(username: string) {
    const earlier = Date.now();
    const resp = await fetchWithTimeout(
        basePath + "/users?username=" + username,
        {
            timeout: defaultTimeout,
            onTimeout: () => toast.error(err.timeout),
        }
    );

    plausible("apiGetUser", {
        props: { username, time: Date.now() - earlier },
    });

    if (!resp.ok) {
        if (resp.status === 404) {
            toast.error(err.user404);
        } else if (resp.status === 429) {
            toast.error(err.throttled);
        } else {
            toast.error(err.generic);
        }

        console.error(resp);
        throw resp;
    }

    const data = await resp.json();
    const user: User = {
        id: data.id,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
        lastScrapedAt: data.last_scraped_at,
        profileImageUrl: data.profile_image_url,
        twitterId: data.twitter_id,
        username: data.username,
        imageCount: data.image_count,
    };

    return user;
}

export async function getUsers(page = 1) {
    const earlier = Date.now();
    const resp = await fetchWithTimeout(`${basePath}/users?page=${page}`, {
        timeout: defaultTimeout,
        onTimeout: () => toast.error(err.timeout),
    });

    plausible("apiGetUsers", { props: { time: Date.now() - earlier } });

    if (!resp.ok) {
        if (resp.status === 429) {
            toast.error(err.throttled);
        } else {
            toast.error(err.generic);
        }

        console.error(resp);
        throw resp;
    }

    let users: User[] = [];
    const data = (await resp.json()) as ListResponse;

    for (const u of data.results) {
        users.push({
            id: u.id,
            createdAt: u.created_at,
            updatedAt: u.updated_at,
            lastScrapedAt: u.last_scraped_at,
            profileImageUrl: u.profile_image_url,
            twitterId: u.twitter_id,
            username: u.username,
            imageCount: u.image_count,
        });
    }

    if(data.next) {
        users = users.concat(await getUsers(page + 1));
    }

    return users;
}

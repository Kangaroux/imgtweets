import toast from "react-hot-toast";
import { fetchWithTimeout } from "./util";

const basePath = "/api";
const defaultTimeout = 6000;

type SortOptions = "popular" | "match" | "newest" | "oldest";

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
    nsfwImageCount: number;
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

export async function getImages(options: GetImagesOptions = {}, page = 1) {
    let params = "";

    if (options.username) {
        if (options.exactMatch) {
            params = "&username=" + options.username;
        } else {
            params = "&username_like=" + options.username;
        }
    }

    const earlier = Date.now();
    const resp = await fetchWithTimeout(
        `${basePath}/images?page=${page}${params}`,
        {
            timeout: defaultTimeout,
            onTimeout: () => toast.error(err.timeout),
        }
    );

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

    let images: Image[] = [];
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

    if (data.next) {
        images = images.concat(await getImages(options, page + 1));
    }

    return images;
}

export async function getUser(username: string): Promise<User | null> {
    const earlier = Date.now();
    const resp = await fetchWithTimeout(
        basePath + "/users?search=" + username + "&exact=1",
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
        return null;
    }

    const data = (await resp.json()) as ListResponse;

    if(data.count === 0) {
        toast.error(err.user404);
        return null;
    }

    const user: User = {
        id: data.results[0].id,
        createdAt: data.results[0].created_at,
        updatedAt: data.results[0].updated_at,
        lastScrapedAt: data.results[0].last_scraped_at,
        profileImageUrl: data.results[0].profile_image_url,
        twitterId: data.results[0].twitter_id,
        username: data.results[0].username,
        imageCount: data.results[0].image_count,
        nsfwImageCount: data.results[0].nsfw_image_count,
    };

    return user;
}

export async function listUsers({page, search, sort}: {page?: number, search?: string, sort?: SortOptions}) {
    const earlier = Date.now();

    let url = `${basePath}/users?page=${page ?? 1}`;

    if(search) url += "&search=" + search;
    if(sort) url += "&sort=" + sort;

    const resp = await fetchWithTimeout(url, {
        timeout: defaultTimeout,
        onTimeout: () => toast.error(err.timeout),
    });

    plausible("apilistUsers", { props: { time: Date.now() - earlier } });

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
            nsfwImageCount: u.nsfw_image_count,
    });
    }

    return users;
}

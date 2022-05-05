const basePath = "/api";

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
    tweetedAt: string;
    tweetId: string;
    tweetUrl: string;
    url: string;
    userId: number;
}

export interface User {
    id: number;
    createdAt: string;
    updatedAt: string;

    lastScrapedAt: string;
    profileImageUrl: string;
    twitterId: string;
    username: string;
}

export interface GetImagesOptions {
    username?: string;
    exactMatch?: boolean;
}

export async function scrapeUserImages(username: string) {
    const resp = await fetch(basePath + "/images/fetch?username=" + username);

    if (!resp.ok) {
        console.error(resp);
        throw resp.text;
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

    const resp = await fetch(basePath + "/images" + params);

    if (!resp.ok) {
        console.error(resp);
        throw resp.text;
    }

    const images: Image[] = [];
    const data = (await resp.json()) as ListResponse;

    for (const p of data.results) {
        images.push({
            id: p.id,
            userId: p.user_id,
            tweetUrl: p.tweet_url,
            createdAt: p.created_at,
            updatedAt: p.updated_at,
            key: p.key,
            url: p.url,
            tweetId: p.tweet_id,
            tweetedAt: p.tweeted_at,
        });
    }

    return images;
}

export async function getUser(username: string) {
    const resp = await fetch(basePath + "/users?username=" + username);

    if (!resp.ok) {
        console.error(resp);
        throw resp.text;
    }

    const data = await resp.json();
    const user = {
        id: data.id,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
        lastScrapedAt: data.last_scraped_at,
        profileImageUrl: data.profile_image_url,
        twitterId: data.twitter_id,
        username: data.username,
    };

    return user;
}

export async function getUsers() {
    const resp = await fetch(basePath + "/users");

    if (!resp.ok) {
        console.error(resp);
        throw resp.text;
    }

    const users: User[] = [];
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
        });
    }

    return users;
}

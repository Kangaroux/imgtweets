const basePath = "/api";

interface ListResponse {
    count: number;
    next: string | null;
    previous: string | null;
    results: any[];
}

export interface Photo {
    id: number;
    userId: number;
    tweetUrl: string;
    createdAt: string;
    updatedAt: string;
    key: string;
    url: string;
    tweetId: string;
}

export async function getPhotos(): Promise<Photo[] | null> {
    const resp = await fetch(basePath + "/photos");

    if (!resp.ok) {
        console.error(resp);
        return null;
    }

    const photos: Photo[] = [];
    const data = await resp.json() as ListResponse;

    for (const p of data.results) {
        photos.push({
            id: p.id,
            userId: p.user_id,
            tweetUrl: p.tweet_url,
            createdAt: p.created_at,
            updatedAt: p.updated_at,
            key: p.key,
            url: p.url,
            tweetId: p.tweet_id,
        })
    }

    return photos;
}
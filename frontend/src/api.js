const basePath = "/api";

export function getPhotos() {
    return new Promise((resolve, reject) => {
        fetch(basePath + "/photos")
            .then(resp => {
                if (!resp.ok) {
                    console.error(resp);
                    reject(resp);
                    return;
                }

                resolve(resp.json());
            }).catch(reject);
    });
}
export interface FetchOptions extends RequestInit {
    timeout: number;
    onTimeout: () => void;
}

export function fetchWithTimeout(
    input: RequestInfo,
    options: Partial<FetchOptions> = {}
) {
    if (options.timeout) {
        const controller = new AbortController();

        const id = window.setTimeout(() => controller.abort(), options.timeout);
        options.signal = controller.signal;

        if (options.onTimeout) {
            controller.signal.onabort = options.onTimeout;
        }

        return new Promise<Response | null>((resolve, reject) => {
            fetch(input, options)
                .then(resolve)
                .catch((e) => {
                    if (e.name === "AbortError") {
                        console.error("Request timed out", input);
                        resolve(null);
                        return;
                    }

                    reject(e);
                })
                .finally(() => clearTimeout(id));
        });
    }

    return fetch(input, options);
}

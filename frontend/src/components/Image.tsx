import { observer } from "mobx-react-lite";
import { useCallback, useEffect, useState } from "react";

import * as API from "../api";
import "./Image.scss";

// Images within this distance of the viewport will be preloaded
const preloadDistance = "250px";

export interface Props {
    image: API.Image;
    user: API.User;
}

export const Image = observer(({ image, user }: Props) => {
    const [loaded, setLoaded] = useState(false);
    const [failed, setFailed] = useState(false);
    const [observer, setObserver] = useState<IntersectionObserver>();

    // Create the lazy loading observer on mount. Images are preloaded as
    // the placeholder element nears the edge of the screen.
    useEffect(() => {
        const options: IntersectionObserverInit = {
            rootMargin: preloadDistance + " 0px",
        };

        const viewportObserver = new IntersectionObserver((entries) => {
            if (!entries.length) {
                return;
            }

            const e = entries[0];

            if (e.isIntersecting) {
                // Preload the image off screen so we can swap the element immediately.
                // This looks nicer and also prevents an issue where the sudden change
                // in element height causes a cascading effect of other images being
                // preloaded before they should be
                const img = new window.Image();
                img.onload = () => setLoaded(true);
                img.src = image.url;
            }
        }, options);

        setObserver(viewportObserver);

        return () => observer?.disconnect();
    }, []);

    // Observe the footer element which tells us when we are close to
    // the bottom of the page
    const ref = useCallback(
        (el: HTMLElement | null) => {
            if (!observer || !el) {
                return;
            }

            observer.observe(el);
        },
        [observer]
    );

    let inner;

    if (!loaded) {
        inner = <div className="image-placeholder" />;
    } else if (failed) {
        inner = (
            <div className="image-error">
                <h1>deleted?</h1>
            </div>
        );
    } else {
        inner = (
            <div className="image">
                <img src={image.url} alt="" onError={() => setFailed(true)} />
                <div className="image-overlay">
                    <a
                        href={`https://twitter.com/${user.username}`}
                        target="_blank"
                    >
                        @{user.username}
                    </a>
                    {" - "}
                    <a href={image.tweetUrl} target="_blank">
                        View tweet
                    </a>
                </div>
            </div>
        );
    }

    return (
        <div className="image-container" ref={ref}>
            {inner}
        </div>
    );
});

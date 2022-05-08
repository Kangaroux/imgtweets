import { observer } from "mobx-react-lite";
import { useCallback, useEffect, useState } from "react";

import * as API from "../api";
import "./Image.scss";

// Images within this distance of the viewport will be preloaded
const preloadDistance = "250px";

export interface Props {
    image: API.Image;
}

export const Image = observer(({ image }: Props) => {
    const [loaded, setLoaded] = useState(false);
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

    return (
        <div className="image-container" ref={ref}>
            {loaded ? (
                <div className="image">
                    <img src={image.url} alt="" />
                    <div className="image-overlay">
                        <a
                            href={`https://twitter.com/${image.user!.username}`}
                            target="_blank"
                        >
                            @{image.user!.username}
                        </a>
                        {" - "}
                        <a href={image.tweetUrl} target="_blank">
                            View tweet
                        </a>
                    </div>
                </div>
            ) : (
                <div className="image-placeholder" />
            )}
        </div>
    );
});

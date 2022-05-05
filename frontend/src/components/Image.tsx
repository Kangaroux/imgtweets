import { observer } from "mobx-react-lite";
import { useEffect, useRef, useState } from "react";
import * as API from "../api";
import "./Image.scss";

// This margin is the distance between an off-screen image and the viewport.
// Images that come within this distance will be preloaded
const intersectMargin = "250px 0px";

export interface Props {
    image: API.Image;
}

export const Image = observer(({ image }: Props) => {
    const [loaded, setLoaded] = useState(false);
    const [visible, setVisible] = useState(false);
    const ref = useRef(null);

    // Effect for lazy loading images. Images aren't loaded until the placeholder is
    // almost scrolled into view
    useEffect(() => {
        if (ref.current === null) {
            return;
        }

        const cleanUp = () => viewportObserver.disconnect();
        const options: IntersectionObserverInit = {
            rootMargin: intersectMargin,
        };

        const viewportObserver = new IntersectionObserver((entries) => {
            if (!entries.length) {
                return;
            }

            const e = entries[0];

            // The image placeholder is close to being displayed, preload the image
            if (e.isIntersecting) {
                // Preload the image off screen so we can swap the element immediately.
                // This looks nicer and also prevents an issue where the sudden change
                // in element height causes a cascading effect of other images being
                // preloaded before they should be
                const img = new window.Image();
                img.onload = () => setLoaded(true);
                img.src = image.url;

                setVisible(true);
                cleanUp();
            }
        }, options);

        viewportObserver.observe(ref.current);

        return cleanUp;
    }, [ref.current]);

    return (
        <div className="image" ref={ref}>
            {loaded ? (
                <img src={image.url} />
            ) : (
                <div className="image-placeholder" />
            )}
        </div>
    );
});

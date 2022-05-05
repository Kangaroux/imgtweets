import { observer } from "mobx-react-lite";
import { useCallback, useEffect, useMemo, useState } from "react";

import * as API from "../api";
import { Image } from "./Image";
import "./ScrollContainer.scss";

const IMAGES_PER_PAGE = 10;

// The scroll container will display more images once the viewport has been
// scrolled this far from the bottom of the page
const infiniteScrollMargin = "250px";

export interface Props {
    images: API.Image[];
}

export const ScrollContainer = observer(({ images }: Props) => {
    const [page, setPage] = useState(1);
    const [observer, setObserver] = useState<IntersectionObserver>();

    const displayedImages = useMemo(() => {
        return images.slice(0, page * IMAGES_PER_PAGE);
    }, [images, page]);

    // Create the infinite scroll observer on mount
    useEffect(() => {
        const options: IntersectionObserverInit = {
            rootMargin: infiniteScrollMargin + " 0px",
        };

        const viewportObserver = new IntersectionObserver((entries) => {
            if (!entries.length) {
                return;
            }

            const e = entries[0];

            if (e.isIntersecting) {
                setPage((p) => p + 1);
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
        <div className="scroll-container">
            {displayedImages.map((img) => (
                <Image image={img} key={img.id} />
            ))}
            {displayedImages.length && <span ref={ref} />}
        </div>
    );
});

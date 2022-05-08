import { observer } from "mobx-react-lite";
import { useCallback, useEffect, useMemo, useState } from "react";

import * as API from "../api";
import { Image } from "./Image";
import "./ScrollContainer.scss";

const IMAGES_PER_PAGE = 10;

// The scroll container will display more images once the viewport has been
// scrolled this far from the bottom of the page
const infiniteScrollMargin = "300px 0px";

export interface Props {
    images: API.Image[];
}

export const ScrollContainer = observer(({ images }: Props) => {
    const [page, setPage] = useState(1);
    const [containerRef, setContainerRef] = useState<HTMLElement | null>(null);
    const [observer, setObserver] = useState<IntersectionObserver>();

    const displayedImages = useMemo(() => {
        return images.slice(0, page * IMAGES_PER_PAGE);
    }, [images, page]);

    // Reset the container if the images change
    useEffect(() => {
        if (!containerRef) {
            return;
        }

        containerRef.scrollTop = 0;
        setPage(1);
    }, [images, containerRef]);

    // Create an observer with the container as the root element. Using the
    // viewport as the root doesn't seem to work since the container is
    // what's scrolling
    const containerCallback = useCallback((el: HTMLElement | null) => {
        setContainerRef(el);

        if (!el || observer) {
            observer?.disconnect();
            return;
        }

        const options: IntersectionObserverInit = {
            root: el,
            rootMargin: infiniteScrollMargin,
        };

        const viewportObserver = new IntersectionObserver((entries) => {
            if (!entries.length) {
                return;
            }

            const e = entries[0];

            console.log(e);

            if (e.isIntersecting) {
                setPage((p) => p + 1);
            }
        }, options);

        setObserver(viewportObserver);
    }, []);

    // Observe the footer element which tells us when we are close to
    // the bottom of the page
    const footerCallback = useCallback(
        (el: HTMLElement | null) => {
            if (!observer || !el) {
                return;
            }

            observer.observe(el);
        },
        [observer]
    );

    return (
        <div className="scroll-container" ref={containerCallback}>
            <div className="scroll-container-flex">
                {displayedImages.map((img) => (
                    <Image image={img} key={img.id} />
                ))}
            </div>
            {!!displayedImages.length && <div ref={footerCallback} />}
        </div>
    );
});

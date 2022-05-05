import { observer } from "mobx-react-lite";
import { useEffect, useState } from "react";
import { store, ToastArgs } from "../store";

import { Toast, Props as ToastProps } from "./Toast";

// How long to display the toast, in milliseconds.
export const TOAST_DISPLAY_TIME = 4 * 1000;

// How long it takes the toast to move off screen, in milliseconds.
export const TOAST_HIDE_TIME = 400;

export const ToastManager = observer(() => {
    const [queue, setQueue] = useState<ToastArgs[]>([]);

    useEffect(() => {
        const handler = (args: ToastArgs) => {
            setQueue((q) => q.concat(args));
            setTimeout(
                () =>
                    setQueue((q) => {
                        const copy = [...q];
                        copy.splice(0, 1);
                        console.log(q, copy);
                        return copy;
                    }),
                TOAST_DISPLAY_TIME + TOAST_HIDE_TIME
            );
        };
        store.addToastHandler(handler);
        return () => store.removeToastHandler(handler);
    }, []);

    if (!queue.length) {
        return null;
    }

    const props: ToastProps = { ...queue[0], displayTime: TOAST_DISPLAY_TIME };

    return <Toast {...props} />;
});

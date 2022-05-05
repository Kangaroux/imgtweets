import { observer } from "mobx-react-lite";
import { useCallback, useState } from "react";
import { ToastArgs } from "../store";

import "./Toast.scss";

export interface Props extends ToastArgs {
    displayTime: number;
}

export const Toast = observer(({ displayTime, msg, type }: Props) => {
    const [show, setShow] = useState(false);

    const ref = useCallback((el: HTMLElement | null) => {
        if (el) {
            // Hack for playing the entrance animation
            setTimeout(() => setShow(true));
            setTimeout(() => setShow(false), displayTime);
        }
    }, []);

    let className = "toast toast-" + type;

    if (show) {
        className += " toast-show";
    }

    return (
        <div className={className} ref={ref}>
            {msg}
        </div>
    );
});

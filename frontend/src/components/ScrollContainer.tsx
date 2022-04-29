import { observer } from "mobx-react-lite";
import * as API from "../api";
import { Image } from "./Image";
import "./ScrollContainer.css";

export interface Props {
    images?: API.Image[];
}

export const ScrollContainer = observer(({ images }: Props) => {
    if (!images) {
        return null;
    }

    return <div className="scroll-container">{images.map(img => <Image image={img} />)}</div>;
});
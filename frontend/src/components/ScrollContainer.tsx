import { observer } from "mobx-react-lite";
import * as API from "../api";
import { Photo } from "./Photo";
import "./ScrollContainer.css";

export interface Props {
    photos?: API.Photo[];
}

export const ScrollContainer = observer(({ photos }: Props) => {
    if (!photos) {
        return null;
    }

    return <div className="scroll-container">{photos.map(p => <Photo photo={p} />)}</div>;
});
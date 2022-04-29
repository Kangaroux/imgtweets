import { h, render } from "preact";
import { getPhotos } from "./api";

render(<h1>Hello world!</h1>, document.getElementById("root"));

getPhotos().then(r => console.log(r));
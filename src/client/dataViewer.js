import "@lwc/synthetic-shadow";
import { createElement } from "lwc";
import App from "dataViewer/app";

document
	.querySelector("#main")
	.appendChild(createElement("data-viewer-app", { is: App }));

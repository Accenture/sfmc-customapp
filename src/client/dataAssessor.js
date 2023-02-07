import "@lwc/synthetic-shadow";
import { createElement } from "lwc";
import App from "dataAssessor/app";

document
	.querySelector("#main")
	.appendChild(createElement("data-assessor-app", { is: App }));

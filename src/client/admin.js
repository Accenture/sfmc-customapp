import "@lwc/synthetic-shadow";
import { createElement } from "lwc";
import App from "admin/app";

document
	.querySelector("#main")
	.appendChild(createElement("admin-app", { is: App }));

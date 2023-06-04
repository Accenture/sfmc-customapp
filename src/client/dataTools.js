import "@lwc/synthetic-shadow";
import { createElement } from "lwc";
import Activity from "datatools/app";

document
	.querySelector("#main")
	.appendChild(createElement("datatools-app", { is: Activity }));

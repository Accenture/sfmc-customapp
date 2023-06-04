import "@lwc/synthetic-shadow";
import { createElement } from "lwc";
import Activity from "datatools/test";

document
	.querySelector("#main")
	.appendChild(createElement("datatools-test", { is: Activity }));

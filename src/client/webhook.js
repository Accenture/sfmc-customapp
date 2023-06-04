import "@lwc/synthetic-shadow";
import { createElement } from "lwc";
import Activity from "webhook/activity";

document
	.querySelector("#main")
	.appendChild(createElement("webhook-activity", { is: Activity }));

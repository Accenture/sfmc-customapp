import "@lwc/synthetic-shadow";
import { createElement } from "lwc";
import Activity from "platformEvent/activity";

document
	.querySelector("#main")
	.appendChild(createElement("platform-event-activity", { is: Activity }));

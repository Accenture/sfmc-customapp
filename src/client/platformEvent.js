import "@lwc/synthetic-shadow";
import { createElement } from "lwc";
import Activity from "platformevent/activity";

document
	.querySelector("#main")
	.appendChild(
		createElement("platformevent-activity", { is: Activity })
	);

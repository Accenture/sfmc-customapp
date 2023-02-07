import "@lwc/synthetic-shadow";
import { createElement } from "lwc";
import Activity from "salesforceNotifications/activity";

document
	.querySelector("#main")
	.appendChild(
		createElement("salesforce-notifications-activity", { is: Activity })
	);

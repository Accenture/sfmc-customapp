import "@lwc/synthetic-shadow";
import { createElement } from "lwc";
import Activity from "salesforceNotifications/activity";

document
	.querySelector("#main")
	.append(
		createElement("salesforce-notifications-activity", { is: Activity })
	);

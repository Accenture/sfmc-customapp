import "@lwc/synthetic-shadow";
import { createElement } from "lwc";
import App from "salesforceNotifications/app";

document
	.querySelector("#main")
	.appendChild(createElement("salesforce-notifications-app", { is: App }));

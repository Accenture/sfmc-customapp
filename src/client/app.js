import "@lwc/synthetic-shadow";
import { createElement } from "lwc";
import App from "salesforceNotifications/app";

document
	.querySelector("#main")
	.append(createElement("salesforce-notifications-app", { is: App }));

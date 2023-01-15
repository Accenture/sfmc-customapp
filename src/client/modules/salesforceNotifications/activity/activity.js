import { LightningElement } from "lwc";

export default class Activity extends LightningElement {
	// context;
	steps = [import("salesforceNotifications/notificationDesigner")];
	activityName = "Salesforce Notification";
	activityIcon = "standard:custom_notification";
	contextEvents = [
		"ready",
		"requestCulture",
		"requestDataSources",
		"requestContactsSchema",
		"requestTokens"
	];

	// app handler for saving. ie. convert config to arguments across multiple steps
	/**
	 *
	 * @param evt
	 */
	async handleSave(workingActivity) {
		workingActivity.arguments = workingActivity.arguments || {};
		workingActivity.name = this.activityName;
		workingActivity.arguments.execute = workingActivity.arguments.execute || {};
		workingActivity.arguments.execute.inArguments = [
			{ type: workingActivity.metaData.sections[0].config.type.value },
			{ content: workingActivity.metaData.sections[0].config.content.value },
			{
				recipient: workingActivity.metaData.sections[0].config.recipient.value
			},
			{ target: workingActivity.metaData.sections[0].config.target.value },
			{ mid: workingActivity.metaData.sections[0].config.mid }
		];
	}
}

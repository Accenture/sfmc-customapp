import { LightningElement } from "lwc";

export default class PlatformEvent extends LightningElement {
	// context;
	steps = [import("platformEvent/eventDesigner")];
	activityName = "Platform Event";
	activityIcon = "standard:events";
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
			{ event: workingActivity.metaData.sections[0].config.event },
			{ fields: workingActivity.metaData.sections[0].config.fields },
			{ mid: workingActivity.metaData.sections[0].config.mid }
		];
	}

	// // shouldnt use
	// updateActivity() {
	// 	//do all fields have a value.

	// 	const newPayload = JSON.parse(JSON.stringify(this.config.payload));
	// 	const argfields = {};
	// 	for (const field of this.fields) {
	// 		argfields[field.name] = field.value;
	// 	}
	// 	newPayload.arguments.execute.inArguments = [
	// 		{ event: this.platformevent },
	// 		{ fields: argfields },
	// 		{ mid: this.sessionContext.organization.member_id }
	// 	];

	// 	//testing this to see if it saves
	// 	newPayload.configurationArguments.params = argfields;
	// 	newPayload.metaData.isConfigured =
	// 		this.fields.filter((field) => !field.value).length === 0;
	// 	this.activity.update(newPayload);
	// }

	// // NOT CALLED
	// async getSessionContext() {
	// 	const res = await fetch("/platformevent/context");
	// 	const resJson = await res.json();
	// 	if (res.status > 299) {
	// 		this.showAlert({
	// 			detail: {
	// 				type: "error",
	// 				message: resJson.message
	// 			}
	// 		});
	// 		this.isLoading = false;
	// 		return;
	// 	}
	// 	// eslint-disable-next-line consistent-return
	// 	return resJson;
	// }

	// showAlert(e) {
	// 	this.alert = e.detail.type
	// 		? e.detail
	// 		: {
	// 				type: "error",
	// 				message: e.detail.message || JSON.stringify(e.detail.errors)
	// 		  };
	// }
}

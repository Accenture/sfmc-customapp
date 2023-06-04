// import * as Postmonger from "postmonger";
import { Session } from "./journeymessaging.js";
import { getByEvent } from "./mapping.js";

const stableSession = new Session();
/**
 *
 * @param event name of event which should be triggered
 * @param [data] any relevant data which should be sent with event
 * @returns result from interaction if available
 */
export async function interact(event, data) {
	const eventMap = getByEvent(event);
	const obj = {};
	//if interaction should have data, and was not provided OR no default is given, then throw error
	if (eventMap.hasData && !data && eventMap.defaultData === undefined) {
		throw new Error(
			`"${event}" requires a data value and no default was provided`
		);
	}

	obj[eventMap.dataKey] = await stableSession.interact(
		eventMap.trigger,
		eventMap.on,
		data || eventMap.defaultData
	);
	if (!eventMap.dataKey) {
		return;
	}
	//special handling cases
	switch (eventMap.dataKey) {
		case "activity": {
			// sections is a great way to store confg, but it stores it in string for some reason
			// here we reset that to an object before returning.
			if (
				obj[eventMap.dataKey]?.metaData?.sections &&
				typeof obj[eventMap.dataKey]?.metaData?.sections === "string"
			) {
				obj[eventMap.dataKey].metaData.sections = JSON.parse(
					obj[eventMap.dataKey]?.metaData?.sections
				);
			}
			break;
		}
		default: {
			break;
		}
	}
	return obj;
}

export const eventHandlers = {
	closeModal: function () {
		interact("destroy");
	},
	close: function () {
		interact("requestInspectorClose");
	},
	updateActivity: function (evt) {
		const temp = this.workingActivity; // consider cloning lib here
		temp.metaData.sections[evt.detail.stepIndex] = evt.detail;
		this.workingActivity = Object.assign({}, temp);
		interact("setActivityDirtyState");
	}
};

/**
 *
 * @param activity
 */
export function isConfigured(activity) {
	for (const section of activity.metaData.sections) {
		if (!section || !section.isConfigured) {
			return false;
		}
	}
	return true;
}

export async function authenticate(tokens) {
	console.log("authenticate");
	const authRes = await fetch("/api/v1/authenticate", {
		method: "POST",
		body: JSON.stringify({
			access_token: tokens.fuel2token,
			expires_in: tokens.expires
		}),
		headers: {
			"Content-Type": "application/json"
		}
	});
	if (authRes.status !== 200) {
		try {
			const payload = await authRes.json();
			throw new Error(payload.message);
		} catch {
			throw new Error(authRes.statusText);
		}
	}
	return authRes;
}

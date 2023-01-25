import { LightningElement, api, track } from "lwc";
import { fireEvent, fetchWithHandleErrors } from "sfmc/utils";

export default class StepOne extends LightningElement {
	@api context;
	@api workingActivity;
	@api stepIndex;
	@api interact;

	@track config = {
		availableTypes: null,
		type: {
			value: null,
			label: null
		},
		recipient: {
			value: "",
			disabled: true
		},
		target: {
			value: "",
			disabled: true
		},
		content: {
			value: "",
			disabled: true
		},
		mid: {
			value: ""
		}
	};
	selectedField;

	/**
	 *
	 */
	async connectedCallback() {
		fireEvent(this, "loading", true);
		this.config.mid = this.context.contactsSchema.schemaReponse.schema.clientID;
		//rehydrate
		if (this.workingActivity.metaData.sections[this.stepIndex]?.config) {
			//as this is set from a passed attribute (@api) we need to clone so we can later modify within the component
			this.config = JSON.parse(
				JSON.stringify(
					this.workingActivity.metaData.sections[this.stepIndex]?.config
				)
			);
		}
		const notificationList = await fetchWithHandleErrors(
			this,
			"/salesforceNotification/v1/notificationTypes"
		);
		if (notificationList && notificationList.records?.length > 0) {
			this.config.availableTypes = notificationList.records;
		} else if (notificationList && notificationList.length === 0) {
			fireEvent(this, "toast", {
				title: "No Results",
				message: "No Notification Types were returned",
				variant: "error",
				timeout: 3000
			});
		}
		if (this.config.type.value) {
			const matchedNotificationType = notificationList.records.find(
				(record) => record.Id === this.config.type.value
			);
			if (!matchedNotificationType) {
				this.config.type.value = null;
				fireEvent(this, "toast", {
					title: "Invalid Notificaiton Type",
					message: `The Notificaiton type ${this.config.type.value} count not be found, please select another`,
					variant: "error",
					timeout: 3000
				});
			}
		}

		fireEvent(this, "loading", false);
	}
	disconnectedCallback() {
		//reset all values to disabled when going back
		this.selectedField = null;
		for (const key in this.config) {
			if (Object.prototype.hasOwnProperty.call(this.config, key)) {
				this.config[key].disabled = true;
			}
		}
	}

	/**
	 *
	 */
	get notificationTypesList() {
		return this.config.availableTypes.map((e) => {
			return { label: e.CustomNotifTypeName, value: e.Id };
		});
	}

	/**
	 *
	 * @param e
	 */
	onTargetChange(e) {
		this.config.target.value = e.detail.value;
		this.updateStep();
	}
	/**
	 *
	 * @param e
	 */
	onRecipientChange(e) {
		this.config.recipient.value = e.detail.value;
		this.updateStep();
	}
	/**
	 *
	 * @param e
	 */
	onContentChange(e) {
		this.config.content.value = e.detail.value;
		this.updateStep();
	}

	/**
	 *
	 * @param e
	 */
	handleTypeChange(e) {
		this.config.type.value = e.detail.value;
		this.updateStep();
	}

	/**
	 *
	 * @param e
	 */
	toggleEdit(e) {
		if (this.selectedField === e.target.name) {
			this.selectedField = null;
			this.interact("requestInspectorResize", "medium");
		} else {
			this.selectedField = e.target.name;
			this.interact("requestInspectorResize", "large");
		}

		this.config.content.disabled = this.selectedField !== "content";
		this.config.recipient.disabled = this.selectedField !== "recipient";
		this.config.target.disabled = this.selectedField !== "target";
	}

	/**
	 *
	 * @param e
	 */
	appendValue(e) {
		this.config[this.selectedField].value += e.detail.name;
		this.updateStep();
	}

	/**
	 *
	 */
	updateStep() {
		fireEvent(this, "update", {
			stepIndex: 0,
			config: this.config,
			isConfigured: this.isConfigured()
		});
	}

	/**
	 *
	 */
	isConfigured() {
		return (
			!!this.config.type.value &&
			!!this.config.recipient.value &&
			!!this.config.content.value &&
			!!this.config.target.value
		);
	}

	get calculateSize() {
		return this.selectedField ? 6 : 12;
	}
}

import { LightningElement, api, track } from "lwc";
import {
	fetchWithHandleErrors,
	loadingEvent,
	toastEvent,
	updateEvent
} from "sfmc/utils";

export default class StepOne extends LightningElement {
	@api context;
	@api workingActivity;
	@api stepIndex;
	@api interact;

	selectedField;
	platformEventList;
	fields;

	@track config = {
		availableEvents: undefined, // may not be needed
		eventSchema: undefined,
		event: undefined,
		fields: [],
		mid: undefined
	};

	async connectedCallback() {
		this.dispatchEvent(loadingEvent(true));

		this.config.mid = this.context.contactsSchema.schemaReponse.schema.clientID;

		//rehydrate
		if (this.workingActivity.metaData.sections[this.stepIndex]?.config) {
			//as this is set from a passed attribute (@api) we need to clone so we can later modify within the component
			this.config = JSON.parse(
				JSON.stringify(
					this.workingActivity.metaData.sections[this.stepIndex]?.config
				)
			);
			// set all fields to disabled
			this.config.fields = this.config.fields.map((field) => {
				field.disabled = true;
				return field;
			});
		}
		const platformEventRecords = await fetchWithHandleErrors(
			this,
			"/platformEvent/v1/platformEvents"
		);
		if (platformEventRecords && platformEventRecords?.length > 0) {
			this.platformEventList = platformEventRecords.map((e) => {
				return { label: e.label, value: e.name, fields: e.fields };
			});
		} else if (platformEventRecords && platformEventRecords.length === 0) {
			this.dispatchEvent(
				toastEvent(
					"No Results",
					"No Platform Events were returned",
					"error",
					3000
				)
			);
		}
		this.dispatchEvent(loadingEvent(false));
	}

	onFieldChange(event) {
		for (const field of this.fields) {
			if (field.name === this.selectedField) {
				field.value = event.detail.value;
				break;
			}
		}
		this.updateStep();
	}

	handleEventChange(e) {
		this.config.event = e.detail.value;
		this.fields = this.platformEventList.find((obj) => obj.value === e.detail.value).fields.filter((field) => field.createable)
			.map((field) => {
				field.value = field.defaultValue || "";
				field.disabled = true;
				return field;
			});
		if(this.fields.length === 0){
			this.dispatchEvent(
				toastEvent(
					"No fields supported",
					"No creatable fields on this platform event",
					"warning",
					3000
				)
			);

		} 
		this.config.fields = this.fields.map((field) => {
			return {
				disabled: true,
				value: field.defaultValue || "",
				label: field.label,
				name: field.name,
				nillable: field.nillable
			};
		});
		this.updateStep();	
	}
	/**
	 *
	 * @param e
	 */
	toggleEdit(e) {
		if (this.selectedField === e.target.name) {
			this.selectedField = undefined;
			this.interact("requestInspectorResize", "medium");
		} else {
			this.selectedField = e.target.name;
			this.interact("requestInspectorResize", "large");
		}
		this.config.fields = this.config.fields.map((field) => {
			field.disabled = field.name !== this.selectedField;
			return field;
		});
	}
	appendValue(e) {
		this.config.fields.find(
			(field) => field.name === this.selectedField
		).value += e.detail.name;
		this.updateStep();
	}

	/**
	 *
	 */
	updateStep() {
		this.dispatchEvent(updateEvent(0, this.config, this.isConfigured()));
	}
	/**
	 *
	 */
	isConfigured() {
		return (
			this.config.event &&
			this.config.fields.filter((field) => {
				return !field.nillable && field.value === "";
			}).length === 0
		);
	}
}

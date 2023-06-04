import { LightningElement, api } from "lwc";
import * as sdk from "sfmc/sdk";
export default class Activity extends LightningElement {
	@api title;
	@api iconName;
	context;
	@api contextEvents;
	workingActivity;
	@api steps;
	isLoading = true;
	eventHandlers = sdk.eventHandlers;
	interact = sdk.interact;
	stepComponent;
	stepIndex = 0;
	isAuthenticated = false;
	@api saveHandler;

	/**
	 *
	 * @param ex
	 * @param stack
	 */
	errorCallback(ex, stack) {
		console.error("UNHANDLED ERROR", ex, stack);
		this.template.querySelector("sfmc-toast").showToastEvent({
			title: "Error",
			message: ex.message,
			variant: "error",
			timeout: 3000
		});
	}

	/**
	 *
	 */
	async connectedCallback() {
		try {
			const events = await Promise.all(this.contextEvents.map(event => sdk.interact(event)));

			this.context = Object.assign(...events);
			//authenticate to server for persisting context

			//load previous settings OR empty
			this.context.activity.metaData.sections =
				this.context.activity.metaData.sections || [];
			// console.log("CALLED AUTHENTICATE");
			// await sdk.authenticate(this.context.tokens); // this check will ensure authentication of backend
			this.isAuthenticated = true;
			this.isLoading = false;
			this.workingActivity = JSON.parse(JSON.stringify(this.context.activity));
			this.loadStep();
		} catch (error) {
			console.error('UNHANDLED ERROR', error)
			this.template.querySelector("sfmc-toast").showToastEvent({
				title: "Error",
				message: error.message,
				variant: "error",
				timeout: 10_000
			});
		}
	}

	/**
	 *
	 */
	get nextLabel() {
		return this.steps.length - this.stepIndex === 1 ? "Save" : "Next";
	}
	/**
	 *
	 */
	get backLabel() {
		return this.stepIndex > 0 ? "Back" : undefined;
	}

	/**
	 *
	 */
	get isNextDisabled() {
		const currentSection =
			this.workingActivity.metaData.sections[this.stepIndex];
		// if null then return true

		if (currentSection?.isConfigured === true) {
			return false;
		}
		return true;
	}
	//dynamicaly load a component by index
	/**
	 *
	 */
	async loadStep() {
		const stepPromise = await this.steps[this.stepIndex];
		this.stepComponent = stepPromise.default;
	}
	/**
	 *
	 */
	async onNext() {
		if (this.steps.length - this.stepIndex === 1) {
			this.saveHandler(this.workingActivity);
			this.workingActivity.metaData.isConfigured = sdk.isConfigured(
				this.workingActivity
			);
			await sdk.interact("updateActivity", this.workingActivity);
		} else {
			this.stepIndex++;
			this.loadStep();
		}
	}
	/**
	 *
	 */
	onBack() {
		this.stepIndex--;
		this.loadStep();
	}

	/**
	 *
	 * @param evt
	 */
	handleToast(evt) {
		this.template.querySelector("sfmc-toast").showToastEvent(evt.detail);
		console.log("toast", evt.detail);
	}
	/**
	 *
	 * @param evt
	 */
	handleLoading(evt) {
		console.log("loading", evt.detail);
		this.isLoading = evt.detail;
	}
}

import { LightningElement, api } from "lwc";

// export function showToastEvent(e) {
//   thisPrivate.template.querySelector("sfmc-toast").showToastEvent(e);
// }
export default class Toast extends LightningElement {
	title;
	message;
	variant;
	mode;
	isVisible;
	//   timer;

	/**
	 *
	 * @param event
	 */
	@api
	showToastEvent(event) {
		this.isVisible = true;
		const timer = setTimeout(
			() => {
				this.clearToast();
				clearTimeout(timer);
			},
			event.timeout > 0 ? event.timeout : 3000
		);
		this.title = event.title;
		this.message = event.message;
		this.variant = event.variant || "success";
	}

	/**
	 *
	 */
	clearToast() {
		this.isVisible = false;
		this.title = null;
		this.message = null;
		this.variant = null;
	}
	/**
	 *
	 */
	get icon() {
		return "utility:" + this.variant;
	}
	/**
	 *
	 */
	get variantClass() {
		return "slds-notify slds-notify_toast slds-theme_" + this.variant;
	}
}

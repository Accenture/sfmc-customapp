import { LightningElement, track } from "lwc";
import { classSet } from "lightning/utils";
export default class DataPicker extends LightningElement {
	@track isLoading = false;
	@track tree;
	@track keyValue;

	/**
	 *
	 */
	async connectedCallback() {
		try {
			this.isLoading = true;

			const deTree = await fetch("/dataViewer/DataTree");
			if (deTree.status === 200 && deTree.status === 200) {
				const data = await deTree.json();
				this.tree = data.tree[0];
				this.keyValue = data.keyValue;
			} else {
				this.dispatchEvent(
					new CustomEvent("error", {
						bubbles: true,
						composed: true,
						detail: {
							type: "error",
							message: "Authentication error"
						}
					})
				);
			}
		} catch (error) {
			this.dispatchEvent(
				new CustomEvent("error", {
					bubbles: true,
					composed: true,
					detail: {
						type: "error",
						message: error.message
					}
				})
			);
		}
		this.isLoading = false;
	}

	/**
	 *
	 */
	get computedPanelClass() {
		let classes = classSet("slds-split-view_container");
		if (this.isPanelClosed) {
			classes.add("slds-is-closed");
		} else {
			classes.add("slds-is-open");
		}

		return classes.toString();
	}

	/**
	 *
	 * @param e
	 */
	handleClick(e) {
		e.stopPropagation();
		if (e.detail.name.startsWith("FOLDER:")) {
			console.log("Clicking Folder shouldnt do anything", e.detail);
		} else {
			if (e.detail.name) {
				this.dispatchEvent(
					new CustomEvent("selectitem", {
						bubbles: true,
						composed: true,
						detail: this.keyValue[e.detail.name]
					})
				);
			} else {
				this.dispatchEvent(
					new CustomEvent("selectitem", {
						bubbles: true,
						composed: true,
						detail: null
					})
				);
			}
		}
	}
}

import { api } from "lwc";
import LightningModal from "lightning/modal";

export default class SelectorModal extends LightningModal {
	@api content;
	selectedDataExtension;
	//selected-item if preselect

	handleOkay() {
		this.close(this.selectedDataExtension);
	}

	get isDisabled() {
		return !this.selectedDataExtension;
	}

	handleSelectItem(e) {
		e.stopPropagation();

		if (e.detail && e.detail.name) {
			if (
				this.selectedDataExtension == undefined ||
				e.detail.name !== this.selectedDataExtension.name
			) {
				this.selectedDataExtension = e.detail;
			}
		} else {
			this.selectedDataExtension = null;
		}
	}
}

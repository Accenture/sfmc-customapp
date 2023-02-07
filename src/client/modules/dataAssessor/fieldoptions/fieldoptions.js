import { LightningElement, track, api } from "lwc";
import SetFieldOptions from "dataAssessor/SetFieldOptions";

export default class FieldOptions extends LightningElement {
	@track updatedField;
	@api field;

	async handleEdit() {
		const temp = await SetFieldOptions.open({
			field: this.field
		});
		//in case save was clicked then some value will be provided
		if (temp) {
			this.dispatchEvent(
				new CustomEvent("changefield", {
					bubbles: true,
					composed: true,
					detail: temp
				})
			);
		}
	}
	handledelete() {
		this.dispatchEvent(
			new CustomEvent("deletefield", {
				bubbles: true,
				composed: true,
				detail: this.field
			})
		);
	}
}

import { api } from "lwc";
import LightningModal from "lightning/modal";
import LightningAlert from "lightning/alert";

export default class SaveModal extends LightningModal {
	@api fields;
	filename = "";
	isLoading = false;
	handlefilename(e) {
		this.filename = e.detail.value;
	}
	async handlesave() {
		this.isLoading = true;
		const saveMetadata = JSON.parse(JSON.stringify(this.fields)).map(
			(field) => {
				delete field.key;
				delete field.match;
				return field;
			}
		);
		const resData = await fetch("/dataAssessor/createDataExtension", {
			method: "POST",
			headers: {
				"Content-Type": "application/json"
			},
			body: JSON.stringify({
				name: this.filename,
				fields: saveMetadata
			})
		});
		if (resData.status === 200) {
			await LightningAlert.open({
				message: "Data Extension Created Successfully",
				theme: "success", // a red theme intended for error states
				label: "Success!" // this is the header text
			});
			this.close();
		} else {
			const res = await resData.json();
			await LightningAlert.open({
				message: res.Results.map((a) => a.StatusMessage).join("\n"),
				theme: "error", // a red theme intended for error states
				label: "Error!" // this is the header text
			});
		}
		this.isLoading = false;
		console.log(saveMetadata);
	}
}

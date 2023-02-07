import { LightningElement, track, api } from "lwc";
import LightningAlert from "lightning/alert";
import SaveModal from "dataAssessor/saveModal";

export default class App extends LightningElement {
	@api handleclick;
	@track status = { loading: false };
	@track rows;
	@track headers;
	@track settings = {
		defaultPhoneLocale: "US",
		delimiter: ",",
		inputdata: undefined
	};
	@track isLoading = false;
	get hasNoInputData() {
		return !this.settings.inputdata;
	}
	get hasNotLoadedData() {
		return !(this.rows && this.headers);
	}
	async handleSave() {
		await SaveModal.open({
			fields: this.headers,
			onloading: this.handleloading
		});
	}
	loadData(inputdata) {
		this.isLoading = true;
		if (inputdata.target.files[0].size > 1e7) {
			this.isLoading = false;
			this.dispatchEvent(
				new CustomEvent("error", {
					bubbles: true,
					composed: true,
					detail: {
						type: "error",
						message: "Only files up to 10mb are supported",
						link: "/dataTools/login"
					}
				})
			);
		} else {
			this.settings.inputdata = inputdata.target.files[0];
			this.isLoading = false;
		}
	}
	updatedfield(e) {
		// finds the corresponding header for the detail and replace
		const headerIndex = this.headers.findIndex(
			(header) => header.key === e.detail.key
		);
		this.headers[headerIndex] = e.detail;
	}
	deletedfield(e) {
		let i = 0;
		for (const header of this.headers) {
			if (header.key === e.detail.key) {
				this.headers.splice(i, 1);
				break;
			} else {
				i++;
			}
		}
		const tempRows = JSON.parse(JSON.stringify(this.rows));
		//this.rows = null;
		console.log(JSON.stringify(tempRows[0]));
		for (const row of tempRows) {
			//delete row.columns[i];
			row.columns.splice(i, 1);
		}
		console.log(JSON.stringify(tempRows[0]));
		this.rows = tempRows;
	}
	setphonelocale(e) {
		this.settings.defaultPhoneLocale = e.detail.text;
	}
	setDelimiter(e) {
		this.settings.delimiter = e.detail.text;
	}
	async parsedata() {
		this.isLoading = true;
		//reset data
		this.headers = undefined;
		this.rows = undefined;
		const resData = await fetch(
			"/dataAssessor/exampledata?phonelocale=" +
				this.settings.defaultPhoneLocale +
				"&delimiter=" +
				this.settings.delimiter,
			{
				method: "POST",
				headers: {
					"Content-Type": "text/plain"
				},
				body: await this.settings.inputdata.text()
			}
		);
		if (resData.status === 200) {
			const fields = await resData.json();
			this.rows = this.extractRows(fields);
			this.headers = this.extractHeaders(fields);
			await LightningAlert.open({
				message: "Data Loaded Successfully",
				theme: "success", // a red theme intended for error states
				label: "Success!" // this is the header text
			});
		} else if (resData.status === 204) {
			this.dispatchEvent(
				new CustomEvent("error", {
					bubbles: true,
					composed: true,
					detail: {
						type: "warning",
						message: "No Data Found"
					}
				})
			);
		} else {
			this.dispatchEvent(
				new CustomEvent("error", {
					bubbles: true,
					composed: true,
					detail: {
						type: "error",
						message: await resData.json()
					}
				})
			);
		}
		this.isLoading = false;
	}
	changeField(button) {
		this.status.edit = true;
		console.log("buttonclick", button, button.target.id, button.detail);
	}
	handleloading(e) {
		console.log("handleloading", e);
		this.isLoading = e.detail;
	}
	extractHeaders(fields) {
		return fields.map((a) => {
			const matchPc = Math.round((a.match / a.total) * 100);
			return {
				Name: a.Name,
				key: a.Name,
				FieldType: a.FieldType,
				Scale: a.Scale,
				Precision: a.Precision,
				IsPrimaryKey: a.IsPrimaryKey,
				IsRequired: a.IsRequired,
				match: matchPc,
				MaxLength: a.MaxLength
			};
		});
	}

	variant(pc) {
		if()
	}
	extractRows(fields) {
		const pivoted = [];
		let i = 0;
		for (const field of fields) {
			let ii = 0;
			for (const exampleValue of field.exampleData) {
				if (!pivoted[ii]) {
					pivoted[ii] = { columns: [], key: ii };
				}
				pivoted[ii].columns.push({
					value: exampleValue,
					key: i + "-" + ii
				});
				ii++;
			}
			i++;
		}
		console.log(pivoted);
		return pivoted;
	}
}

import { LightningElement, track, api } from "lwc";
import { classSet } from "lightning/utils";
import LightningAlert from "lightning/alert";
import SelectorModal from "dataViewer/selectorModal";
export default class App extends LightningElement {
	@track dataExtensions = {};
	@track _dataExtension;

	@track isLoading = false;

	get awaitingSelection() {
		return !this._dataExtension;
	}

	//data table
	defaultSortDirection = "asc";
	sortDirection = "asc";
	sortedBy;

	//todo: chec if conversion needed
	typeMapping = {
		Text: "text",
		Date: "date",
		Number: "number",
		Decimal: "decimal",
		Boolean: "checkbox",
		Phone: "phone",
		Locale: "locale"
	};

	handleClickOpen() {
		const id = this._dataExtension.id;
		window.open(
			`https://mc.s7.exacttarget.com/contactsmeta/admin.html#admin/data-extension/${id}/properties/`,
			"_blank"
		);
	}
	async updateDataExtension(value) {
		this.isLoading = true;
		//get fields
		const resDE = await fetch(`/dataViewer/DataExtension/${value.name}/fields`);
		if (resDE.status === 200) {
			// raw fields
			const Fields = await resDE.json();
			value.fields = Fields.map((field) => {
				return {
					label: field.Name,
					fieldName: field.Name,
					type: this.typeMapping[field.FieldType] || field.FieldType,
					sortable: true
				};
			});
		} else {
			LightningAlert.open({
				message: "TODO SHOW ERROR",
				theme: "error", // a red theme intended for error states
				label: "Error!" // this is the header text
			});
		}
		this.isLoading = false;

		this._dataExtension = value;
	}

	showErrors(e) {
		console.log("showerrors in app", e);
		this.alert = e.detail;
	}
	handleFilter(e) {
		console.log("handleFilter", e);
		this._dataExtension.filter =
			e.detail.value && e.detail.field && e.detail.operator ? e.detail : null;
	}

	async handleLoad(e) {
		this.isLoading = true;
		const resData = await fetch("/dataViewer/DataExtensionData", {
			method: "POST",
			headers: {
				"Content-Type": "application/json"
			},
			body: JSON.stringify({
				key: this._dataExtension.key,
				name: this._dataExtension.name,
				filter: this._dataExtension.filter,
				fields: this._dataExtension.fields
			})
		});
		if (resData.status === 200) {
			this._dataExtension.rows = await resData.json();
		} else if (resData.status === 204) {
			LightningAlert.open({
				message: "No Data Found",
				theme: "error", // a red theme intended for error states
				label: "Error!" // this is the header text
			});
		} else {
			LightningAlert.open({
				message: (await resData.json()).message,
				theme: "error", // a red theme intended for error states
				label: "Error!" // this is the header text
			});
		}
		this.isLoading = false;
	}

	async handleSelectSource() {
		const result = await SelectorModal.open({
			size: "large",
			description: "Select Data Source"
		});
		if (result) {
			this.updateDataExtension(result);
		}
	}

	// Used to sort the 'Age' column
	sortBy(field, reverse, primer) {
		const key = primer
			? function (x) {
					return primer(x[field]);
			  }
			: function (x) {
					return x[field];
			  };

		return function (a, b) {
			a = key(a);
			b = key(b);
			return reverse * ((a > b) - (b > a));
		};
	}

	onHandleSort(event) {
		const { fieldName: sortedBy, sortDirection } = event.detail;
		const cloneData = [...this._dataExtension.rows];

		cloneData.sort(this.sortBy(sortedBy, sortDirection === "asc" ? 1 : -1));
		this._dataExtension.rows = cloneData;
		this.sortDirection = sortDirection;
		this.sortedBy = sortedBy;
	}
}

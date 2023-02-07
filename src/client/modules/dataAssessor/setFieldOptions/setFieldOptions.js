import { api, track } from "lwc";
import LightningModal from "lightning/modal";
// import LightningAlert from "lightning/alert";

export default class SetFieldOptions extends LightningModal {
	@track _field;
	@api set field(value) {
		this._field = { ...value };
	}
	get field() {
		return this._field;
	}

	types = [
		{ value: "Text", label: "Text" },
		{ value: "Date", label: "Date" },
		{ value: "Number", label: "Number" },
		{ value: "Decimal", label: "Decimal" },
		{ value: "Boolean", label: "Boolean" },
		{ value: "Phone", label: "Phone" },
		{ value: "Locale", label: "Locale" },
		{ value: "EmailAddress", label: "Email Address" }
	];

	get checkBoxValues() {
		const checked = [];
		if (this.field.IsPrimaryKey) {
			checked.push("IsPrimaryKey");
		}
		if (this.field.IsRequired) {
			checked.push("IsRequired");
		}
		return checked;
	}

	get checkboxOptions() {
		return [
			{
				label: "Primary Key",
				value: "IsPrimaryKey"
			},
			{
				label: "Required",
				value: "IsRequired"
			}
		];
	}

	handleCheckboxChange(e) {
		this.hasChange = true;
		this._field.IsPrimaryKey = e.detail.value.includes("IsPrimaryKey");
		this._field.IsRequired = e.detail.value.includes("IsRequired");
	}

	editname(e) {
		this.hasChange = true;
		this._field.Name = e.detail.value;
	}
	editlen(e) {
		this.hasChange = true;
		this._field.MaxLength = e.detail.value;
	}
	editprecision(e) {
		this.hasChange = true;
		this._field.Precision = e.detail.value;
	}
	editscale(e) {
		this.hasChange = true;
		this._field.Scale = e.detail.value;
	}
	edittype(e) {
		this.hasChange = true;
		//reset some values on type change
		if (e.detail.value !== "Text") {
			delete this._field.MaxLength;
		} else if (this._field.MaxLength === null) {
			this._field.MaxLength = 50;
		}
		if (e.detail.value !== "Decimal") {
			delete this._field.Precision;
			delete this._field.Scale;
		} else if (this._field.Precision === null && this._field.Scale === null) {
			this._field.Precision = 18;
			this._field.Scale = 2;
		}
		this._field.FieldType = e.detail.value;
	}

	async handlesave() {
		// if a change then return value, otherwise just close
		this.hasChange ? this.close(this._field) : this.close();
	}

	get isText() {
		return this._field.FieldType === "Text";
	}

	get isNumber() {
		return this._field.FieldType === "Number";
	}

	get isDecimal() {
		return this._field.FieldType === "Decimal";
	}
}

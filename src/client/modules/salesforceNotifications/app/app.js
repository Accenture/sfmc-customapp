import { LightningElement } from "lwc";

export default class App extends LightningElement {
	config = {};
	context = {};
	connection;
	isLoading = true;
	isEdit = true;

	get isEditable() {
		return !this.connection || this.isEdit;
	}
	handleCancel() {
		this.isEdit = false;
	}

	get connectionUrl() {
		return (
			this.connection?.urls?.custom_domain ||
			"https://yourinstance.my.salesforce.com"
		);
	}

	async connectedCallback() {
		// const session = await fetch("/api/context");
		// const context = await session.json();
		const res = await fetch("/sfdc/connection");
		if (res.status == 200) {
			this.connection = await res.json();
		}
		// this.context = context;
		this.isEdit = false;
		this.isLoading = false;
	}
	changeConnection() {
		this.isEdit = true;
	}
	async removeConnection() {
		this.isLoading = true;
		try {
			await fetch(`/sfdc/credentials`, {
				method: "DELETE"
			});
			this.connection = null;
		} catch (ex) {}
		this.isLoading = false;
	}

	handleInput(val) {
		this.config[val.target.name] = val.target.value;
	}
	async handleSubmit() {
		console.log(this.config);
		const res = await fetch("/sfdc/credentials", {
			method: "POST",
			body: JSON.stringify(
				Object.assign(this.config, { appUri: window.location.href })
			),
			headers: {
				"Content-Type": "application/json"
			},
			redirect: "follow"
		});
		window.location = await res.text();
		// windowRef.addEventListener("load", (event) => {
		// 	console.log("ON LOAD", event);
		// });
		// windowRef.addEventListener("beforeunload", (event) => {
		// 	console.log("ON CLOSE", event);
		// });
	}
}

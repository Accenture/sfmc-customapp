/**
 *
 * @param privateThis
 * @param eventName
 * @param value
 */
export function fireEvent(privateThis, eventName, value) {
	privateThis.dispatchEvent(
		new CustomEvent(eventName, {
			bubbles: true,
			composed: true,
			detail: value
		})
	);
}
export function updateEvent(stepIndex, config, isConfigured) {
	return new CustomEvent("update", {
		bubbles: true,
		composed: true,
		detail: {
			stepIndex: stepIndex,
			config: config,
			isConfigured: isConfigured
		}
	});
}

export function loadingEvent(isLoading) {
	return new CustomEvent("loading", {
		bubbles: true,
		composed: true,
		detail: isLoading
	});
}
export function toastEvent(title, message, variant, timeout) {
	return new CustomEvent("toast", {
		bubbles: true,
		composed: true,
		detail: {
			title: title,
			message: message,
			variant: variant,
			timeout: timeout
		}
	});
}
export async function fetchWithHandleErrors(privateThis, url, options) {
	const res = await fetch(url, options);
	let payload;
	try {
		payload = await res.json();
		if (res.status > 299) {
			privateThis.dispatchEvent(
				toastEvent("Error", payload.message, "error", 3000)
			);
		} else {
			return payload;
		}
	} catch {
		privateThis.dispatchEvent(
			toastEvent("Error", res.statusText, "error", 3000)
		);
	}
}
export function getCookieByName(name) {
	try {
		return document.cookie
			.split(";")
			.find((row) => row.startsWith(name))
			.split("=")[1];
	} catch (error) {
		this.dispatchEvent(
			new CustomEvent("error", {
				bubbles: true,
				composed: true,
				detail: {
					type: "error",
					message: "Issues with the session, try refreshing the page"
				}
			})
		);
		this.isLoading = false;
		throw error;
	}
}

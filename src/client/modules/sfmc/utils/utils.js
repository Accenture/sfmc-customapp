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
export async function fetchWithHandleErrors(privateThis, url, options) {
	const res = await fetch(url, options);
	let payload;
	try {
		payload = await res.json();
		if (res.status > 299) {
			fireEvent(privateThis, "toast", {
				title: "Error",
				message: payload.message,
				variant: "error",
				timeout: 3000
			});
		} else {
			return payload;
		}
	} catch (ex) {
		fireEvent(privateThis, "toast", {
			title: "Error",
			message: res.statusText,
			variant: "error",
			timeout: 3000
		});
	}
	return null;
}

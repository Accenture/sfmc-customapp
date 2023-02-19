// Create a new client
import { Firestore } from "@google-cloud/firestore";
const firestore = new Firestore();

export async function setConfig(key, value) {
	const documentReference = firestore.doc("config/" + key);
	return documentReference.set(value);
}
export async function getConfig(key) {
	const documentReference = firestore.doc("config/" + key);
	const snapshot = await documentReference.get();
	if (snapshot.exists) {
		return snapshot.data();
	} else {
		throw new Error("Key not found");
	}
}
export async function deleteConfig(key) {
	const documentReference = firestore.doc("config/" + key);
	return await documentReference.delete();
}

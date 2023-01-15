let _window = window;

export class Connection {
	connect;
	from;
	to;
	constructor(options = {}) {
		this.connect = options.connect || _window.parent;
		this.from = options.from || "*";
		this.to = options.to || "*";

		//If string, grab based on id
		if (typeof this.connect === "string") {
			this.connect = document.getElementById(this.connect);
		}
		//If still no connection, check for iframe
		else if (
			this.connect &&
			!this.connect.postMessage &&
			(this.connect.contentWindow || this.connect.contentDocument)
		) {
			this.connect = this.connect.contentWindow || this.connect.contentDocument;
		}
		//Throw warning if connection could not be made
		else if (!(this.connect && this.connect.postMessage)) {
			throw new Error(
				" Warning: Postmonger could not establish connection with ",
				options.connect
			);
		}
	}
}

export class EventInstance {
	resolve;
	reject;
	prm;
	constructor() {
		this.prm = new Promise((resolve, reject) => {
			this.resolve = resolve;
			this.reject = reject;
		});
	}
	done(value) {
		this.resolve(value);
	}
}

export class Session {
	connection;
	triggerMap = {};

	constructor(options) {
		this.connection = new Connection(options);
		//Add the listener
		if (_window.addEventListener) {
			_window.addEventListener("message", this.postMessageListener, false);
		} else {
			throw new Error(
				"WARNING: Postmonger could not listen for messages on window %o"
			);
		}
	}

	interact(triggerName, responseName, details) {
		
		if(responseName){
			//store promise for later resolving if response expected
			this.triggerMap[responseName] = new EventInstance();
		}
		const message = { e: triggerName };
		//TODO confirm if this case is normal (needed for save)
		if (details && Array.isArray(details)) {
			for (const detail of details) {
				console.log("detail", detail);
				message["a1"] = detail;
			}
		} else if(details){
			//TODO confirm if this case is normal (needed for save)
			message["a1"] = details;

		}
		this.connection.connect.postMessage(
			JSON.stringify(message),
			this.connection.to
		);
		if(responseName){
			//return promise to allow async /await
			return   this.triggerMap[responseName].prm;
		} else {
			return;
		}
		
	}

	postMessageListener = (event) => {
		//confirm the source is mc
		//Attempt to find the connection we're dealing with
		if (
			this.connection.connect === event.source &&
			this.connection.from === "*" &&
			this.connection.from !== event.origin
		) {
			//Check the data that's been passed
			const data = JSON.parse(event.data);
			if (!data.e) {
				throw new Error("Data returned was not in expected format");
			} else if (!this.triggerMap[data.e]) {
				console.warn("Event not handled or had no response", data);
			} else {
				//delete e then cycle through all other keys
				const responseName = data.e;
				delete data.e;
				//Format the passed in data
				for (const k in data) {
					this.triggerMap[responseName].done(data[k]);
					delete this.triggerMap[responseName];
				}
			}
		}
	};
}

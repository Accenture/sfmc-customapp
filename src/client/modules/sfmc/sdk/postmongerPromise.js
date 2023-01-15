let _window = window;

export class Connection {
	connect;
	from;
	to;
	constructor(options) {
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

export class Events {
	_callbacks = {};
	_has = (obj, key) => {
		return Object.prototype.hasOwnProperty.call(obj, key);
	};
	_keys = (obj) => {
		if (Object.keys) {
			return Object.keys(obj);
		}

		if (typeof obj !== "object") {
			throw new TypeError("Invalid object");
		}

		const keys = [];

		for (const key in obj) {
			if (this._has(obj, key)) {
				keys[keys.length] = key;
			}
		}
		return keys;
	};
	constructor() {}

	on = (events, callback, context) => {
		let calls, event, node, tail, list;

		if (!callback) {
			return this;
		}

		events = parseEvents(events);

		this._callbacks = this._callbacks || {};
		calls = this._callbacks;

		while ((event = events.shift())) {
			list = calls[event];

			node = list ? list.tail : {};
			tail = {};

			node.next = tail;
			node.context = context;
			node.callback = callback;

			calls[event] = {
				tail: tail,
				next: list ? list.next : node
			};
		}

		return this;
	};

	off = (events, callback, context) => {
		let calls = this._callbacks;
		let event, node, tail, cb, ctx;

		if (!calls) {
			return;
		}

		if (!(events || callback || context)) {
			delete this._callbacks;
			return this;
		}

		events = events ? parseEvents(events) : this._keys(calls);

		while ((event = events.shift())) {
			node = calls[event];
			delete calls[event];
			if (!node || !(callback || context)) {
				continue;
			}

			tail = node.tail;
			while ((node = node.next) !== tail) {
				cb = node.callback;
				ctx = node.context;
				if ((callback && cb) !== callback || (context && ctx) !== context) {
					this.on(event, cb, ctx);
				}
			}
		}

		return this;
	};
	trigger = (events) => {
		let event, node, calls, tail, args, all, rest;

		if (!(calls = this._callbacks)) {
			return this;
		}

		all = calls.all;
		events = parseEvents(events);
		rest = Array.prototype.slice.call(...events, 1);

		while ((event = events.shift())) {
			if ((node = calls[event])) {
				tail = node.tail;
				while ((node = node.next) !== tail) {
					node.callback.apply(node.context || this, rest);
				}
			}
			if ((node = all)) {
				tail = node.tail;
				args = [event].concat(rest);
				while ((node = node.next) !== tail) {
					node.callback.apply(node.context || this, args);
				}
			}
		}

		return this;
	};
}

export class Session {
	connections = [];
	incoming = new Events();
	outgoing = new Events();
	on = this.incoming.on;
	off = this.incoming.off;
	trigger = this.outgoing.trigger;
	end = () => {
		if (_window.removeEventListener) {
			_window.removeEventListener("message", postMessageListener, false);
		}
		return this;
	};
	args;

	constructor(options) {
		// console.log('ARGUMENTS', arguments);
		// this.args = (arguments.length>0) ? Array.prototype.slice.call(arguments, 0) : [{}];
		this.args = [{}];
		for (const arg of this.args) {
			const connection = new Connection(options);
			//if already existing, then skip
			if (
				connection &&
				this.connections.filter(
					(conn) =>
						conn.connect === connection.connect &&
						conn.from === connection.from &&
						conn.to === connection.to
				).length === 0
			) {
				//otherwise add to connection list
				this.connections.push(connection);
			}
		}

		//Add the listener
		if (_window.addEventListener) {
			_window.addEventListener("message", this.postMessageListener, false);
		} else {
			throw new Error(
				"WARNING: Postmonger could not listen for messages on window %o"
			);
		}

		//Sending outgoing messages
		this.outgoing.on("all", (eventName) => {
			console.log("args", eventName, arguments);
			const messageArgs = Array.prototype.slice.call(arguments, 0);
			const message = { e: eventName };

			let k, len;
			for (k = 1, len = messageArgs.length; k < len; k++) {
				message["a" + k] = args[k];
			}
			for (const conn of this.connections) {
				conn.connect.postMessage(JSON.stringify(message), conn.to);
			}
			return this;
		});
	}

	postMessageListener = (event) => {
		console.log("LISTENER", event);
		//Attempt to find the connection we're dealing with
		const conn = this.connections.find((conn) => conn.connect === event.source);
		//Check if we've found the connection
		if (!conn) {
			return false;
		} //Check if the message is from the expected origin
		else if (conn.from !== "*" && conn.from !== event.origin) {
			return false;
		}
		let data;
		const message = [];

		//Check the data that's been passed
		try {
			data = JSON.parse(event.data);
			if (!data.e) {
				return false;
			} else {
				message.push(data.e);
			}
		} catch (e) {
			return false;
		}
		delete data.e;
		//Format the passed in data
		for (const k in data) {
			message.push(data[k]);
		}
		//Send the message
		this.incoming.trigger.apply(_window, message);
	};
}

function parseEvents(events) {
	return events.split(/\s+/);
}

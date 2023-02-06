

const _window = window;

export class Session {
	triggerMap = {};
	

	constructor() {
		var args = (arguments.length>0) ? Array.prototype.slice.call(arguments, 0) : [{}];
		console.log('SESSION', args);
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
		let prm;
		if(responseName){
			//store promise for later resolving if response expected
			prm = new Promise( resolve => {
				this.triggerMap[responseName] = resolve;
			})
		}
		const message = { e: triggerName };
		//TODO confirm if this case is normal (needed for save)
		if (details && Array.isArray(details)) {
			for (const detail of details) {
				console.log("detail", detail);
				message.a1 = detail;
			}
		} else if(details){
			//TODO confirm if this case is normal (needed for save)
			message.a1 = details;

		}
		// _window.parent.postMessage();
		_window.parent.postMessage(
			JSON.stringify(message),
			'*'
		);
		if(responseName){
			//return promise to allow async /await
			return   prm;
		} 
			
		
		
	}

	postMessageListener = (event) => {
		//confirm the source is mc
		//Attempt to find the connection we're dealing with
		if (
			event.origin.endsWith('marketingcloudapps.com') && 
			event.origin.startsWith( 'https://jbinteractions') && //ensures only messages from journey builder
			_window.parent === event.source
		) {
			//Check the data that's been passed
			const data = JSON.parse(event.data);
			if (!data.e) {
				throw new Error("Data returned was not in expected format");
			} else if (this.triggerMap[data.e]) {
				//delete e then cycle through all other keys
				const responseName = data.e;
				delete data.e;
				//Format the passed in data
				for (const k in data) {
					//resolve the promise with data;
					this.triggerMap[responseName](data[k]);
					delete this.triggerMap[responseName];
				}
			} else {
				console.warn("Event not handled or had no response", data);
			}
		}
	};
}

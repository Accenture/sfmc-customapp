export function config(req, res) {
	res.json({
		workflowApiVersion: "1.1",
		metaData: {
			// the location of our icon file
			icon: `/images/platformeventsicon.png`,
			category: "customer",
			backgroundColor: "#032e61",
			expressionBuilderPrefix: "Platform"
		},
		// allows copying of activity (undocumented)
		copySettings: {
			allowCopy: true,
			displayCopyNotification: true
		},
		// For Custom Activity this must say, "REST"
		type: "REST",
		lang: {
			"en-US": {
				name: "Platform Event",
				description: "Use for sending a platform Event"
			}
		},
		arguments: {
			execute: {
				// See: https://developer.salesforce.com/docs/atlas.en-us.mc-apis.meta/mc-apis/how-data-binding-works.htm
				inArguments: [],
				outArguments: [],
				// Fill in the host with the host that this is running on.
				// It must run under HTTPS
				url: `https://${req.headers.host}/platformevent/v1/execute`,
				// The amount of time we want Journey Builder to wait before cancel the request. Default is 60000, Minimal is 1000
				timeout: 10_000,
				// how many retrys if the request failed with 5xx error or network error. default is 0
				retryCount: 3,
				// wait in ms between retry.
				retryDelay: 1000,
				// The number of concurrent requests Journey Builder will send all together
				concurrentRequests: 5,
				// sign request
				useJwt: true
			}
		},
		configurationArguments: {
			publish: {
				url: `https://${req.headers.host}/platformevent/v1/publish`,
				useJwt: true
			},
			validate: {
				url: `https://${req.headers.host}/platformevent/v1/validate`,
				useJwt: true
			},
			stop: {
				url: `https://${req.headers.host}/platformevent/v1/stop`,
				useJwt: true
			},
			save: {
				url: `https://${req.headers.host}/platformevent/v1/save`,
				useJwt: true
			}
		},
		userInterfaces: {
			configurationSupportsReadOnlyMode: true,
			configInspector: {
				size: "scm-lg",
				emptyIframe: true,
				runningModal: { url: "activity/login" }
			}
		},
		schema: {
			arguments: {
				execute: {
					inArguments: [],
					outArguments: []
				}
			}
		},
		edit: {
			url: `https://${req.headers.host}/platformevent/login`
		}
	});
}

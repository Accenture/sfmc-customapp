export function config(req, res) {
	res.json({
		workflowApiVersion: "1.1",
		metaData: {
			// the location of our icon file
			icon: "/images/lwc.png",
			iconSmall: "/images/lwc.png",
			category: "messaging",
			backgroundColor: "#032e61",
			expressionBuilderPrefix: "sfnotif",
			version: "1.0"
		},
		key: "sfmc-gcp",
		// allows copying of activity (undocumented)
		copySettings: {
			allowCopy: true,
			displayCopyNotification: true
		},
		// For Custom Activity this must say, "REST"
		type: "REST",
		lang: {
			"en-US": {
				name: "Salesforce Notification",
				description: "Send a Salesforce Notification to a User or Contact"
			}
		},
		arguments: {
			execute: {
				// See: https://developer.salesforce.com/docs/atlas.en-us.mc-apis.meta/mc-apis/how-data-binding-works.htm
				inArguments: [],
				outArguments: [],
				// Fill in the host with the host that this is running on.
				// It must run under HTTPS
				url: `https://${req.headers.host}/salesforceNotification/v1/execute`,
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
				url: `https://${req.headers.host}/salesforceNotification/v1/publish`,
				useJwt: false
			},
			validate: {
				url: `https://${req.headers.host}/salesforceNotification/v1/validate`,
				useJwt: false
			},
			stop: {
				url: `https://${req.headers.host}/salesforceNotification/v1/stop`,
				useJwt: false
			},
			save: {
				url: `https://${req.headers.host}/salesforceNotification/v1/save`,
				useJwt: false
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
		supportsEngagementDecision: false,
		useSso: false,
		schema: {
			arguments: {
				execute: {
					inArguments: [
						{
							type: {
								dataType: "Text",
								isNullable: false,
								direction: "in"
							}
						},
						{
							context: {
								dataType: "Text",
								isNullable: false,
								direction: "in"
							}
						},
						{
							recipient: {
								dataType: "Text",
								isNullable: false,
								direction: "in"
							}
						},
						{
							target: {
								dataType: "Text",
								isNullable: false,
								direction: "in"
							}
						},
						{
							mid: {
								dataType: "Text",
								isNullable: false,
								direction: "in"
							}
						}
					],
					outArguments: [
						{
							status: {
								dataType: "Text",
								direction: "out",
								access: "visible"
							}
						}
					]
				}
			}
		},
		edit: {
			url: `https://${req.headers.host}/salesforceNotification/login`
		}
	});
}

export const mapping = [
	{ trigger: "ready", on: "initActivity", dataKey: "activity" },
	{
		trigger: "requestInteraction",
		on: "requestedInteraction",
		dataKey: "journey"
	},
	{
		trigger: "requestTriggerEventDefinition",
		on: "requestedTriggerEventDefinition",
		dataKey: "entrySource"
	},
	{
		trigger: "requestEndpoints",
		on: "requestedEndpoints",
		dataKey: "endpoints"
	},
	{ trigger: "requestSchema", on: "requestedSchema", dataKey: "schema" },
	{ trigger: "requestTokens", on: "requestedTokens", dataKey: "tokens" },
	{
		trigger: "requestDataSources",
		on: "requestedDataSources",
		dataKey: "dataSources"
	},
	{
		trigger: "requestEngineSettings",
		on: "requestedEngineSettings",
		dataKey: "engineSettings"
	},
	{
		trigger: "requestDataLibrarySource",
		on: "requestedDataLibrarySource",
		dataKey: "dataLibrarySource",
		hasData: true
	},
	{
		trigger: "requestContactsSchema",
		on: "requestedContactsSchema",
		dataKey: "contactsSchema"
	},
	{
		trigger: "requestExpressionBuilderAttributes",
		on: "requestedExpressionBuilderAttributes",
		dataKey: "expressionBuilderAttributes"
	},
	{
		trigger: "requestUserTimeZone",
		on: "requestedUserTimeZone",
		dataKey: "userTimeZone"
	},
	{
		trigger: "requestEntryEventDefinitionKey",
		on: "requestedEntryEventDefinitionKey",
		dataKey: "entryEventDefinitionKey"
	},
	{
		trigger: "requestI18nConfig",
		on: "requestedI18nConfig",
		dataKey: "i18nConfig"
	},
	{
		trigger: "requestActivityPayload",
		on: "requestedActivityPayload",
		dataKey: "activity"
	},
	{
		trigger: "requestInteractionDefaults",
		on: "requestedInteractionDefaults",
		dataKey: "niteractionDefaults"
	},
	{
		trigger: "requestActivityPermissions",
		on: "requestedActivityPermissions",
		dataKey: "activityPermissions"
	},
	{
		trigger: "requestInteractionGoalStats",
		on: "requestedInteractionGoalStats",
		dataKey: "interactionGoalStats"
	},
	{
		trigger: "requestValidEmailsForEngagement",
		on: "requestedValidEmailsForEngagement",
		dataKey: "validEmailsForEngagement"
	},

	{
		trigger: "requestUtilizationRecords",
		on: "requestedUtilizationRecords",
		dataKey: "utilizationRecords"
	},
	{
		trigger: "requestCulture",
		on: "requestedCulture",
		dataKey: "culture"
	},
	{
		trigger: "updateActivity",
		hasData: true
	},
	{
		trigger: "requestInspectorClose"
	},
	{
		trigger: "destroy"
	},
	{ trigger: "requestInspectorResize", hasData: true },
	{ trigger: "setActivityDirtyState", hasData: true, defaultData: true },
	{ trigger: "setActivityConfigured", hasData: true, defaultData: true }
];

/**
 *
 * @param requestEvent
 */
export function getByEvent(requestEvent) {
	const event = mapping.find((pair) => pair.trigger === requestEvent);
	if (event) {
		return event;
	}
	throw new Error(`Event "${requestEvent}" is not supported'`);
}

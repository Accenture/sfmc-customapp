# Example Custom Applications for SFMC

\#sfmc-lwcactivity

## Overview

With the rise of SFMC we have seen more and more clients ask for custom acitvities. On the SFDC side we have seen those same clients adopt LWC for their SFDC platform.

We also see custom acitivties & applications being built which either lack the end-to-end build process, lack aspects like connection& session management, or lack a real "framework" for development.

This repo is an attempt to bring both parts together in with a realistic build chain (webpack, heroku, etc) to provide a realistic example for you to start working from without having to start from scratch.

This is far from being a perfect app. Examples right now for improvement are

-   No Hover or Running UI on Activity
-   Potential to queue and batch Platform Events rather than just executing one by one

## TLDR

Example custom application('for SFMC

-   Platform Events Activity
    -   App for Config at /platformeventapp
    -   Activity at /platformeventactivity
-   Data Tools
    -   Utilities at /dataTools

[![Deploy](https://www.herokucdn.com/deploy/button.svg)](https://www.heroku.com/deploy/?template=https://github.com/Accenture/sfmc-customapp)

## How to start?

Custom development in Marketing Cloud falls largely into two catories, on-platform (eg. SSJS, Cloud Pages) and off-platform (Custom Applications & Activities). Off-platform integrations are added via `Setup => Installed Packages`

### Custom Activities

Custom Activities allow native-like integration('into Journey Builder by leveraging an external service such as Heroku to manage the UI and the integration('with Journey Builder.

[Official Documentation](https://developer.salesforce.com/docs/atlas.en-us.mc-app-development.meta/mc-app-development/getting-started.htm)

[Example from Salesforce](https://github.com/salesforce-marketingcloud/sfmc-example-jb-custom-activity)

### Custom Applications

Custom Application('are a way to integrate external web applications into the Marketing Cloud UI by using an Iframe and OAuth-base SSO.

[Official Documentation](https://developer.salesforce.com/docs/atlas.en-us.mc-app-development.meta/mc-app-development/create-a-mc-app.htm)

## Development

1. Install your favourite IDE, we use VScode.
2. Clone repo
3. Open repo and optionally install recommended extensions. This will help manage formatting.
4. Run `npm i` to install dependencies.
5. Create an Installed Package in SFMC
6. Update `.env` file in root to store youre credentials. An example is included, but you will need to update some for your SFMC instance
7. Once updated, run `npm run watch` to run the application('locally
8. Check below for app specific configuration.

## Platform Event Application

NOTE: We can only configure one `Application` per Installed package. This basically just allows the App to show up in App Exchange Menu. In this case we use the Platform Event Application as the main app, Data Tools will use the API Integration of this one, but have its own Application

### Configure Marketing Cloud

-   To the Installed Package add an API Integration using Web App
-   To the Installed Package add an Application with Login URL https://HOSTNAMEHERE/platformeventapp
-   To the Installed Package add an Activity with Endpoint URL https://HOSTNAMEHERE/api/platformeventactivity

## Data Tools Application

### Configure Marketing Cloud

-   To the Installed Package add an Application with Login URL https://HOSTNAMEHERE/dataTools

## Known Limitations

This repo shold be considered a beta version. We have this working and would love to see further extensions but feel it is enough to get started.
We would also want to see improvements on('base-component support outside of the SFDC platfrom, along with relevant build tools to be able to build and extend custom development quicker.

## Extensions to Documentation

These are aspects not covered by existing documentation('and may or not be official.

### Postmonger Events

[Official Documentation](https://developer.salesforce.com/docs/atlas.en-us.noversion.mc-app-development.meta/mc-app-development/using-postmonger.htm)

### Schema (on('requestedSchema), trigger('requestSchema'))

returns the schema (data designer model)

### DataSources (on('requestedDataSources), trigger('requestDataSources'))

returns information('about the data sources used in the journey

### AllowedOriginResponse (on('registeredAllowedOriginResponse'))

TBC

### InteractionGoalStats (on('requestedInteractionGoalStats), trigger('requestInteractionGoalStats'))

returns the Goal Stats for the current Journey (used at run time, not config)

### ActivityPermissions (on('requestedActivityPermissions), trigger('requestActivityPermissions'))

TBC

### EngineSettings (on('requestedEngineSettings), trigger('requestEngineSettings'))

TBC

### DataLibrarySource (on('requestedDataLibrarySource), trigger('requestDataLibrarySource'))

TBC

### ContactsSchema (on('requestedContactsSchema), trigger('requestContactsSchema'))

TBC

### ExpressionBuilderAttributes (on('requestedExpressionBuilderAttributes), trigger('requestExpressionBuilderAttributes'))

TBC

### UserTimeZone (on('requestedUserTimeZone), trigger('requestUserTimeZone'))

Returns the timezone config for the current user

### EntryEventDefinitionKey (on('requestedEntryEventDefinitionKey), trigger('requestEntryEventDefinitionKey'))

TBC

### I18nConfig (on('requestedI18nConfig), trigger('requestI18nConfig'))

TBC

### ActivityPayload (on('requestedActivityPayload), trigger('requestActivityPayload'))

TBC

### InspectorResize (on('requestedInspectorResize), trigger('requestInspectorResize', :SIZE))

Change the size of the activity modal in Journey Builder
SIZE Parameter can be Small, Medium or Large
requestedSchema

### Config.json

[Official Documentation](https://developer.salesforce.com/docs/atlas.en-us.noversion.mc-app-development.meta/mc-app-development/example-rest-activity.htm)

User Interfaces can be added to configure how the activity is displayed

```
userInterfaces: {
    configurationSupportsReadOnlyMode: true,
    canvasLabelKey : "canvasLabel",
    runningHover : {
        "url" : "runningHover.html",
        "hideDetailsButton": true
    },
    configInspector: {
        size: 'scm-lg',
        emptyIframe: true
    },
    configModal: {
        "maxHeight":600,
        "maxWidth":900,
        "minHeight":300,
        "minWidth":500
    },
},
"edit": {
    "uri": "",
    "fullscreen": true
}
```

metadata object allows for additional attributes like background colour and exressionBuilderPrefix

```
metaData: {
    // the location of our icon file
    icon: `https://${req.headers.host}/resources/icon.png`,
    category: 'customer',
    backgroundColor: '#032e61',
    expressionBuilderPrefix: 'Platform'
},
```

this enables the activity to be configured

```
"isEditable": true,
```

this enables the activity to be copied

```
"copySettings": {
    "allowCopy": true
}
```

Allows you to limit either view or edit based on permissions

```
"permissions": {
    "view": ["DataExtension.View"]
}
```

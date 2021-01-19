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

Example custom applications for SFMC

-   Platform Events Activity
    -   App for Config at /platformevent/app
    -   Activity at /platformevent/activity
-   Data Tools
    -   Utilities at /dataTools

[![Deploy](https://www.herokucdn.com/deploy/button.svg)](https://www.heroku.com/deploy/?template=https://github.com/Accenture/sfmc-customapp)

## How to start?

Custom development in Marketing Cloud falls largely into two catories, on-platform (eg. SSJS, Cloud Pages) and off-platform (Custom Applications & Activities). Off-platform integrations are added via `Setup => Installed Packages`

### Local execution

1. Install Openssl if required (https://slproweb.com/products/Win32OpenSSL.html)
2. Generate self-signed Certificates using ```npm run build:cert```
3. Copy example.env and change to .env
4. Update values (many of these come from below so don't worry if you dont have them all yet)


### Custom Activities

Custom Activities allow native-like integration into Journey Builder by leveraging an external service such as Heroku to manage the UI and the integration with Journey Builder.

[Official Documentation](https://developer.salesforce.com/docs/atlas.en-us.mc-app-development.meta/mc-app-development/getting-started.htm)

[Example from Salesforce](https://github.com/salesforce-marketingcloud/sfmc-example-jb-custom-activity)

### Custom Applications

Custom Applications are a way to integrate external web applications into the Marketing Cloud UI by using an Iframe and OAuth-base SSO.

[Official Documentation](https://developer.salesforce.com/docs/atlas.en-us.mc-app-development.meta/mc-app-development/create-a-mc-app.htm)

## Development

1. Install your favourite IDE, we use VScode.
2. Clone repo
3. Open repo and optionally install recommended extensions. This will help manage formatting.
4. Run `npm i` to install dependencies.
5. Create an Installed Package in SFMC
6. Update `.env` file in root to store youre credentials. An example is included, but you will need to update some for your SFMC instance
7. Once updated, run `npm run watch` to run the application locally
8. Check below for app specific configuration.

## Platform Event Application

NOTE: We can only configure one `Application` per Installed package. This basically just allows the App to show up in App Exchange Menu. In this case we use the Platform Event Application as the main app, Data Tools will use the API Integration of this one, but have its own Application

### Configure Marketing Cloud (Part 1)

-   To the Installed Package add an API Integration using Web App

    -   Add Redirect Urls (you can put both if needed)

        -   If running locally for dev - https://127.0.0.1:3002/sfmc/auth/login/response
        -   If running on server for prod - https://HOSTNAMEHERE/sfmc/auth/login/response

        NOTE: you will need the client id, secret and jwt for setup. If you do not know the hostname yet, you can put a temporary one and replace it later on.

-   To the Installed Package add an Application with Login URL https://HOSTNAMEHERE/platformevent/app/login
-   To the Installed Package add an Activity with Endpoint URL https://HOSTNAMEHERE/platformevent/activity

### Configure Salesforce

-   Create a connected App via `Setup => App Manager => New Connected App`
-   Provide
    -   A Name
    -   An Email
    -   Enable OAuth Settings = TRUE
    -   Callback URL (You can put both if needed)
        -   If running locally for dev - https://127.0.0.1:3002/platformevent/oauth/response/MID-OF-BUSINESSUNIT
        -   If running on a server for prod - https://HOSTNAMEHERE/platformevent/oauth/response/MID-OF-BUSINESSUNIT
    -   Permission
        -   Access your basic information (id, profile, email, address, phone)
        -   Access and manage your data (api)
        -   Provide access to your data via the Web (web)
        -   Perform requests on your behalf at any time (refresh_token, offline_access)
    -   Require Secret for Web Server Flow = TRUE
-   Copy the Consumer Key & Consumer Secret

### Configure Marketing Cloud (Part 2)

-   Navigate to `App Exchange=> Platform Event App` (or whatever you called this app)
-   Provide
    -   Client Id - This is your SFDC Consumer Key
    -   Client Secret Consumer Secret
    -   Your Saleforce instace URL
-   Click Connect

NOTE: If you get an error like `error=redirect_uri_mismatch&error_description=redirect_uri%20must%20match%20configuration` it is because your redirect URLs in SFDC are incorrect

## Data Tools Application

### Configure Marketing Cloud

-   To the Installed Package add an Application with Login URL https://HOSTNAMEHERE/dataTools/login

## Known Limitations

This repo shold be considered a beta version. We have this working and would love to see further extensions but feel it is enough to get started.
We would also want to see improvements on base-component support outside of the SFDC platfrom, along with relevant build tools to be able to build and extend custom development quicker.

## Extensions to Documentation

These are aspects not covered by existing documentation and may or not be official.

### Postmonger Events

[Official Documentation](https://developer.salesforce.com/docs/atlas.en-us.noversion.mc-app-development.meta/mc-app-development/using-postmonger.htm)

### Schema (on('requestedSchema), trigger('requestSchema'))

returns the schema of the entry source

```
{
    "schema": [
        {
            "key": "Event.DEAudience-eabac269-8abc-2a8b-aebb-56d0728fdfb3.ContactKey",
            "type": "Text",
            "length": 50,
            "default": "secondValye",
            "isNullable": null,
            "isPrimaryKey": true
        },
        {
            "key": "Event.DEAudience-eabac269-8abc-2a8b-aebb-56d0728fdfb3.Email",
            "type": "EmailAddress",
            "length": 254,
            "default": null,
            "isNullable": true,
            "isPrimaryKey": null
        },
        {
            "key": "Event.DEAudience-eabac269-8abc-2a8b-aebb-56d0728fdfb3.restrictedvalue",
            "type": "Text",
            "length": 50,
            "default": "happy",
            "isNullable": true,
            "isPrimaryKey": null
        }
    ]
}

```

### DataSources (on('requestedDataSources), trigger('requestDataSources'))

returns information('about the data sources used in the journey

```
[
    {
        "id": "Event",
        "name": "Entry: lWC",
        "eventDefinitionKey": "DEAudience-eabac269-8abc-2a8b-aebb-56d0728fdfb3",
        "keyPrefix": "Event.DEAudience-eabac269-8abc-2a8b-aebb-56d0728fdfb3.",
        "schema": null,
        "deSchema": {
            "links": {},
            "fieldCount": 3,
            "fields": [
                {
                    "defaultValue": "secondValye",
                    "description": "",
                    "id": "e175a7f5-36ee-4845-89f9-df73137abdf9",
                    "isHidden": false,
                    "isInheritable": false,
                    "isNullable": false,
                    "isOverridable": false,
                    "isPrimaryKey": true,
                    "isReadOnly": false,
                    "isTemplateField": false,
                    "length": 50,
                    "masktype": "None",
                    "mustOverride": false,
                    "name": "ContactKey",
                    "ordinal": 0,
                    "storagetype": "Plain",
                    "type": "Text"
                },
                {
                    "description": "",
                    "id": "e1b8d7ba-ed0f-4dad-978a-e4babe9ded47",
                    "isHidden": false,
                    "isInheritable": false,
                    "isNullable": true,
                    "isOverridable": false,
                    "isPrimaryKey": false,
                    "isReadOnly": false,
                    "isTemplateField": false,
                    "length": 254,
                    "masktype": "None",
                    "mustOverride": false,
                    "name": "Email",
                    "ordinal": 1,
                    "storagetype": "Plain",
                    "type": "EmailAddress"
                },
                {
                    "defaultValue": "happy",
                    "description": "",
                    "id": "10e167ae-8cf4-42de-bbe8-cb57823618d4",
                    "isHidden": false,
                    "isInheritable": false,
                    "isNullable": true,
                    "isOverridable": false,
                    "isPrimaryKey": false,
                    "isReadOnly": false,
                    "isTemplateField": false,
                    "length": 50,
                    "masktype": "None",
                    "mustOverride": false,
                    "name": "restrictedvalue",
                    "ordinal": 2,
                    "storagetype": "Plain",
                    "type": "Text"
                }
            ],
            "id": "209a7846-2294-ea11-a2e6-1402ec938a35"
        },
        "dataExtensionId": "209a7846-2294-ea11-a2e6-1402ec938a35"
    }
}
```

### AllowedOriginResponse (on('registeredAllowedOriginResponse'))

TBC

### InteractionGoalStats (on('requestedInteractionGoalStats), trigger('requestInteractionGoalStats'))

returns the Goal Stats for the current Journey (used at run time, not config)

### ActivityPermissions (on('requestedActivityPermissions), trigger('requestActivityPermissions'))

```
{
    "view": true,
    "edit": true,
    "failedViewPermissions": [],
    "failedEditPermissions": []
}
```

### EngineSettings (on('requestedEngineSettings), trigger('requestEngineSettings'))

```
{
    "journeyPauseEnabled": true,
    "queueVersion": 1,
    "preventPathOptimizerHoldback": false
}
```

### DataLibrarySource (on('requestedDataLibrarySource), trigger('requestDataLibrarySource'))

TBC

### ContactsSchema (on('requestedContactsSchema), trigger('requestContactsSchema'))

TBC

### ExpressionBuilderAttributes (on('requestedExpressionBuilderAttributes), trigger('requestExpressionBuilderAttributes'))

TBC

### UserTimeZone (on('requestedUserTimeZone), trigger('requestUserTimeZone'))

Returns the timezone config for the current user

### EntryEventDefinitionKey (on('requestedEntryEventDefinitionKey), trigger('requestEntryEventDefinitionKey'))

```
{ "entryEventDefinitionKey": "DEAudience-eabac269-8abc-2a8b-aebb-56d0728fdfb3" }
```

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

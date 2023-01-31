Steps to setup locally
-  gcloud auth application-default login
-  setup cloud flare domain
-  instal cloud flare tunnel to allow local access from journey builder

Steps to allow for 
- Salesforce Admin Panel
-- Create Installed Package with App for admin & Oauth API
-- create connected app in SFDC with callback in format https://YOUR.URL/sfdc/oauth/response
-- setup a config collection in google firestore, add SFMC as key. Add values SECRET_TOKEN with some random value which will be used for encryption of session

- Salesforce Notification
-- Create Installed Package for Journey Builder config
-- provide SFMC_JWT in the config.SFMC variable in firestore with the JWT from installed package

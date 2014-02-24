# Apps World 2014 Demo App

**Note:** Built with Facebook SDK for iOS v3.12 and Parse iOS SDK v1.2.18.

## Parse App Set Up

1. Create a Parse App. Note the application id and client key.

1. Follow instructions for [setting up push notifications](https://www.parse.com/tutorials/ios-push-notifications), if testing push notifications. Follow the steps for creating an SSL certificate, creating a provisioning profile, and configuring your Parse app.

1. To test out hosting, follow instructions to [select a subdomain name](https://www.parse.com/docs/hosting_guide#started-hostname) and configure it for your Parse app.

1. Follow the instructions to [set up your Cloud Code environment](https://www.parse.com/docs/cloud_code_guide#started) by installing the command line tools and setting up a Cloud Code directory for your Parse app.

## Facebook App Set Up

1. Create a Facebook App. Note the application ID and display name.

1. Go to the Facebook App Dashboard. Add iOS as a platform. Set up a bundle ID. Enable Single Sign On.

## SendGrid

If you wish to test Background Jobs, [read up on SendGrid](https://www.parse.com/docs/cloud_modules_guide#sendgrid) and create an account.

## App Install and Set Up

1. Clone this repository.

1. Open up the Xcode project under iOS/AppsWorld/AppsWorld. Go to the Build Settings for the project. Search for ''Provisioning Profile'' and select the one you installed earlier for push notifications.

1. Modify AppsWorld-Info.plist and change the URL Scheme from fbYOUR_FACEBOOK_APP_ID to fb followed by your Facebook App ID, ex: fb123448985. Change the value of the FacebookAppID property to your Facebook App ID. Change the value of the FacebookDisplayName property to your Facebook App's display name. Finally, make sure your Bundle Identifier matches those used in your Facebook and Parse app settings.

1. Modify AppDelegate.m and replace the code below with your Parse application ID and client key respectively:

        [Parse setApplicationId:@"YOUR_PARSE_APPLICATION_ID" clientKey:@"YOUR_PARSE_CLIENT_KEY"];

1. Open CloudCode/cloud/main.js and replace the SendGrid username and password with your own:

        SendGrid.initialize("YOUR_SENDGRID_USERNAME", "YOUR_SENDGRID_PASSWORD");

1. Go to the Data Browser panel in your app's Dashboard. Create a new class called ''Contest''. Create a String type column named ''title''. Create a Boolean type column named ''active''. Add a row to the class. Fill in the title and set the active field to true.

#import <Parse/Parse.h>
#import "AppDelegate.h"
#import "MainViewController.h"

@implementation AppDelegate


#pragma mark - UIApplicationDelegate

- (BOOL)application:(UIApplication *)application didFinishLaunchingWithOptions:(NSDictionary *)launchOptions {
    // DEMO-STEP 1: Initial Setup
    [Parse setApplicationId:@"YOUR_PARSE_APPLICATION_ID" clientKey:@"YOUR_PARSE_CLIENT_KEY"];
    // Initialize Facebook
    [PFFacebookUtils initializeFacebook];
    // Set the default security for objects created
    PFACL *defaultACL = [PFACL ACL];
    [defaultACL setPublicReadAccess:YES];
    [PFACL setDefaultACL:defaultACL withAccessForCurrentUser:YES];
    
    // Override point for customization after application launch.
    self.window = [[UIWindow alloc] initWithFrame:[[UIScreen mainScreen] bounds]];
    self.viewController = [[MainViewController alloc] initWithNibName:@"MainViewController"
                                                           bundle:nil];
    self.navigationController = [[UINavigationController alloc] initWithRootViewController:self.viewController];
    self.window.rootViewController = self.navigationController;
    [self.window makeKeyAndVisible];

    // DEMO-STEP 8: Analytics
    [PFAnalytics trackAppOpenedWithLaunchOptions:launchOptions];
    // DEMO-STEP 7: Push
    [application registerForRemoteNotificationTypes:UIRemoteNotificationTypeBadge|
                                                    UIRemoteNotificationTypeAlert|
                                                    UIRemoteNotificationTypeSound];
    return YES;
}

// DEMO-STEP 2: Add User Management
- (BOOL)application:(UIApplication *)application openURL:(NSURL *)url
    sourceApplication:(NSString *)sourceApplication annotation:(id)annotation {
    return [FBAppCall handleOpenURL:url
                  sourceApplication:sourceApplication
                        withSession:[PFFacebookUtils session]];
} 

- (void)applicationDidBecomeActive:(UIApplication *)application
{
    // DEMO-STEP 2: Add User Management
    [FBAppCall handleDidBecomeActiveWithSession:[PFFacebookUtils session]];
    
    // DEMO-STEP 6: Cloud Code: Background Job: Email re-engagement
    PFUser *user = [PFUser currentUser];
    if (user){
        NSDate *date = [NSDate date];
        user[@"lastActive"]= date;
        [user saveInBackground];
    }
}

- (void)applicationWillTerminate:(UIApplication *)application
{
    // DEMO-STEP 2: Add User Management
    [[PFFacebookUtils session] close];
}

- (void)application:(UIApplication *)application didRegisterForRemoteNotificationsWithDeviceToken:(NSData *)newDeviceToken {
    // DEMO-STEP 7: Push
    [PFPush storeDeviceToken:newDeviceToken];
    [PFPush subscribeToChannelInBackground:@"" target:self selector:@selector(subscribeFinished:error:)];
}

- (void)application:(UIApplication *)application didFailToRegisterForRemoteNotificationsWithError:(NSError *)error {
    // DEMO-STEP 7: Push
    if (error.code == 3010) {
        NSLog(@"Push notifications are not supported in the iOS Simulator.");
    } else {
        // show some alert or otherwise handle the failure to register.
        NSLog(@"application:didFailToRegisterForRemoteNotificationsWithError: %@", error);
	}
}

- (void)application:(UIApplication *)application didReceiveRemoteNotification:(NSDictionary *)userInfo {
    // DEMO-STEP 7: Push
    [PFPush handlePush:userInfo];

    // DEMO-STEP 8: Analytics
    if (application.applicationState != UIApplicationStateActive) {
        [PFAnalytics trackAppOpenedWithRemoteNotificationPayload:userInfo];
    }
}

#pragma mark - ()

// DEMO-STEP 7: Push
- (void)subscribeFinished:(NSNumber *)result error:(NSError *)error {
    if ([result boolValue]) {
        NSLog(@"Successfully subscribed to push notifications on the broadcast channel.");
    } else {
        NSLog(@"Failed to subscribe to push notifications on the broadcast channel.");
    }
}


@end

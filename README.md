# Enforce Email Verification and Auto Login

## User Experience

### Application Splash Screen

1. User browses to app splash screen.

2. User clicks on `Login`.

![Alt text](screenshots/1-app-splash-screen.png "App Splash Screen")

### Universal Login

1. User enters credentials on `Hosted Login Page`.

![Alt text](screenshots/2-universal-login-to-app.png "App Splash Screen")

### Redirect to Assistant

1. Auth0 [Rule](rule/enforce-email-verification.js) checks that user has **not yet verified** their `email`.

2. [Rule](rule/enforce-email-verification.js) then redirects the user to `Assistant` server-side web app.

3. User SSO to `Assistant` as they've already authenticated to `Auth0`.

4. `Assistant` identifies the user and creates an `email verification ticket` and sends them an `email` with the `verification link`.

5. The `result_url` for the `email verification ticket` should be the `Application Login URI` which should start a new `Authorization Request` with Auth0.

6. After user clicks on the link from their email, Auth0 marks the user profile with `email_verified = true`.

![Alt text](screenshots/3-redirect-to-assistant.png "App Splash Screen")

### User is Authenticated to App

1. User is now redirected to the `Application Login URI` and logs in to the App (without entering credentials again).

2. Notice in the screenshot that the `email_verified` claim is `true`.

![Alt text](screenshots/4-login-to-app-after-email-verification.png "App Splash Screen")

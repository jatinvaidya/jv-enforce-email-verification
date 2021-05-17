function (user, context, callback) {
    console.log(`redirect client_id=${context.clientID}`);
    // for test purposes limiting this rule execution only to a particular application
    if (context.clientID === configuration.ENFORCE_EMAIL_VERIFICATION_CLIENT_ID) {
        if (!user.email_verified) {
            // enforce email_verification
            // redirect to our custom webapp which will ask user to select primary email
            context.redirect = {
                // this web app is secured by same auth0 tenant as the SPA
                url: 'http://localhost:3000/verify-email'
            };
        }
    }
    callback(null, user, context);
}

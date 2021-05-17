var express = require('express');
var secured = require('../lib/middleware/secured');
var router = express.Router();
var request = require('request-promise');
let jwt = require('jsonwebtoken');

/* GET user profile. */
router.get('/verify-email', secured(), async function (req, res, next) {
    
    const user_id = req.user.user_id;
    console.log(`user_id: ${user_id}`);

    // use hardcoded email for testing
    // in actual scenario, user may want to select from multiple emails that they may have
    let emailVerificationLink = await createEmailVerificationTicket(user_id);
    console.log(`controller link: ${emailVerificationLink}`);
    res.send(`
      <p>For TESTING convenience, we are displaying the email verification link on this page.</p>
      <p>In a real environment, this link MUST be sent to user EMAILBOX with appropriate instructions.</p>
      <a href='${emailVerificationLink}'>Click to verify your email!</a>
      <p>You will not be asked for username/password again in this session.</p>
      <a href='/verify-email'>Click to RESEND verification link!</a>
    `);
});

// get new access_token using client_credentials grant
// ideally this token must be cached until expiry instead of requesting new one everytime.
async function getAccessTokenForMgmtApi() {
    var options = {
        method: 'POST',
        url: `https://${process.env.AUTH0_DOMAIN}/oauth/token`,
        headers: { 'content-type': 'application/json' },
        body:
        {
            grant_type: 'client_credentials',
            client_id: `${process.env.AUTH0_CLIENT_ID}`,
            client_secret: `${process.env.AUTH0_CLIENT_SECRET}`,
            audience: `https://${process.env.AUTH0_DOMAIN}/api/v2/`,
            scope: 'create:user_tickets'
        },
        json: true
    };
    console.log(`options=${JSON.stringify(options)}`);
    let responseBody = await request(options, function (error, response, body) {
        console.log('inside callback function');
        if (error) {
            console.log(`error fetching access_token: ${error}`);
            throw new Error(error);
        }
    });
    return responseBody.access_token;
}

// open ticket and get verification link in response
async function createEmailVerificationTicket(user_id) {
    // AT must be cached till just before expiry (TBD)
    let accessToken = await getAccessTokenForMgmtApi(); 
    var options = {
        url: `https://${process.env.AUTH0_DOMAIN}/api/v2/tickets/email-verification`,
        method: 'POST',
        headers: {
            'content-type': 'application/json',
            'authorization': `Bearer ${accessToken}`,
            'accept': 'application/json'
        },
        // body: `{ "result_url" : "https://${process.env.AUTH0_DOMAIN}/continue?state=${state}", "user_id" : "auth0|${id}", "ttl_sec" : 0}`
        // this link below MUST start a fresh Authorization Request with Auth0.
        body: `{ "result_url" : "http://localhost:3001/profile", "user_id" : "${user_id}", "ttl_sec" : 0}`
    };

    let emailVerificationLinkBody =
        await request(options, function (error, response, body) {
            if (error) throw new Error(error);
        });
    let emailVerificationLink = JSON.parse(emailVerificationLinkBody).ticket;
    console.log(`inside function ${emailVerificationLink}`);
    return emailVerificationLink;
}

module.exports = router;

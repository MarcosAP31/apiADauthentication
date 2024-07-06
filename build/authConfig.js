"use strict";
const msal = require('@azure/msal-node');
const msalConfig = {
    auth: {
        clientId: '70ba3f7e-84f0-4d8c-a8e4-fb7358414dcd',
        authority: 'https://login.microsoftonline.com/ba5f9d02-0ba8-4c7f-95ad-7ffdc88513da',
        clientSecret: 'tLd8Q~Ig.T74O59KYJd9UseMN1Tuy5pGG454rb11'
    },
    system: {
        tokenRenewalOffsetSeconds: 300,
        loggerOptions: {
            loggerCallback(message) {
                console.log(message);
            },
            piiLoggingEnabled: false,
            logLevel: msal.LogLevel.Verbose,
        }
    }
};
const tokenRequest = {
    scopes: ['User.Read']
};
module.exports = {
    msalConfig,
    tokenRequest
};

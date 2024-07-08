const msal = require('@azure/msal-node');
const msalConfig = {
    auth: {
        clientId: '7ed08e68-1ecd-4348-8bea-26f409e16021',
        authority: 'https://login.microsoftonline.com/ba5f9d02-0ba8-4c7f-95ad-7ffdc88513da',
        clientSecret: 'AXh8Q~Xr9Wd.6_KNMuEKig2xlVXPOIparX-C2a3L'
    },
    system: {
        tokenRenewalOffsetSeconds: 300,
        loggerOptions: {
            loggerCallback(message:any) {
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
const msal = require('@azure/msal-node');
const msalConfig = {
    auth: {
        clientId: process.env.AZURE_CLIENT_ID,
        authority: process.env.AZURE_AUTHORITY,
        clientSecret: process.env.AZURE_CLIENT_SECRET
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

const msal = require('@azure/msal-node');
const { msalConfig } = require('../authConfig');
const crypto = require('crypto');

const cca = new msal.ConfidentialClientApplication(msalConfig);

export class ADRepository {
    // Function to fetch file content from URL
    public async login(authCodeUrlParameters:any): Promise<any> {
        try {
            

            const authCodeUrl = await cca.getAuthCodeUrl(authCodeUrlParameters);
            return authCodeUrl;
            //res.redirect(response);
        } catch (error) {
            console.error('Error initiating login:', error);
            throw new Error(`Error initiating login: ${error}`);
            //res.status(500).json({ error: 'Error initiating login' });
        }
    }

    // Function to authorize Google Drive API
    public async redirect(tokenRequest: any): Promise<any> {
        try {
            const response = await cca.acquireTokenByCode(tokenRequest);
            // Aquí puedes devolver las credenciales o token a tu cliente
            return response;
            //res.json(response);
        } catch (error) {
            console.error('Error acquiring token:', error);
            throw new Error(`Error acquiring token ${error}`);
            //res.status(500).json({ error: 'Error acquiring token' });
        }
    }

}
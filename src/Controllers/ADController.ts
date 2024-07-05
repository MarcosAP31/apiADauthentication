import { Request, Response } from 'express';
const axios = require('axios');
import { ADServiceImpl } from '../ServicesImpl/ADServiceImpl';
import { ADService } from '../Services/ADService';
const crypto = require('crypto');
let groupId: String = '';
function base64URLEncode(buffer: any) {
    return buffer.toString('base64')
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=/g, '');
}

function sha256(buffer: any) {
    return crypto.createHash('sha256').update(buffer).digest();
}

let codeVerifier = base64URLEncode(crypto.randomBytes(32));
let codeChallenge = base64URLEncode(sha256(codeVerifier));
class ADController {
    protected ADService: ADService;
    // Constructor del servicio
    constructor() {
        this.ADService = new ADServiceImpl();
        // Asegura que el método esté vinculado al contexto correcto
        this.login = this.login.bind(this);
        this.redirect = this.redirect.bind(this);
        this.useGraph = this.useGraph.bind(this);
        this.validate = this.validate.bind(this);
        this.getData = this.getData.bind(this);
    }
    public async login(req: Request, res: Response): Promise<any> {
        try {
            let { groupid } = req.params;
            //userEmail=email;
            groupId = groupid;
            const authCodeUrlParameters = {
                scopes: ['openid', 'profile', 'user.read'],
                redirectUri: 'http://localhost:3000/api/ad/validate', // URL donde Azure AD redirigirá después de la autenticación
                codeChallenge: codeChallenge,
                codeChallengeMethod: "S256"
            };
            const response = await this.ADService.login(authCodeUrlParameters);
            res.redirect(response);
        } catch (error: any) {
            res.status(500).json({ error: error });
        }
    }

    public async redirect(req: any, res: Response): Promise<any> {
        try {
            const tokenRequest = {
                code: req.query.code,
                scopes: ['openid', 'profile', 'user.read'],
                redirectUri: 'http://localhost:3000/api/ad/redirect', // Debe coincidir con el valor configurado en Azure AD
                codeVerifier: codeVerifier
            };
            const response = await this.ADService.redirect(tokenRequest);
            //console.log(crypto.randomBytes(32).toString('hex'));
            // Verifica qué campos están presentes en la respuesta
            if (response && response.accessToken) {

                req.session.accessToken = response.accessToken;
                res.send('Login successful! You can now call the Microsoft Graph API.');
            } else {
                // Manejar caso en que no se recibe el accessToken esperado
                throw new Error('Access token not found in response.');
            }
        } catch (error: any) {
            res.status(500).json({ error: error });
        }
    }

    public async useGraph(req: any, res: Response): Promise<any> {
        try {

            const response = await axios.get('https://graph.microsoft.com/v1.0/me', {
                headers: {
                    Authorization: `Bearer ${req.session.accessToken}`,
                },
            });
            console.log(response.data.userPrincipalName);
            res.json(response.data);
        } catch (error: any) {
            res.status(500).json({ error: error });
        }
    }

    public async validate(req: any, res: Response): Promise<any> {
        try {
            let email = '';

            const tokenRequest = {
                code: req.query.code,
                scopes: ['openid', 'profile', 'user.read'],
                redirectUri: 'http://localhost:3000/api/ad/validate', // Debe coincidir con el valor configurado en Azure AD
                codeVerifier: codeVerifier
            };
            const response = await this.ADService.redirect(tokenRequest);
            //console.log(crypto.randomBytes(32).toString('hex'));
            // Verifica qué campos están presentes en la respuesta
            if (response && response.accessToken) {

                req.session.accessToken = response.accessToken;
                //res.send('Login successful! You can now call the Microsoft Graph API.');
            } else {
                // Manejar caso en que no se recibe el accessToken esperado
                throw new Error('Access token not found in response.');
            }
            const resp = await axios.get('https://graph.microsoft.com/v1.0/me', {
                headers: {
                    Authorization: `Bearer ${req.session.accessToken}`,
                },
            });
            //console.log(resp.data.userPrincipalName);
            //res.json(resp.data);
            const respo = await axios.get(`https://graph.microsoft.com/v1.0/groups/${groupId}`, {
                headers: {
                    Authorization: `Bearer ${req.session.accessToken}`,
                },
            });
            console.log(resp.data.userPrincipalName);
            email = resp.data.userPrincipalName;
            const respons = await axios.get(`https://graph.microsoft.com/v1.0/groups/${groupId}/members`, {
                headers: {
                    Authorization: `Bearer ${req.session.accessToken}`,
                },
            });

            const subgroups = respons.data.value;
            let foundMatch = false;
            for (const subg of subgroups) {
                if (foundMatch) return;
                const membersub = await axios.get(`https://graph.microsoft.com/v1.0/groups/${subg.id}/members`, {
                    headers: {
                        Authorization: `Bearer ${req.session.accessToken}`,
                    },
                });
                const members = membersub.data.value;
                members.forEach((member: any) => {
                    if (email == member.userPrincipalName) {
                        //console.log(1);
                        if (subg.description == "Grupo de usuarios area TI") {
                            console.log('usuario TI');

                            foundMatch = true; // Marcar que se encontró una coincidencia
                            console.log(subg.id);
                            return res.json({
                                groupId:groupId,
                                groupDescription:respo.data.displayName,
                                subGroupId: subg.id,
                                subgroupDescription: subg.description
                            })
                        }
                        if (subg.description == "Grupo de usuarios area Data") {
                            console.log('usuario Data');
                            foundMatch = true; // Marcar que se encontró una coincidencia
                            //res.json(subg.id+"-"+subg.description)
                            /*return {
                              subGroupId:subg.id,
                              description:subg.description
                            }; // Salir del forEach interno*/
                            return res.json({
                                groupId:groupId,
                                groupDescription:respo.data.displayName,
                                subGroupId: subg.id,
                                subgroupDescription: subg.description
                            })
                            
                        }
                    }
                });

            }
            //res.json(response.data);
        } catch (error: any) {
            res.status(500).json({ error: error });
        }
    }

    public async getData(req: any, res: Response): Promise<any> {
        try {
            let { email, groupid } = req.params;
            const resp = await axios.get(`https://graph.microsoft.com/v1.0/groups/${groupid}`, {
                headers: {
                    Authorization: `Bearer ${req.session.accessToken}`,
                },
            });
            const respons = await axios.get(`https://graph.microsoft.com/v1.0/groups/${groupid}/members`, {
                headers: {
                    Authorization: `Bearer ${req.session.accessToken}`,
                },
            });
            const subgroups = respons.data.value;
            let foundMatch = false;
            for (const subg of subgroups) {
                if (foundMatch) return;
                const membersub = await axios.get(`https://graph.microsoft.com/v1.0/groups/${subg.id}/members`, {
                    headers: {
                        Authorization: `Bearer ${req.session.accessToken}`,
                    },
                });
                const members = membersub.data.value;
                members.forEach((member: any) => {
                    if (email == member.userPrincipalName) {
                        //console.log(1);
                        if (subg.description == "Grupo de usuarios area TI") {
                            console.log('usuario TI');

                            foundMatch = true; // Marcar que se encontró una coincidencia
                            console.log(subg.id);
                            return res.json({
                                subGroupId: subg.id,
                                description: subg.description
                            })
                        }
                        if (subg.description == "Grupo de usuarios area Data") {
                            console.log('usuario Data');
                            foundMatch = true; // Marcar que se encontró una coincidencia
                            //res.json(subg.id+"-"+subg.description)
                            /*return {
                              subGroupId:subg.id,
                              description:subg.description
                            }; // Salir del forEach interno*/
                            return res.json({
                                groupId:groupid,
                                groupDescription:resp.data.displayName,
                                subGroupId: subg.id,
                                subgroupDescription: subg.description
                            })
                        }
                    }
                });

            }

        } catch (error: any) {
            res.status(500).json({ error: error });
        }
    }


}
const adController = new ADController;
export default adController;
"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios = require('axios');
const ADServiceImpl_1 = require("../ServicesImpl/ADServiceImpl");
const crypto = require('crypto');
let groupId = '';
function base64URLEncode(buffer) {
    return buffer.toString('base64')
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=/g, '');
}
function sha256(buffer) {
    return crypto.createHash('sha256').update(buffer).digest();
}
let codeVerifier = base64URLEncode(crypto.randomBytes(32));
let codeChallenge = base64URLEncode(sha256(codeVerifier));
class ADController {
    // Constructor del servicio
    constructor() {
        this.ADService = new ADServiceImpl_1.ADServiceImpl();
        // Asegura que el método esté vinculado al contexto correcto
        this.login = this.login.bind(this);
        this.redirect = this.redirect.bind(this);
        this.useGraph = this.useGraph.bind(this);
        this.validate = this.validate.bind(this);
        this.getData = this.getData.bind(this);
    }
    login(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let { groupid } = req.params;
                //userEmail=email;
                groupId = groupid;
                const authCodeUrlParameters = {
                    scopes: ['openid', 'profile', 'user.read'],
                    redirectUri: 'https://cmpdev-aps-per001.azurewebsites.net/api/ad/validate', // URL donde Azure AD redirigirá después de la autenticación
                    codeChallenge: codeChallenge,
                    codeChallengeMethod: "S256"
                };
                const response = yield this.ADService.login(authCodeUrlParameters);
                res.redirect(response);
            }
            catch (error) {
                res.status(500).json({ error: error });
            }
        });
    }
    redirect(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const tokenRequest = {
                    code: req.query.code,
                    scopes: ['openid', 'profile', 'user.read'],
                    redirectUri: 'https://cmpdev-aps-per001.azurewebsites.net/api/ad/redirect', // Debe coincidir con el valor configurado en Azure AD
                    codeVerifier: codeVerifier
                };
                const response = yield this.ADService.redirect(tokenRequest);
                //console.log(crypto.randomBytes(32).toString('hex'));
                // Verifica qué campos están presentes en la respuesta
                if (response && response.accessToken) {
                    req.session.accessToken = response.accessToken;
                    res.send('Login successful! You can now call the Microsoft Graph API.');
                }
                else {
                    // Manejar caso en que no se recibe el accessToken esperado
                    throw new Error('Access token not found in response.');
                }
            }
            catch (error) {
                res.status(500).json({ error: error });
            }
        });
    }
    useGraph(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const response = yield axios.get('https://graph.microsoft.com/v1.0/me', {
                    headers: {
                        Authorization: `Bearer ${req.session.accessToken}`,
                    },
                });
                console.log(response.data.userPrincipalName);
                res.json(response.data);
            }
            catch (error) {
                res.status(500).json({ error: error });
            }
        });
    }
    validate(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let email = '';
                const tokenRequest = {
                    code: req.query.code,
                    scopes: ['openid', 'profile', 'user.read'],
                    redirectUri: 'https://cmpdev-aps-per001.azurewebsites.net/api/ad/validate', // Debe coincidir con el valor configurado en Azure AD
                    codeVerifier: codeVerifier
                };
                const response = yield this.ADService.redirect(tokenRequest);
                //console.log(crypto.randomBytes(32).toString('hex'));
                // Verifica qué campos están presentes en la respuesta
                if (response && response.accessToken) {
                    req.session.accessToken = response.accessToken;
                    //res.send('Login successful! You can now call the Microsoft Graph API.');
                }
                else {
                    // Manejar caso en que no se recibe el accessToken esperado
                    throw new Error('Access token not found in response.');
                }
                const resp = yield axios.get('https://graph.microsoft.com/v1.0/me', {
                    headers: {
                        Authorization: `Bearer ${req.session.accessToken}`,
                    },
                });
                //console.log(resp.data.userPrincipalName);
                //res.json(resp.data);
                const respo = yield axios.get(`https://graph.microsoft.com/v1.0/groups/${groupId}`, {
                    headers: {
                        Authorization: `Bearer ${req.session.accessToken}`,
                    },
                });
                console.log(resp.data.userPrincipalName);
                email = resp.data.userPrincipalName;
                const respons = yield axios.get(`https://graph.microsoft.com/v1.0/groups/${groupId}/members`, {
                    headers: {
                        Authorization: `Bearer ${req.session.accessToken}`,
                    },
                });
                const subgroups = respons.data.value;
                let foundMatch = false;
                for (const subg of subgroups) {
                    if (foundMatch)
                        return;
                    const membersub = yield axios.get(`https://graph.microsoft.com/v1.0/groups/${subg.id}/members`, {
                        headers: {
                            Authorization: `Bearer ${req.session.accessToken}`,
                        },
                    });
                    const members = membersub.data.value;
                    members.forEach((member) => {
                        if (email == member.userPrincipalName) {
                            //console.log(1);
                            if (subg.description == "Grupo de usuarios area TI") {
                                console.log('usuario TI');
                                foundMatch = true; // Marcar que se encontró una coincidencia
                                console.log(subg.id);
                                return res.json({
                                    groupId: groupId,
                                    groupDescription: respo.data.displayName,
                                    subGroupId: subg.id,
                                    subgroupDescription: subg.description
                                });
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
                                    groupId: groupId,
                                    groupDescription: respo.data.displayName,
                                    subGroupId: subg.id,
                                    subgroupDescription: subg.description
                                });
                            }
                        }
                    });
                }
                //res.json(response.data);
            }
            catch (error) {
                res.status(500).json({ error: error });
            }
        });
    }
    getData(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let { email, groupid } = req.params;
                const resp = yield axios.get(`https://graph.microsoft.com/v1.0/groups/${groupid}`, {
                    headers: {
                        Authorization: `Bearer ${req.session.accessToken}`,
                    },
                });
                const respons = yield axios.get(`https://graph.microsoft.com/v1.0/groups/${groupid}/members`, {
                    headers: {
                        Authorization: `Bearer ${req.session.accessToken}`,
                    },
                });
                const subgroups = respons.data.value;
                let foundMatch = false;
                for (const subg of subgroups) {
                    if (foundMatch)
                        return;
                    const membersub = yield axios.get(`https://graph.microsoft.com/v1.0/groups/${subg.id}/members`, {
                        headers: {
                            Authorization: `Bearer ${req.session.accessToken}`,
                        },
                    });
                    const members = membersub.data.value;
                    members.forEach((member) => {
                        if (email == member.userPrincipalName) {
                            //console.log(1);
                            if (subg.description == "Grupo de usuarios area TI") {
                                console.log('usuario TI');
                                foundMatch = true; // Marcar que se encontró una coincidencia
                                console.log(subg.id);
                                return res.json({
                                    groupId: groupid,
                                    groupDescription: resp.data.displayName,
                                    subGroupId: subg.id,
                                    subgroupDescription: subg.description
                                });
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
                                    groupId: groupid,
                                    groupDescription: resp.data.displayName,
                                    subGroupId: subg.id,
                                    subgroupDescription: subg.description
                                });
                            }
                        }
                    });
                }
            }
            catch (error) {
                res.status(500).json({ error: error });
            }
        });
    }
}
const adController = new ADController;
exports.default = adController;

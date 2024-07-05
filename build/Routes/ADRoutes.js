"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const ADController_1 = __importDefault(require("../Controllers/ADController"));
class ADRoutes {
    constructor() {
        this.router = (0, express_1.Router)();
        this.config();
    }
    config() {
        this.router.get('/login/:groupid', ADController_1.default.login);
        this.router.get('/redirect', ADController_1.default.redirect);
        //this.router.get('/graph', adController.useGraph);
        this.router.get('/validate', ADController_1.default.validate);
        this.router.get('/getdata/:email/:groupid', ADController_1.default.getData);
    }
}
exports.default = new ADRoutes().router;

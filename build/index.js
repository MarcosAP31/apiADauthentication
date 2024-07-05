"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const IndexRoutes_1 = __importDefault(require("./Routes/IndexRoutes"));
const body_parser_1 = __importDefault(require("body-parser"));
const ADRoutes_1 = __importDefault(require("./Routes/ADRoutes"));
const express_session_1 = __importDefault(require("express-session")); // Importa express-session
require('dotenv').config();
//import getMessagesByConversationId from './controllers/messageController';
const http = require('http');
// Aquí debes insertar el secreto generado aleatoriamente
const secret = 'b13f85fd58225f46782f2657820540de7eb0b69cf144a311ca390373ff009bac';
class Server {
    constructor() {
        this.app = (0, express_1.default)();
        this.config();
        this.routes();
    }
    config() {
        this.app.set('port', process.env.PORT || 3000);
        this.app.use(express_1.default.json());
        this.app.use(express_1.default.urlencoded({ extended: false }));
        // Configurar express-session con tu secreto generado
        this.app.use((0, express_session_1.default)({
            secret: secret,
            resave: false,
            saveUninitialized: false,
        }));
    }
    routes() {
        this.app.use('/', IndexRoutes_1.default);
        this.app.use('/api/ad', ADRoutes_1.default);
        this.app.use(body_parser_1.default.json());
    }
    start() {
        const server = http.createServer(this.app);
        server.listen(this.app.get('port'), () => {
            console.log('Server on port', this.app.get('port'));
        });
        /*
        this.app.listen(this.app.get('port'), () => {
            console.log('Server on port', this.app.get('port'));
        });*/
    }
}
const server = new Server();
server.start();

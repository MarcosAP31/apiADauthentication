import express from 'express';
import indexRoutes from './Routes/IndexRoutes';
import bodyParser from 'body-parser';
import adRoutes from './Routes/ADRoutes';
import session from 'express-session';  // Importa express-session

//import getMessagesByConversationId from './controllers/messageController';

const http = require('http');

// Aquí debes insertar el secreto generado aleatoriamente
const secret = 'b13f85fd58225f46782f2657820540de7eb0b69cf144a311ca390373ff009bac';

class Server {

  public app: express.Application;
  constructor() {
    this.app = express();
    this.config();
    this.routes();
  }

  config(): void {

    this.app.set('port', process.env.PORT || 3000);



    this.app.use(express.json());

    this.app.use(express.urlencoded({ extended: false }));
    // Configurar express-session con tu secreto generado
    this.app.use(session({
      secret: secret,
      resave: false,
      saveUninitialized: false,
    }));

  }

  routes(): void {

    this.app.use('/', indexRoutes);
    this.app.use('/api/ad', adRoutes);
    this.app.use(bodyParser.json());

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
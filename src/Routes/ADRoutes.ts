import { Router } from 'express';

import adController from '../Controllers/ADController';

class ADRoutes {

    router: Router = Router();

    constructor() {
        this.config();
        
    }

    config() {
        this.router.get('/login/:groupid', adController.login);
        this.router.get('/redirect', adController.redirect);
        //this.router.get('/graph', adController.useGraph);
        this.router.get('/validate', adController.validate);
        this.router.get('/getdata/:email/:groupid', adController.getData);
    }

}
export default new ADRoutes().router;
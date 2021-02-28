'use strict';

import { Router } from 'express';

export abstract class RouterMaster {
    url: string;
    router: Router;
    constructor(url: string, router: Router) {
        this.url = url;
        this.router = router;
    }

    initRouter(app: any, baseUrl?: string) {
        app.use(`${baseUrl || ''}${this.url ||''}`, this.router);
    }
}
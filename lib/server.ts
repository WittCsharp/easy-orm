'use strict';
import { Express, Router } from 'express';

export function useHttp({config, routes}: {
    config: any;
    routes: Array<Router>;
}): Express {
    const app = Express();
    // app.use
    return app;
}

export function useHttps({config}: {config: any;}) : Express {
    const app = Express();

    return app;
}
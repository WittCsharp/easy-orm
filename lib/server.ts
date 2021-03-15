import * as express from 'express';
import * as morgan from 'morgan';
import {getRoutes} from './route';

export function useHttp({config, routes, hooks}: {
    config: {
        port: number;
        debug: boolean;
    };
    routes?: Array<express.Router> | undefined | null;
    hooks?: {
        befor?: Array<express.RequestHandler>,
        after?: Array<express.RequestHandler>,
    }
}): express.Application {
    const {port} = config;
    const app = express();
    app.use(express.json());
    // debug log
    if (config.debug) app.use(morgan('dev'));

    // befor goable hooks
    if (hooks?.befor) {
        for (const handler of hooks.befor) {
            app.use(handler);
        }
    }
    /** 加载路由 */
    if (routes && routes.length)
        app.use(routes);
    if (getRoutes() && getRoutes().length > 0) {
        app.use(getRoutes());
    }

    // after goable hooks
    if (hooks?.after) {
        for (const handler of hooks.after) {
            app.use(handler);
        }
    }
    
    // 404
    app.route('*').all((_req, res) => {
        return res.status(404).send('Not found');
    });
    
    // 异常数据返回
    app.use((err: any, _req, res: any, _done) => {
        // 异常
        return res.status(err.code||500).send(err?.message || 'server error');
    });

    // 监听
    app.listen(port || 3000, () => console.log(`Express with Typescript! http://localhost:${port || 3000}`))
    return app;
}

/** HTTPS */
// export function useHttps({config}: {config: any;}) : Express {
//     const app = Express();

//     return app;
// }
import * as express from 'express';
import * as morgan from 'morgan';

export function useHttp({config, routes}: {
    config: {
        port: number;
        debug: boolean;
    };
    routes: Array<express.Router> | undefined | null;
}): express.Application {
    const {port} = config;
    const app = express();
    
    // debug log
    if (config.debug) app.use(morgan('dev'));
    
    /** 加载路由 */
    if (routes && routes.length)
        app.use(routes);

    // 404
    app.route('*').all((_req, res) => {
        return res.status(404).send('Not found');
    });
    
    // 异常数据返回
    app.use((error: any, _req, res: any) => {
        // 异常
        return res.status(error.code||500).send(error.message||'server error');
    });

    // 无数据返回
    app.use((_req, res: any) => {
        if (res.result) {
            return res.status(200).json({message: 'success', data: res.result, statu: 200})
        }
        return res.status(201);
    })
    // 监听
    app.listen(port || 3000, () => console.log(`Express with Typescript! http://localhost:${port || 3000}`))
    return app;
}

/** HTTPS */
// export function useHttps({config}: {config: any;}) : Express {
//     const app = Express();

//     return app;
// }
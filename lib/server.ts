import * as express from 'express';
import { Server } from 'http';
import * as morgan from 'morgan';
import { useKnex } from './knex';
import { IMongoConfig } from './mongodb';
import {getRoutes} from './route';
import { useMongose } from './mongodb';
import { IRedisConfig, useRedis } from './redis';
import { IKnexConfig } from './knex/index';

let server: Server;

export function useHttp({config, routes, hooks, knex, mongo, json, redis}: {
    config: {
        port: number;
        debug?: boolean;
    };
    routes?: Array<express.Router> | undefined | null;
    hooks?: {
        before?: Array<express.RequestHandler>,
        after?: Array<express.RequestHandler>,
    },
    knex?: Array<IKnexConfig> | IKnexConfig;
    mongo?: IMongoConfig | Array<IMongoConfig>;
    redis?: Array<IRedisConfig> | IRedisConfig;
    json?: number;
}): express.Application {
    // knex 配置初始化
    if (knex) {
        useKnex(knex);
    }
    // mongo 配置初始化
    if (mongo) {
        useMongose(mongo);
    }
    // redis 配置初始化
    if (redis) {
        if (Array.isArray(redis)) {
            for (const redisConfig of redis) {
                useRedis(redisConfig);
            }
        } else useRedis(redis);
    }
    const {port} = config;
    const app = express();
    if (json) {
        app.use(express.json({limit: `${json}mb`}));
    }
    // debug log
    if (config.debug) app.use(morgan('dev'));

    // befor goable hooks
    if (hooks?.before) {
        for (const handler of hooks.before) {
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
    server = app.listen(port || 3000, () => console.log(`Express with Typescript! http://localhost:${port || 3000}`))
    return app;
}

export function stopHttp() {
    server.close();
}
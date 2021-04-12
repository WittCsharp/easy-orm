import { RequestHandler, Router } from 'express';
import { setRoute } from './useRoute';
import { compact } from 'lodash';
import useLogger from '../log4j';
import { levels } from 'log4js';

export interface IHandlerConfig<T> {
    url?: string;
    method?: 'post' | 'delete' | 'put' | 'get';
    before?: Array<RequestHandler>;
    hander?({req, res, params, query, data}: {res: any; req: any; params?: any; query?: any; data?: T}) : Promise<any> | any;
    after?: Array<RequestHandler>;
}

export function useCustomizeRoute<T>(options: {
    baseUrl: string;
    before?: Array<RequestHandler>;
    after?: Array<RequestHandler>;
    handlers?: Array<IHandlerConfig<T>>,
   
}) : Router {
    const router = Router();
    // 查询
    if (options.handlers?.length) {
        for (const handler of options.handlers) {
            router[handler.method || 'post'](`${options.baseUrl}${handler.url}`,
                ...compact([
                    // hooks befor
                    ...(options.before || []),
                    ...(handler.before || []),
                    // content
                    async (req: any, res: any, done) => {
                        try {
                            const result = await handler.hander({
                                req, res,
                                data: req.body,
                                params: req.params,
                                query: req.query,
                            });
                            res.result = result;
                            done();
                        } catch (error) {
                            useLogger().log({
                                logger: 'request',
                                level: levels.ERROR,
                                message: error.message,
                            })
                            done(error)
                        }
                    },
                    // hooks after
                    ...(handler.after || []),
                    ...(options.after || []),
                    (_req, res: any) => {
                        if (res.result) {
                            return res.status(200).json({message: 'success', data: res.result, status: 200})
                        }
                        return res.status(201).send('');
                    }
                ])
            );
        }
    }
    // 注册路由
    setRoute(router);
    return router;
}
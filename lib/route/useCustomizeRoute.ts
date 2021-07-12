import { ErrorRequestHandler, RequestHandler, Router } from 'express';
import { setRoute } from './useRoute';
import { compact } from 'lodash';
import useLogger from '../log4j';
import { levels } from 'log4js';

export interface IThrowError {
    (error: {
        error: {
            errorMessage?: string;
            code?: string;
        };
        status?: number;
    }): void;
}

export interface IHandlerConfig<T> {
    url?: string;
    method?: 'post' | 'delete' | 'put' | 'get';
    before?: Array<RequestHandler>;
    hander?({req, res, params, query, data, throwError}: {res: any; req: any; params?: any; query?: any; data?: T, throwError: IThrowError}) : Promise<any> | any;
    handerDone?({req, res, params, query, data, done, throwError}: {res: any; req: any; params?: any; query?: any; data?: T; done?: any, throwError: IThrowError}) : Promise<any> | any;
    after?: Array<RequestHandler | ErrorRequestHandler>;
}

export function throwError (res: any) : IThrowError {
    const useError: IThrowError = function(error) {
        res.error = error;
        throw error;
    }
    return useError;
}

export function useCustomizeRoute<T>(options: {
    baseUrl: string;
    before?: Array<RequestHandler>;
    after?: Array<RequestHandler | ErrorRequestHandler>;
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
                            if (handler.hander) {
                                const result = await handler.hander({
                                    req, res,
                                    data: req.body,
                                    params: req.params,
                                    query: req.query,
                                    throwError: throwError(res),
                                });
                                res.result = result;
                            }
                            if (handler.handerDone) {
                                return await handler.handerDone({
                                    req, res,
                                    data: req.body,
                                    params: req.params,
                                    query: req.query,
                                    done: done,
                                    throwError: throwError(res),
                                });
                            }
                            done();
                        } catch (error) {
                            if (res.error) {
                                return res.status(res.error.status || 200).json({
                                    data: res.error.error,
                                    status: res.error.status || 200,
                                });
                            }
                            useLogger().log({
                                logger: 'request',
                                level: levels.ERROR,
                                message: error.message,
                            });
                            done(error)
                        }
                    },
                    // hooks after
                    ...(handler.after || []),
                    ...(options.after || []),
                    (_req, res: any) => {
                        if (res.result) {
                            return res.status(res.statusCode || 200).json({message: 'success', data: res.result, status: 200})
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
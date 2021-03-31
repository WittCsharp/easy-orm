import { RequestHandler, Router } from 'express';
import { setRoute } from './useRoute';
import { compact } from 'lodash';

export function useCustomizeRoute<T>(options: {
    baseUrl: string;
    before?: Array<RequestHandler>;
    after?: Array<RequestHandler>;
    handlers?: Array<{
        url?: string;
        method?: 'post' | 'delete' | 'put' | 'get';
        before?: Array<RequestHandler>;
        hander?({req, res, params, query, data}: {res: any; req: any; params?: any; query?: any; data?: T}) : Promise<any>;
        after?: Array<RequestHandler>;
    }>,
   
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
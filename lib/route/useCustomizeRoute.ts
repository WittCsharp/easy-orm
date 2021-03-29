import { RequestHandler, Router } from 'express';
import { setRoute } from './useRoute';

export function useCustomizeRoute<T>(options: {
    baseUrl: string;
    before?: Array<RequestHandler>;
    after?: Array<RequestHandler>;
    handlers?: Array<{
        url?: string;
        method?: 'post' | 'delete' | 'put' | 'get';
        before?: Array<RequestHandler>;
        hander?({req, res, params, query, data}: {res: any; req: any; params?: any; query?: any; data?: any}) : Promise<T>;
        after?: Array<RequestHandler>;
    }>,
   
}) : Router {
    const router = Router();
    // 查询
    if (options.handlers?.length) {
        for (const handler of options.handlers) {
            router[handler.method || 'post'](`${options.baseUrl}${handler.url}`,
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
            );
        }
    }
    // 注册路由
    setRoute(router);
    return router;
}
'use strict';

import { Router, RequestHandler, ErrorRequestHandler } from 'express';
import { compact } from 'lodash';

const routes : Array<Router> = [];

export function setRoute(route: Router) {
    routes.push(route);
}

const METHODS = {
    onGet: 'get',
    onPut: 'put',
    onDelete: 'delete',
    onPost: 'post',
}

export function useRoute<T>(options: {
    baseUrl?: string;
    url: string | {
        get?: string;
        put?: string;
        post?: string;
        delete?: string;
    };
    hook?: {
        before?: {
            all?: Array<RequestHandler | ErrorRequestHandler>;
            get?: Array<RequestHandler | ErrorRequestHandler>;
            put?: Array<RequestHandler | ErrorRequestHandler>;
            delete?: Array<RequestHandler | ErrorRequestHandler>;
            post?: Array<RequestHandler | ErrorRequestHandler>;
        },
        after?: {
            all?: Array<RequestHandler | ErrorRequestHandler>;
            get?: Array<RequestHandler | ErrorRequestHandler>;
            put?: Array<RequestHandler | ErrorRequestHandler>;
            delete?: Array<RequestHandler | ErrorRequestHandler>;
            post?: Array<RequestHandler | ErrorRequestHandler>;
        }
    };
    onGet?({req, res, params, query}: {req: any; res:any; params: any;query:any;}): Promise<any> | any;
    onPut?({req, res, data, params, query}: {req: any; res:any; data: T; params: any;query:any;}): Promise<any> | any;
    onPost?({req, res, data, params, query}: {req: any; res:any; data: T; params: any;query:any;}): Promise<any> | any;
    onDelete?({req, res, params, query}: {req: any; res:any; params: any;query:any;}): Promise<any> | any;
}) : Router {
    const router = Router();
    for (const key of Object.keys(METHODS)) {
        if (options[key]) {
            const m = METHODS[key];
            const url = `${options.baseUrl || ''}${typeof (options.url || '') === 'string' ? (options.url || '') : ((options.url || {})[m] || '') }`;
            
            router[METHODS[key]](url, ...compact([
                ...(options.hook?.before?.all || []),
                ...((options.hook?.before || {})[METHODS[key]] || []),
                async (req:any, res: any, done) => {
                    try {
                        const result = await options[key]({
                            req, res,
                            data: req.body,
                            params: req.params,
                            query: req.query,
                        });
                        res.result = result;
                        done();
                    } catch (error) {
                        console.error('error', error);
                        done(error);
                    }
                },
                ...((options.hook?.after || {})[METHODS[key]] || []),
                ...(options.hook?.after?.all || []),
                (_req, res: any) => {
                    if (res.result) {
                        return res.status(200).json({message: 'success', data: res.result, status: 200})
                    }
                    return res.status(201).send('');
                }
            ]));
        }
    }
    setRoute(router);
    return router;
}

export function getRoutes() : Array<Router> {
    return routes;
};
'use strict';

import { Router, RequestHandler } from 'express';
import { compact } from 'lodash';

const METHODS = {
    onGet: 'get',
    onPut: 'put',
    onDelete: 'delete',
    onPost: 'post',
}

export async function useRoute(options: {
    url: string;
    hook?: {
        before?: {
            all?: Array<RequestHandler>;
            get?: Array<RequestHandler>;
            put?: Array<RequestHandler>;
            delete?: Array<RequestHandler>;
            post?: Array<RequestHandler>;
        },
        after?: {
            all?: Array<RequestHandler>;
            get?: Array<RequestHandler>;
            put?: Array<RequestHandler>;
            delete?: Array<RequestHandler>;
            post?: Array<RequestHandler>;
        }
    };
    onGet?<T>({req, res, data}: {req: any; res:any; data: T}): Promise<any>;
    onPut?<T>({req, res, data}: {req: any; res:any; data: T}): Promise<any>;
    onPost?<T>({req, res, data}: {req: any; res:any; data: T}): Promise<any>;
    onDelete?<T>({req, res, data}: {req: any; res:any; data: T}): Promise<any>;
}) : Router {
    const router = Router();
    
    for (const key of Object.keys(METHODS)) {
        if (options[key]) {
            const m = METHODS[key];
            router[METHODS[key]](`${options.url || ''}`, ...compact([
                ...(options.hook?.before?.all || []),
                ...((options.hook?.before || {})[METHODS[key]] || []),
                async (res, req: any, done) => {
                    try {
                        const result = await options[key]({
                            req, res,
                            data: req.body,
                        });
                        res.result = result;
                        done();
                    } catch (error) {
                        done(error);
                    }
                },
                ...((options.hook?.after || {})[METHODS[key]] || []),
                ...(options.hook?.after?.all || [])
            ]));
        }
    }
    return router;
}
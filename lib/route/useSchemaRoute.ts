
import { RequestHandler, Router } from 'express';
import { useRoute } from './useRoute';
import { dbApiInterface } from '../schema/dbApiInterface';

export function useSchemaRoute<T>(options: {
    model: dbApiInterface<T>,
    baseUrl: string;
    url?: string | {
        get?: string;
        post?: string;
        put?: string;
        delete?: string;
    };
    hook?: {
        before?: {
            all?: Array<RequestHandler>;
            find?: Array<RequestHandler>;
            update?: Array<RequestHandler>;
            remove?: Array<RequestHandler>;
            insert?: Array<RequestHandler>;
        },
        after: {
            all?: Array<RequestHandler>;
            find?: Array<RequestHandler>;
            update?: Array<RequestHandler>;
            remove?: Array<RequestHandler>;
            insert?: Array<RequestHandler>;
        }
    },
    onInsert?({req, res, params, query, data}: {res?: any; req?: any; params?: any; query?: any; data?: any}) : Promise<T>;
    onUpdate?({req, res, query, data}: {res?: any; req?: any; params?: any; query?: any; data?: any}) : Promise<T>;
    onFind?({req, res, params, query}: {res?: any; req?: any; params?: any; query?: any}) : Promise<T>;
    onRemove?({req, res, params, query}: {res?: any; req?: any; params?: any; query?: any}) : Promise<T>;
}) : Router {
    const router = useRoute<T>({
        baseUrl: options.baseUrl,
        url: options.url,
        hook: {
            before: {
                all: options?.hook?.before?.all,
                get: options?.hook?.before?.find,
                put: options?.hook?.before?.update,
                delete: options?.hook?.before?.remove,
                post: options?.hook?.before?.insert,
            },
            after: {
                all: options?.hook?.after?.all,
                get: options?.hook?.after?.find,
                put: options?.hook?.after?.update,
                delete: options?.hook?.after?.remove,
                post: options?.hook?.after?.insert,
            }
        },
        async onPost({req, res, params, query, data}) {
            return await options.onInsert({data, req, res, params, query});
        },
        async onGet({req, res, params, query}) {
            return await options.onFind({params, query, res, req});
        },
        async onDelete({req, res, query, params}) {
            return await options.onRemove({params, query, res, req});
        },
        async onPut({req, res, data, params, query}) {
            return await options.onUpdate({req, res, data, params, query});
        }
    });
    return router;
}
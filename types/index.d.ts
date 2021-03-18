declare module "xeasy-orm" {
    import * as express from 'express';
    import * as Knex from 'knex';
    function useHttp ({config, routes, hooks}: {
        config: {
            port: number;
            debug?: boolean;
        };
        routes?: Array<express.Router> | undefined | null;
        hooks?: {
            befor?: Array<express.RequestHandler>,
            after?: Array<express.RequestHandler>,
        },
        knex?: Array<Knex.Config> | Knex.Config;
    }): express.Application;

    function stopHttp();

    function useRoute<T>(options: {
        baseUrl?: string;
        url: string | {
            get?: string;
            put?: string;
            post?: string;
            delete?: string;
        };
        hook?: {
            before?: {
                all?: Array<express.RequestHandler>;
                get?: Array<express.RequestHandler>;
                put?: Array<express.RequestHandler>;
                delete?: Array<express.RequestHandler>;
                post?: Array<express.RequestHandler>;
            },
            after?: {
                all?: Array<express.RequestHandler>;
                get?: Array<express.RequestHandler>;
                put?: Array<express.RequestHandler>;
                delete?: Array<express.RequestHandler>;
                post?: Array<express.RequestHandler>;
            }
        };
        onGet?({req, res, data}: {req: any; res:any; data: T}): Promise<any>;
        onPut?({req, res, data}: {req: any; res:any; data: T}): Promise<any>;
        onPost?({req, res, data}: {req: any; res:any; data: T}): Promise<any>;
        onDelete?({req, res, data}: {req: any; res:any; data: T}): Promise<any>;
    }) : express.Router;

    function useHook<T, D>(func: ({req, res, data, result}: {data: T; req: any; res: any;result: D}) => Promise<any>) : express.RequestHandler;

    function useKnex(config?: Knex.Config | Array<Knex.Config>) : Knex;

    function getKnexMaster() : Knex;

}

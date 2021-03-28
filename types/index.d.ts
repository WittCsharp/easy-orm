
declare module "xeasy-orm" {
    import * as express from 'express';
    import * as Knex from 'knex';
    import { Connection, ConnectionOptions, Schema, Document } from 'mongoose';
    type mongooseConfig = {
        uri: string;
        option: ConnectionOptions;
    }

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

    function getMongoseMaster() : Connection;

    function useMongose(configs?: mongooseConfig | Array<mongooseConfig> ) : Connection;

    function newSchema<T extends Document>(tableName: string, schema: Schema);

    interface dbApiInterface<T> {
        add(data: T) : Promise<T>;
        addMany(data: Array<T>) : Promise<Array<T>>;
        updateOne(query: any, data: T) : Promise<T>;
        updateById(id: string| number, data: T) : Promise<T>;
        updateMany(query: any, data: T) : Promise<T>;
        findOneById(id: string|number) : Promise<T>;
        findOne(query: any) : Promise<T>;
        findAll(query: any) : Promise<Array<T>>;
        deleteById(id: string | number) : Promise<T>;
        deleteOne(query: any) : Promise<T>;
    }

    function useMongoModel<T extends Document>(tableName: string, schema?: Schema) : dbApiInterface<T>
}

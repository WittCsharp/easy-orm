import { Connection, createConnection, ConnectionOptions, Schema, Document } from 'mongoose';

interface IConfig {
    uri: string;
    option?: ConnectionOptions;
}

export interface IMongoConfig {
    key: string;
    default?: boolean;
    config: IConfig | Array<IConfig>
}

class MongoClient {
    masterClient: Connection;
    resolveClients: Array<Connection> = [];
    index:number = 0;
    constructor(config: Array<IConfig>) {
        this._pushConfig(config);
    }

    _createClient(config: IConfig) : Connection {
        return createConnection(config.uri, Object.assign({
            useNewUrlParser: true,
            useUnifiedTopology: false,
            server: {
                auto_reconnect: true,
                poolSize: 200,
            }      
        }, config.option || {}));
    }

    _pushConfig(configs: Array<IConfig>) {
        const masterConfig = configs.shift();
        this.masterClient = this._createClient(masterConfig);
        for (const config of configs) {
            this.resolveClients.push(this._createClient(config));
        }
    }

    getClient(master?: boolean): Connection {
        if (master || this.resolveClients.length === 0) return this.masterClient;
        this.index += 1;
        if (this.index >= this.resolveClients.length) this.index = 0;
        return this.resolveClients[this.index];
    }

    newSchema<T extends Document>(tableName: string, schema: Schema) {
        if (this.masterClient) this.masterClient.model<T>(tableName, schema);
        if (this.resolveClients.length) {
            for (const client of this.resolveClients) {
                client.model<T>(tableName, schema);
            }
        }
    }

    closeAll() {
        if (this.masterClient) this.masterClient.close(true);
        for (const client of this.resolveClients) {
            client.close(true);
        }
    }
}

interface IMongodbManage {
    [key: string]: MongoClient;
}

const mongoDbManage: IMongodbManage = {};

export function useMongose(configs?: IMongoConfig | Array<IMongoConfig> | string, master?: boolean ) : Connection {
    if (typeof configs === 'string') return mongoDbManage[configs]?.getClient(master);
    if (!configs) return mongoDbManage.default?.getClient(master);

    if (!Array.isArray(configs)) {
        configs = [configs];
    }

    for (const config of configs) {
        mongoDbManage[config.key] = new MongoClient(Array.isArray(config.config) ? config.config : [config.config]);
        if (config.default) {
            mongoDbManage.default = mongoDbManage[config.key];
        }
    }

    if (mongoDbManage.default) {
        return mongoDbManage.default.getClient(master);
    } else {
        return mongoDbManage[configs[0].key]?.getClient(master);
    }
}

export function newSchema<T extends Document>(tableName: string, schema: Schema, key?: string) {
    const client = mongoDbManage[key || 'default'];
    client.newSchema<T>(tableName, schema);
}

export function closeMongoAll() {
    for (const key in mongoDbManage) {
        mongoDbManage[key].closeAll();
    }
}
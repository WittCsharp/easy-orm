import { Connection, createConnection, ConnectionOptions, Schema, Document } from 'mongoose';

let masterClient: Connection;
let resolveClients: Array<Connection> = [];
let index:number = 0;

export type mongooseConfig = {
    uri: string;
    option?: ConnectionOptions;
}

function pushConfig(configs: Array<mongooseConfig>) {
    if (!configs.length) {
        return [];
    }
    if (!masterClient) {
        const config = configs.shift();
        masterClient = createConnection(config.uri, Object.assign({
            useNewUrlParser: true,
            useUnifiedTopology: false,
            server: {
                auto_reconnect: true,
                poolSize: 200,
            }      
        }, config.option || {}));
    } 
    for (const config of configs) {
        const client = createConnection(config.uri, Object.assign({
            useNewUrlParser: true,
            useUnifiedTopology: false,
            server: {
                auto_reconnect: true,
                poolSize: 200,
            }
        }, config.option || {}));
        resolveClients.push(client);
    }
    return resolveClients;
}

export function getMongoseMaster() : Connection {
    return masterClient;
}

export function useMongose(configs?: mongooseConfig | Array<mongooseConfig> ) : Connection {
    if (!configs) {
        if (resolveClients.length) {
            const client = resolveClients[index];
            index++;
            if (index > resolveClients.length) index = 0;
            return client;
        }
        return masterClient;
    }
    pushConfig(Array.isArray(configs) ? configs : [configs])
    if(!resolveClients.length) return masterClient;
    return resolveClients[index];
}

export function newSchema<T extends Document>(tableName: string, schema: Schema) {
    if (masterClient) masterClient.model<T>(tableName, schema);
    if (resolveClients.length) {
        for (const client of resolveClients) {
            client.model<T>(tableName, schema);
        }
    }
}
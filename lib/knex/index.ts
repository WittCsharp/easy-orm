import * as Knex from 'knex';

export interface IKnexConfig {
    key: string;
    default?: boolean;
    config: Knex.Config;
}

interface IKnexManage {
    [key: string]: KnexClient;
}

class KnexClient {
    resolveKnexClients: Array<Knex> = [];
    masterKnexClient: Knex;
    index: number = 0;
    constructor(configs: Knex.Config | Array<Knex.Config>) {
        this._pushResolve(Array.isArray(configs) ? configs : [configs]);
    }

    /**
     * 添加从数据库配置
     * @param configs 数据库配置
     */
    _pushResolve(configs: Array<Knex.Config>) : Array<Knex> {
        const masterConfig = configs.shift();
        this.masterKnexClient = Knex(masterConfig);
        for (const config of configs) {
            this.resolveKnexClients.push(Knex(config));    
        }
        return this.resolveKnexClients;
    }

    getClient(master?: boolean): Knex {
        if (master || this.resolveKnexClients.length === 0) return this.masterKnexClient;
        this.index += 1;
        if (this.index >= this.resolveKnexClients.length) this.index = 0;
        return this.resolveKnexClients[this.index];
    }

    close() {
        this.masterKnexClient.destroy();
        for (const client of this.resolveKnexClients) {
            client.destroy();
        }
    }
}

const knexClients: IKnexManage = {};

/**
 * 配置数据库
 * @param config 可传数组或单个对象，数字默认第一个为master配置，
 * 作为写入数据库，其他作为从数据库，
 * 存在从数据库时，使用useKnex获取的client对象只为从数据库，
 * master数据库需要使用getKnexMaster获取
 */
export function useKnex(configs?: IKnexConfig | Array<IKnexConfig> | string, master?: boolean) : Knex {
    if (typeof configs === 'string') return knexClients[configs]?.getClient(master);
    if (!configs) return knexClients.default?.getClient(master);
    if (!Array.isArray(configs)) {
        configs = [configs];
    }
    for (const config of configs) {
        knexClients[config.key] = new KnexClient(config.config);
        if (config.default) {
            knexClients.default = knexClients[config.key];
        }
    }
    if (knexClients.default) {
        return knexClients.default.getClient(master);
    } else {
        return knexClients[configs[0].key]?.getClient(master);
    }
}

export function closeKnexAll() {
    for (const key in knexClients) {
        knexClients[key].close();
    }
}
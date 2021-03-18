import * as Knex from 'knex';

let resolveKnexClients: Array<Knex> = [];
let masterKnexClient: Knex;
let index = 0;

/**
 * 添加从数据库配置
 * @param configs 数据库配置
 */
function pushResolve(configs: Array<Knex.Config>) : Array<Knex> {
    for (const config of configs) {
        resolveKnexClients.push(Knex(config));    
    }
    return resolveKnexClients;
}

/**
 * 获取主数据库配置
 */
export function getKnexMaster() : Knex {
    return masterKnexClient;
}

/**
 * 配置数据库
 * @param config 可传数组或单个对象，数字默认第一个为master配置，
 * 作为写入数据库，其他作为从数据库，
 * 存在从数据库时，使用useKnex获取的client对象只为从数据库，
 * master数据库需要使用getKnexMaster获取
 */
export function useKnex(config?: Knex.Config | Array<Knex.Config>) : Knex {
    if (!config) {
        if (!resolveKnexClients.length) return masterKnexClient;
        const client = resolveKnexClients[index];
        index++;
        if (index >= resolveKnexClients.length) index = 0;
        return client;
    }
    let configs: Array<Knex.Config> = [];
    if (!Array.isArray(config)) {
        configs.push(config);
    } else {
        configs.push(...config);
    }
    masterKnexClient = Knex(configs.shift());
    // 多配置，读写分离
    pushResolve(configs);
    return masterKnexClient;
}
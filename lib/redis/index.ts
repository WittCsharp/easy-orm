import * as Redis from 'ioredis';

interface IRedisManage {
    [key: string]: RedisClient;
}

export interface IRedisConfig {
    key: string;
    default?: boolean;
    config: Redis.RedisOptions | Array<Redis.RedisOptions>;
}

const clients: IRedisManage = {
    default: null,
};

class RedisClient {
    redis: Redis.Redis | Redis.Cluster;
    constructor(config: Redis.RedisOptions | Array<Redis.RedisOptions>) {
        if (Array.isArray(config)) this.redis = new Redis.Cluster(config);
        else this.redis = new Redis(config);
    }
}

export function useRedis(options?: IRedisConfig | string) : Redis.Redis | Redis.Cluster {
    if (!options) return clients.default?.redis;
    if (typeof options == 'string') return clients[options]?.redis;
    clients[options.key || 'default'] = new RedisClient(options.config);
    if (options.default)
        clients.default = clients[options.key];
    return clients[options?.key || 'default']?.redis;
}

export function closeRedisAll() {
    for (const key in clients) {
        clients[key].redis.disconnect();
    }
}
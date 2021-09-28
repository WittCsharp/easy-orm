import { connect, Connection, Options } from 'amqplib';

export interface IRabbitConfig {
    key: string;
    default?: boolean;
    config: Options.Connect | string;
}

interface IRabbitManage {
    [key: string]: RabbitmqClient;
}


function isJsonString(str) {
    try {
        if (typeof JSON.parse(str) == "object") {
            return true;
        }
    } catch(e) {
    }
    return false;
}

class RabbitmqClient {
    config: string | Options.Connect;
    open: boolean = false;
    client: Connection;
    constructor(url: string | Options.Connect) {
        this.config = url;
    }

    async connect() : Promise<Connection> {
        if (this.open) return this.client;
        this.client = await connect(this.config);
        this.open = true;
        return this.client;
    }

    async close() {
        if (!this.open) return;
        const _client = this.client;
        setTimeout(() => {
            _client.close().then();
        }, 500);
        this.open = false;
    }

    async publish({channel, exchangeType, routingKey, options, content, exchangeOptions}: {
        channel: string;
        exchangeType?: string;
        exchangeOptions?: Options.AssertExchange;
        routingKey?: string;
        options?: Options.Publish;
        content: string | Object;
    }) : Promise<boolean> {
        const conn: Connection = await this.connect();
        try {
            const chh = await conn.createChannel();
            await chh.assertExchange(channel, exchangeType || 'fanout', exchangeOptions);
            return await chh.publish(channel, routingKey, Buffer.from( typeof content === 'string' ? content : JSON.stringify(content)), options);
        } catch (error) {
            console.log(error);
            throw error;
        }

    }

    async publisher(props: {
        queue: string;
        queueOptions?: Options.AssertQueue;
        msg: string | Object;
    }) {
        const conn: Connection = await this.connect();
        try {
            const chh = await conn.createChannel();
            await chh.assertQueue(props.queue, props.queueOptions);
            
            await chh.sendToQueue(props.queue, 
                Buffer.from(typeof props.msg === 'string' ? 
                props.msg : JSON.stringify(props.msg)));
        } catch (error) {
            console.log(error);
            throw error;
        }
    }

    async consumer(props: {
        queue: string;
        queueOptions?: Options.AssertQueue;
        onMessage: (msg: string | Object, ack: () => Promise<void>) => (boolean | Promise<boolean>); 
        consumeOptions?: Options.Consume
    }) {
        const conn: Connection = await this.connect();
        try {
            const chh = await conn.createChannel();
            await chh.assertQueue(props.queue, props.queueOptions);
            await chh.consume(props.queue, async (msg) => {
                const message = msg.content.toString();
                let flag = false;
                if (isJsonString(message)) {
                    flag = await props.onMessage(JSON.parse(message), async () => {
                        await chh.ack(msg)
                    });
                } else {
                    flag = await props.onMessage(message, async () => {
                        await chh.ack(msg)
                    });
                }
                if (flag) {
                    await chh.ack(msg);
                }
            } , props.consumeOptions);
        } catch (error) {
            console.log(error);
            throw error;
        } 
    }

    getClient(): RabbitmqClient {
        return this;
    }
}

const rabbitmqClient: IRabbitManage = {};

export function useRabbitMq(configs?: IRabbitConfig | Array<IRabbitConfig>) {
    if (typeof configs === 'string') return rabbitmqClient[configs]?.getClient();
    if (!configs) return rabbitmqClient.default?.getClient();
    if (!Array.isArray(configs)) {
        configs = [configs];
    }
    for (const config of configs) {
        rabbitmqClient[config.key] = new RabbitmqClient(config.config);
        if (config.default) {
            rabbitmqClient.default = rabbitmqClient[config.key];
        }
    }
    if (rabbitmqClient.default) {
        return rabbitmqClient.default.getClient();
    } else {
        return rabbitmqClient[configs[0].key]?.getClient();
    }
}
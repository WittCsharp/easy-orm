import { useRabbitMq } from "..";

describe('rabbit test', () => {
    const client = useRabbitMq({
        key: 'rabbit',
        default: true,
        config: 'amqp://127.0.0.1:5672'
    });

    const client2 = useRabbitMq({
        key: 'rabbit2',
        config: 'amqp://127.0.0.1:5672'
    })

    it ('test rabbitmq', async (done) => {
        setTimeout(() => {
            done();
        }, 60000)
        await client2.consumer({
            queue: 'test3',
            onMessage: async (msg, ack) => {
                expect(msg).toBe('This is test message');
                await ack();
                await client2.close();
                done();
                return false;
            }
        });
        setTimeout(() => {
            client.publisher({
                queue: 'test3',
                msg: 'This is test message'
            }).then(() => {
                client.close().then();
            });
        }, 5000);
    }, 60000);

})

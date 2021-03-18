import { useKnex } from '../../knex';

describe('knex test', () => {
    beforeAll(async () => {
        const client = useKnex({
            client: 'mysql',
            connection: {
                host: '192.168.10.109',
                user: 'root',
                password: '12345678',
                database: 'myapp_test',
                port: 3306,
            }
        });

        await client.schema.createTableIfNotExists('user', function(table) {
            table.increments('id').primary();
            table.string('name').notNullable();
        });
    })

    it('mysql', async () => {
        const result = await useKnex().table('user').select('*');
        console.log(result);
        expect(result).toMatchObject([]);
    })
});

import { useKnex } from "../../knex";
import { closeKnexAll } from '../../knex/index';

describe('knex test', () => {
    beforeAll(async (done) => {
        const client = useKnex({
            key: 'mysql',
            default: true,
            config: {
                client: 'mysql',
                connection: {
                    host: '127.0.0.1',
                    user: 'root',
                    password: '12345678',
                    database: 'myapp_test',
                    port: 3306,
                }
            }
        });

        await client.schema.createTableIfNotExists('user', function(table) {
            table.increments('id').primary();
            table.string('name').notNullable();
        });
        done()
    })

    it('mysql', async () => {
        const result = await useKnex().table('user').select('*');
        console.log(result);
        expect(result).toMatchObject([]);
    })

    afterAll(() => {
        closeKnexAll();
    })
});
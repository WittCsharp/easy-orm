import useLogger from "../../log4j";
import { useKnexModel } from "../../schema/useKnexModel";
import { useTestHandler, testRequest } from "../../tests/useTestHandler";
import useSchemaRouter from "../useSchemaRoute";

interface IUser {
    id?: number;
    name?: string;
}

useTestHandler('', () => {
    useSchemaRouter({
        baseUrl: '/test/user',
        model: function() {
            return useKnexModel<IUser>('user');
        },
    });

    it('insert one', async () => {
        const response = await testRequest.post('/test/user/insert').set('Content-Type', 'application/json').send({
            name: '张三'
        });
        useLogger().log(JSON.stringify(response.body));

        expect(response.body.data).toMatchObject({
            id: 1,
            name: '张三'
        })
    });

    it('insert many', async () => {
        const response = await testRequest.post('/test/user/insert').set('Content-Type', 'application/json').send([{
            name: '张三'
        }, {
            name: '李四'
        }]);
        useLogger().log(JSON.stringify(response.body));

        expect(response.body.status).toBe(200);
        expect(response.body.data).toMatchObject([{
            id: 1,
            name: '张三'
        }, {
            id: 2,
            name: '李四'
        }]);
    });

    it('delete by id', async () => {
        const user = await useKnexModel<IUser>('user').addOne({
            name: 'test'
        });

        const response = await testRequest.delete(`/test/user/${user.id}`);

        expect(response.status).toBe(200);
        expect(response.body.data).toMatchObject({
            name: 'test'
        });
    });

    it('find by id', async () => {
        const user = await useKnexModel<IUser>('user').addOne({
            name: 'test'
        });

        const response = await testRequest.get(`/test/user/${user.id}`);

        expect(response.status).toBe(200);
        expect(response.body.data).toMatchObject(user);
    });

    it('find one', async () => {
        const user = await useKnexModel<IUser>('user').addOne({
            name: 'test'
        });

        const response = await testRequest.post(`/test/user/findone`)
            .set('content-type','application/json')
            .send({ name: 'test' });

        expect(response.status).toBe(200);
        expect(response.body.data).toMatchObject(user);
    });

    it('update by id', async () => {
        const user = await useKnexModel<IUser>('user').addOne({
            name: 'test'
        });

        const response = await testRequest.put(`/test/user/${user.id}`)
        .set('content-type','application/json')
        .send({ name: 'test2' });

        expect(response.status).toBe(200);
        expect(response.body.data).toMatchObject({
            id: user.id,
            name: 'test2',
        });
    });

    it('find by list', async () => {
        const users = await useKnexModel<IUser>('user').addMany([{
            name: 'test1'
        }, {
            name: 'test2'
        }, {
            name: 'test3'
        }, {
            name: 'test4'
        }]);

        const response = await testRequest.post(`/test/user/list?page=2&pageSize=2`)
            .set('content-type','application/json');

        expect(response.status).toBe(200);
        expect(response.body.data.total).toBe(4);
        expect(response.body.data.list).toMatchObject(users.splice(2));
    });
});
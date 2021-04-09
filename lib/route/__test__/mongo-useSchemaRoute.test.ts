import useLogger from "../../log4j";
import { useMongoModel } from "../../schema";
import { useTestHandler, testRequest } from "../../tests/useTestHandler";
import useSchemaRouter from "../useSchemaRoute";
import { Document } from 'mongoose';

interface IUserDocument extends Document {
    name?: string;
    age?: number;
}

interface IUser {
    _id?: string;
    __v?: number;
    name?: string;
    age?: number;
}

useTestHandler('', () => {
    useSchemaRouter({
        baseUrl: '/test/user',
        model: function() {
            return useMongoModel<IUserDocument, IUser>('user');
        },
    });

    it('insert one', async () => {
        const response = await testRequest.post('/test/user/insert').set('Content-Type', 'application/json').send({
            name: '张三'
        });
        useLogger().log(JSON.stringify(response.body));

        expect(response.body.data).toMatchObject({
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
            name: '张三'
        }, {
            name: '李四'
        }]);
    });

    it('delete by id', async () => {
        const user = await useMongoModel<IUserDocument, IUser>('user').addOne({
            name: 'test'
        });

        useLogger().log(JSON.stringify(user) + "delete by id");

        const response = await testRequest.delete(`/test/user/${user._id}`);

        expect(response.status).toBe(200);
        expect(response.body.data).toMatchObject({
            name: 'test'
        });
    });

    it('find by id', async () => {
        const user = await useMongoModel<IUserDocument, IUser>('user').addOne({
            name: 'test'
        });

        useLogger().log(JSON.stringify(user) + "find by id");

        const response = await testRequest.get(`/test/user/${user._id}`);

        useLogger().log(JSON.stringify(response.body) + "find by id");

        expect(response.status).toBe(200);
        expect(response.body.data).toMatchObject({
            _id: user._id.toString(),
            name: 'test',
        });
    });

    it('find one', async () => {
        const user = await useMongoModel<IUserDocument, IUser>('user').addOne({
            name: 'test'
        });

        const response = await testRequest.post(`/test/user/findone`)
            .set('content-type','application/json')
            .send({ name: 'test' });

        expect(response.status).toBe(200);
        expect(response.body.data).toMatchObject({
            _id: user._id.toString(),
            name: 'test',
        });
    });

    it('update by id', async () => {
        const user = await useMongoModel<IUserDocument, IUser>('user').addOne({
            name: 'test'
        });

        const response = await testRequest.put(`/test/user/${user._id}`)
        .set('content-type','application/json')
        .send({ name: 'test2' });

        expect(response.status).toBe(200);
        expect(response.body.data).toMatchObject({
            _id: user._id.toString(),
            name: 'test2',
        });
    });

    it('find by list', async () => {
        const users = await useMongoModel<IUserDocument, IUser>('user').addMany([{
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
        expect(response.body.data.list).toMatchObject([{
            _id: users[2]._id.toString(),
            name: 'test3'
        }, {
            _id: users[3]._id.toString(),
            name: 'test4'
        }]);
    });
});
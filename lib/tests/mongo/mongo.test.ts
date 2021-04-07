import { closeMongoAll, useMongose } from '../../mongodb';
import { Document, Schema } from 'mongoose';
import {  MongoModelMaster, useMongoModel } from '../../schema/useMongoModel';
import useLogger from '../../log4j';
import { levels } from 'log4js';

interface IUserDocument extends Document {
    name: string;
    age: number;
}

interface IUser {
    _id?: string;
    __v?: number;
    name: string;
    age: number;
}

describe('mongo test', () => {

    let model: MongoModelMaster<IUserDocument, IUser>;

    beforeAll(async () => {
        useMongose({
            key: 'mongo',
            default: true,
            config: {
                uri: 'mongodb://admin:123456@127.0.0.1:27017/admin',
            }
        });

        model = useMongoModel<IUserDocument, IUser>('user', new Schema({
            name: {type: String},
            age: { type: Number},
        }));

        await useMongose().model('user').deleteMany({});
    })

    it('mongodb insert', async () => {
        const result = await model.addOne({
            name: '张三',
            age: 18
        });
        expect(result).toMatchObject({
            name: '张三',
            age: 18,
        });
    });

    it('mongodb findone', async () => {
        const result = await model.findOne({name: '张三'});
        expect(result).toMatchObject({
            name: '张三',
            age: 18
        });
    });

    it('updateOne', async () => {
        const result = await model.updateOne({name: '张三'}, {name: '李四', age: 24});
        expect(result).toMatchObject({
            name: '李四',
            age: 24
        });
    });

    it('deleteOne', async () => {
        useLogger().log({
            logger: 'test',
            level: levels.ERROR,
            message: 'delete on by mongo with log4js'
        })
        const result = await model.deleteOne({name: '李四'});
        expect(result).toMatchObject({
            name: '李四',
            age: 24,
        })

        const data = await model.findAll({});
        expect(data.length).toBe(0);
    });

    afterAll(() => {
        closeMongoAll();
    })
})
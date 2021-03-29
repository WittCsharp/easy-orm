import { useMongose } from '../../mongodb';
import { Document, Schema } from 'mongoose';
import {  useMongoModel } from '../../schema/useMongoModel';

describe('mongo test', () => {

    interface IUserDocument extends Document {
        name: string;
        age: number;
    }

    interface IUser {
        name: string;
        age: number;
    }


    beforeAll(async () => {
        useMongose({
            uri: 'mongodb://admin:123456@127.0.0.1:27017/ormtest',
        });

        const model = useMongoModel<IUserDocument, IUser>('user', new Schema({
            name: {type: String},
            age: { type: Number},
        }));   
    })

    it('mongodb insert', async () => {
        await useMongoModel<IUserDocument, IUser>('user').add({
            name: '张三',
            age: 19,
        })
    });
})
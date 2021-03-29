import { useMongose } from '../../mongodb';
import { Document, Schema } from 'mongoose';
import {  MongoModelMaster, useMongoModel } from '../../schema/useMongoModel';

describe('mongo test', () => {

    interface IUserDocument extends Document {
        name: string;
        age: number;
    }

    interface IUser {
        name: string;
        age: number;
    }

    let model: MongoModelMaster<IUserDocument, IUser>;


    beforeAll(async () => {
        useMongose({
            uri: 'mongodb://admin:123456@127.0.0.1:27017/ormtest',
        });

        model = useMongoModel<IUserDocument, IUser>('user', new Schema({
            name: {type: String},
            age: { type: Number},
        }));   
    })

    it('mongodb insert', async () => {
        await model.add({
            name: '张三',
            age: 18
        })
    });
})
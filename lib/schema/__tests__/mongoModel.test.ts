import { Document } from 'mongoose';
import {  cleanAll, MongoModelMaster, useMongoModel } from '../useMongoModel';
import { useTestHandler } from '../../tests/useTestHandler';
import useLogger from '../../log4j';
import { levels } from 'log4js';

interface IUserDocument extends Document {
    name: string;
}

interface IUser {
    _id?: string;
    __v?: number;
    name: string;
}

useTestHandler('mongo test', () => {
    useLogger().log({
        message: 'mongo test 2',
    })
    let model: MongoModelMaster<IUserDocument, IUser>;

    beforeAll(() => {
        model = useMongoModel<IUserDocument, IUser>('user')
    })

    it('add one', async () => {
        const result = await model.addOne({
            name: '张三',
        });
        
        useLogger().log({
            logger: 'test',
            level: levels.DEBUG,
            message: JSON.stringify(result),
        });
        
        expect(result).toMatchObject({
            name: '张三'
        });
    });

    it('find one by id', async () => {
        const data = await model.addOne({
            name: '张三',
        });
        const result = await model.findOneById(data._id);
        useLogger().log({
            logger: 'test',
            level: levels.DEBUG,
            message: JSON.stringify(result),
        });
        
        expect(result).toMatchObject({
            name: '张三'
        });
    });

    it('find one', async () => {
        await model.addOne({ name: '张三' });
        const result = await model.findOne({name: '张三'});
        useLogger().log({
            logger: 'test',
            level: levels.DEBUG,
            message: JSON.stringify(result),
        });
        
        expect(result).toMatchObject({
            name: '张三'
        });
    });

    it('add many', async () => {
        const data = await model.addMany([
            {
                name: '李四'
            },
            {
                name: '王五'
            },
            {
                name: '赵六'
            }
        ]);

        useLogger().log({
            logger: 'test',
            level: levels.DEBUG,
            message: JSON.stringify(data),
        });

        expect(data).toMatchObject([
            {
                name: '李四'
            },
            {
                name: '王五'
            },
            {
                name: '赵六'
            }
        ]);
    });

    it('find count', async () => {
        await model.addOne({ name: '张三' });
        const count = await model.findCount();
        useLogger().log({
            logger: 'test',
            level: levels.DEBUG,
            message: JSON.stringify(count),
        });
        expect(count).toBe(1);
    });

    it('find list', async () => {
        await model.addMany([{ name: '张三' }, { name: '李四' }, { name: '王五' }, { name: '赵六' }]);
        const result = await model.findList({
            page: 2,
            pageSize:2,
        });

        useLogger().log({
            logger: 'test',
            level: levels.DEBUG,
            message: JSON.stringify(result),
        });

        expect(result.length).toBe(2);
        expect(result).toMatchObject([
            {
                name: '王五'
            },
            {
                name: '赵六',
            }
        ])
    });

    it('update by id', async () => {
        const data = await model.addOne({ name: '张三' });
        const result = await model.updateById(data._id, {
            name: 'test'
        });

        useLogger().log({
            logger: 'test',
            level: levels.DEBUG,
            message: JSON.stringify(result),
        });

        expect(result).toMatchObject({
            name: 'test',
        });
    });

    it('update one', async () => {
        await model.addOne({ name: '张三' });
        const result = await model.updateOne({name: '张三'}, {name: 'test'});
        useLogger().log({
            logger: 'test',
            level: levels.DEBUG,
            message: JSON.stringify(result),
        });

        expect(result).toMatchObject({
            name: 'test',
        });
    });

    it('update many', async () => {
        await model.addOne({ name: 'test' });
        await model.addOne({ name: 'test' });
        const result = await model.updateMany({name: 'test'}, {name: 'many'});
        useLogger().log({
            logger: 'test',
            level: levels.DEBUG,
            message: JSON.stringify(result),
        });

        expect(result.length).toBe(2);
        expect(result).toMatchObject([
            {
                name: 'many'
            },
            {
                name: 'many'
            }
        ]);
    });

    it('delete by id', async () => {
        const data = await model.addOne({ name: '张三' });
        await model.deleteById(data._id);
        const result = await model.findCount();

        expect(result).toBe(0);
    });

    it('delete one', async () => {
        await model.addOne({ name: '张三' });
        await model.deleteOne({name: '张三'});
        const result = await model.findCount();

        expect(result).toBe(0);
    });

    it('clean', async () => {
        await model.addOne({ name: '张三' });
        await model.addOne({ name: '张三2' });

        await model.clean();
        const result = await model.findCount();

        expect(result).toBe(0);
    });

    it('clean all', async () => {
        await model.addOne({ name: '张三' });
        await cleanAll();

        const result = await model.findCount();

        expect(result).toBe(0);
    });

})
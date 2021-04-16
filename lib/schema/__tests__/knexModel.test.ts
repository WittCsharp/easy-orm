// import { useKnex, closeKnexAll } from '../../knex';
import useLogger from '../../log4j';
import { cleanAll, KnexModelMaster, useKnexModel } from '../useKnexModel';
import { levels } from 'log4js';
import { useTestHandler } from '../../tests/useTestHandler';

useTestHandler('knex model test', () => {
    interface IUser {
        id?: number;
        name?: string;
    }

    let model: KnexModelMaster<IUser> = useKnexModel<IUser>('user', 'mysql');;

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
            id: 1,
            name: '张三'
        });
    });

    it('find one by id', async () => {
        await model.addOne({
            name: '张三',
        });
        const result = await model.findOneById(1);
        useLogger().log({
            logger: 'test',
            level: levels.DEBUG,
            message: JSON.stringify(result),
        });
        
        expect(result).toMatchObject({
            id: 1,
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
            id: 1,
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
                id: 1,
                name: '李四'
            },
            {
                id: 2,
                name: '王五'
            },
            {
                id: 3,
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
                id: 3,
                name: '王五'
            },
            {
                id: 4,
                name: '赵六',
            }
        ])
    });

    it('update by id', async () => {
        await model.addOne({ name: '张三' });
        const result = await model.updateById(1, {
            name: 'test'
        });

        useLogger().log({
            logger: 'test',
            level: levels.DEBUG,
            message: JSON.stringify(result),
        });

        expect(result).toMatchObject({
            id: 1,
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
            id: 1,
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
                id: 1,
                name: 'many'
            },
            {
                id:2,
                name: 'many'
            }
        ]);
    });

    it('delete by id', async () => {
        await model.addOne({ name: '张三' });
        await model.deleteById(1);
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

});
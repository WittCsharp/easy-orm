import { useKnex } from '../knex';
import { IDbApi } from './dbApiInterface';

export class KnexModelMaster<T> implements IDbApi<T> {
    tbName: string;
    dbKey: string;
    constructor(tableName: string, dbKey?: string) {
        this.tbName = tableName;
        this.dbKey = dbKey;
    }

    getKnex(master?: boolean) {
        return useKnex(this.dbKey, master).table(this.tbName);
    }

    async addOne(data: T): Promise<T> {
        const ids = await useKnex(this.dbKey, true).table(this.tbName).insert(data);
        const result = await useKnex(this.dbKey).table(this.tbName).select('*')
                .whereIn('id', ids).first();
        return result;
    }

    async addMany(data: T[]): Promise<T[]> {
        const ids: Array<number> = await useKnex(this.dbKey, true).table(this.tbName).insert(data);

        const results = await useKnex(this.dbKey).table(this.tbName).select('*')
                .whereBetween('id', [ids[0], ids[0] + data.length]);
        return results;
    }
    async updateOne(query: any, data: T): Promise<T> {
        const record:{id: string} = await useKnex(this.dbKey).table(this.tbName).select('id').where(query).first();
        await useKnex(this.dbKey, true).table(this.tbName).update(data).where('id', record.id);
        return await useKnex(this.dbKey).table(this.tbName).select('*').where('id', record.id).first();
    }
    async updateById(id: string | number, data: T): Promise<T> {
        await useKnex(this.dbKey, true).table(this.tbName).update(data).where('id', id);
        return await useKnex(this.dbKey).table(this.tbName).select('*').where('id', id).first();
    }
    async updateMany(query: any, data: T): Promise<T[]> {
        const record:Array<{id: string}> = await useKnex(this.dbKey).table(this.tbName).select('id').where(query);
        await useKnex(this.dbKey, true).table(this.tbName).update(data).whereIn('id', record.map(r => r.id));
        return await useKnex(this.dbKey).table(this.tbName).select('*').whereIn('id', record.map(r => r.id));
    }
    async findOneById(id: string | number): Promise<T> {
        return await useKnex(this.dbKey).table(this.tbName).select('*').where('id', id).first();
    }
    async findOne(query: any): Promise<T> {
        return await useKnex(this.dbKey).table(this.tbName).select('*').where(query).first();
    }
    async findAll(query?: any, sort?: any): Promise<T[]> {
        let exec = useKnex(this.dbKey).table(this.tbName).select('*');
        if (query) {
            exec = exec.where(query);
        }
        if (sort) exec = exec.orderBy(sort);
        return await exec;
    }
    async findCount(query?: any): Promise<number> {
        let exec = useKnex(this.dbKey).table(this.tbName).count<{count: number}>('id as count').first();
        if (query) exec = exec.where(query);
        const result = await exec;
        return result.count;
    }
    async findList(options: { query?: any; page: number; pageSize: number; sort?: any; }): Promise<any[]> {
        let exec = useKnex(this.dbKey).table(this.tbName).select('*')
            .offset(options.pageSize * (options.page - 1))
            .limit(options.pageSize);
            if (options.query) {
                exec = exec.where(options.query);
            }
            if (options.sort) exec = exec.orderBy(options.sort);
        const result = await exec;
        return result;
    }
    async deleteById(id: string | number): Promise<T> {
        const result = await useKnex(this.dbKey).table(this.tbName).select('*').where('id', id).first();
        await useKnex(this.dbKey, true).table(this.tbName).delete().where('id', id);
        return result;
    }
    async deleteOne(query: any): Promise<T> {
        const result = await useKnex(this.dbKey).table(this.tbName).select('*').where(query).first();
        await useKnex(this.dbKey, true).table(this.tbName).delete().where('id', result.id);
        return result;
    }

}

interface IKnexModel {
    [key: string]: KnexModelMaster<any>;
}

const models: IKnexModel = {

}

export function useKnexModel<T>(tableName: string, dbKey?: string) : KnexModelMaster<T> {
    if (!models[tableName]){
        models[tableName] = new KnexModelMaster<T>(tableName, dbKey);
    }
    return models[tableName];
}
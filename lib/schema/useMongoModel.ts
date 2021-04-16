import { IDbApi } from './dbApiInterface';
import { Document, Schema, FilterQuery, Model } from 'mongoose';
import {useMongose, newSchema} from '../mongodb';
import useLogger from '../log4j';
import { levels } from 'log4js';

export class MongoModelMaster<T extends Document, D> implements IDbApi<D> {
    tbName: string;
    dbKey?: string;
    constructor(tableName: string, schema: Schema, dbKey?: string) {
        this.tbName = tableName;
        this.dbKey = dbKey;  // 对应的client端key
        newSchema<T>(tableName, schema, dbKey);
    }
    async clean(): Promise<boolean> {
        try {
            await useMongose(this.dbKey, true).model<T>(this.tbName).remove({});
            return true;
        } catch (error) {
            return false;
        }
    }

    getModel(master?: boolean) : Model<T, {}> {
        return useMongose(this.dbKey, master).model<T>(this.tbName);
    }
    
    async deleteOne(query: FilterQuery<T>): Promise<D> {
        const result = await useMongose().model<T>(this.tbName).findOneAndDelete(query);
        return result.toObject();
    }

    async findCount(query?: FilterQuery<T>) : Promise<number> {
        query = query || {};
        return await useMongose().model<T>(this.tbName).count(query);
    }

    async findOneById(id: string | number): Promise<D> {
        const doc = await useMongose().model<T>(this.tbName).findById(id);
        return doc.toObject();
    }

    async findOne(query: FilterQuery<T>): Promise<D> {
        const doc = await useMongose().model<T>(this.tbName).findOne(query);
        return doc.toObject();
    }

    async findAll(query?: FilterQuery<any>, sort?: any): Promise<D[]> {
        let exec = useMongose().model<T>(this.tbName).find(query);
        if (sort) {
            exec = exec.sort(sort);
        }
        const doc = await exec;
        return doc.map(d => d.toObject());
    }

    async findList(options: {
        query?: FilterQuery<T>; 
        page: number; 
        pageSize: number;
        sort?: any;
    }): Promise<D[]> {
        let exec = useMongose().model<T>(this.tbName).find(options.query)
        .skip(options.pageSize * (options.page - 1))
        .limit(options.pageSize);
        if (options.sort) {
            exec = exec.sort(options.sort);
        }
        const doc = await exec;
        return doc.map(d => d.toObject());
    }

    async addOne(data: D): Promise<D> {
        const doc = await useMongose(this.dbKey, true).model<T>(this.tbName).insertMany([data]);
        return doc[0].toObject();
    }

    async addMany(data: D[]): Promise<D[]> {
        const doc = await useMongose(this.dbKey, true).model<T>(this.tbName).insertMany(data);
        return doc.map(d => d.toObject());
    }

    async updateById(id: string | number, data: D): Promise<D> {
        const doc = await useMongose(this.dbKey, true).model<T>(this.tbName).findByIdAndUpdate(id, data);
        return await this.findOneById(doc._id);
    }

    async updateOne(query: FilterQuery<T>, data: D): Promise<D> {
        const doc = await useMongose(this.dbKey, true).model<T>(this.tbName).findOneAndUpdate(query, data);
        return await this.findOneById(doc._id);
    }

    async updateMany(query: FilterQuery<T>, data: D): Promise<D[]> {
        const oldDoc:Array<any> = await this.findAll(query);
        const doc = await useMongose(this.dbKey, true).model<T>(this.tbName).updateMany(query, data);
        useLogger().log({
            message: JSON.stringify(doc),
        });
        return await this.findAll({_id: {'$in': oldDoc.map(d => d._id)}});
    }

    async deleteById(id: string): Promise<D> {
        const doc = await useMongose(this.dbKey, true).model<T>(this.tbName).findByIdAndDelete(id);
        return doc.toObject();
    }
    
}

interface modelInterface {
    [key: string]: MongoModelMaster<any, any>;
}

const models: modelInterface = {};

export function useMongoModel<T extends Document, D>(tableName: string, schema?: Schema, mongoKey?: string) : MongoModelMaster<T, D> {
    if (schema)
        models[tableName] = new MongoModelMaster<T, D>(tableName, schema, mongoKey);
    useLogger().log({
        logger: 'mongoModel',
        level: levels.DEBUG,
        message: Object.keys(models).join('-'),
    })
    return models[tableName];
}

export async function cleanAll() {
    for (const tableName of Object.keys(models)) {
        await models[tableName].clean();
    }
}

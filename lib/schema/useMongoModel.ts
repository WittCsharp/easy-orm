import { dbApiInterface } from './dbApiInterface';
import { Document, Schema, FilterQuery, Model } from 'mongoose';
import {useMongose, newSchema} from '../mongodb';

export class MongoModelMaster<T extends Document, D> implements dbApiInterface<D> {
    tbName: string;
    mongoKey?: string;
    constructor(tableName: string, schema: Schema, mongoKey?: string) {
        this.tbName = tableName;
        this.mongoKey = mongoKey;  // 对应的client端key
        newSchema<T>(tableName, schema, mongoKey);
    }

    getModel(master?: boolean) : Model<T, {}> {
        return useMongose(this.mongoKey, master).model<T>(this.tbName);
    }
    
    async deleteOne(query: FilterQuery<T>): Promise<D> {
        const result = await useMongose().model<T>(this.tbName).findOneAndDelete(query);
        return result.toObject();
    }

    async findCount(query?: FilterQuery<T>) : Promise<number> {
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

    async findAll(query?: FilterQuery<T>, sort?: any): Promise<D[]> {
        const doc = await useMongose().model<T>(this.tbName).find(query).sort(sort);
        return doc.map(d => d.toObject());
    }

    async findList(options: {
        query?: FilterQuery<T>; 
        page: number; 
        pageSize: number;
        sort?: any;
    }): Promise<D[]> {
        const doc = await useMongose().model<T>(this.tbName).find(options.query)
            .skip(options.pageSize * (options.page - 1))
            .limit(options.pageSize)
            .sort(options.sort);
        return doc.map(d => d.toObject());
    }

    async addOne(data: D): Promise<D> {
        const doc = await useMongose(this.mongoKey, true).model<T>(this.tbName).insertMany([data]);
        return doc[0].toObject();
    }

    async addMany(data: D[]): Promise<D[]> {
        const doc = await useMongose(this.mongoKey, true).model<T>(this.tbName).insertMany(data);
        return doc.map(d => d.toObject());
    }

    async updateById(id: string | number, data: D): Promise<D> {
        const doc = await useMongose(this.mongoKey, true).model<T>(this.tbName).findByIdAndUpdate(id, data);
        return await this.findOneById(doc._id);
    }

    async updateOne(query: FilterQuery<T>, data: D): Promise<D> {
        const doc = await useMongose(this.mongoKey, true).model<T>(this.tbName).findOneAndUpdate(query, data);
        return await this.findOneById(doc._id);
    }

    async updateMany(query: FilterQuery<T>, data: D): Promise<D[]> {
        const doc = await useMongose(this.mongoKey, true).model<T>(this.tbName).updateMany(query, data);
        return await this.findAll({_id: doc.map(d => d._id)});
    }

    async deleteById(id: string): Promise<D> {
        const doc = await useMongose(this.mongoKey, true).model<T>(this.tbName).findByIdAndDelete(id);
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
    return models[tableName];
}

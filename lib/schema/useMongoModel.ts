import { dbApiInterface } from './dbApiInterface';
import { Document, Schema, FilterQuery } from 'mongoose';
import {useMongose, getMongoseMaster, newSchema} from '../mongodb';

export class MongoModelMaster<T extends Document, D> implements dbApiInterface<D> {
    
    tbName: string;
    constructor(tableName: string, schema: Schema) {
        this.tbName = tableName;
        newSchema<T>(tableName, schema);
    }
    
    async deleteOne(query: FilterQuery<T>): Promise<D> {
        const result = await useMongose().model<T>(this.tbName).findOneAndDelete(query);
        return result.toObject();
    }

    async findOneById(id: string | number): Promise<D> {
        const doc = await useMongose().model<T>(this.tbName).findById(id);
        return doc.toObject();
    }

    async findOne(query: FilterQuery<T>): Promise<D> {
        const doc = await useMongose().model<T>(this.tbName).findOne(query);
        return doc.toObject();
    }

    async findAll(query?: FilterQuery<T>): Promise<D[]> {
        const doc = await useMongose().model<T>(this.tbName).find(query);
        return doc.map(d => d.toObject());
    }

    async addOne(data: D): Promise<D> {
        const doc = await getMongoseMaster().model<T>(this.tbName).insertMany([data]);
        return doc[0].toObject();
    }

    async addMany(data: D[]): Promise<D[]> {
        const doc = await getMongoseMaster().model<T>(this.tbName).insertMany(data);
        return doc.map(d => d.toObject());
    }

    async updateById(id: string | number, data: D): Promise<D> {
        const doc = await getMongoseMaster().model<T>(this.tbName).findByIdAndUpdate(id, data);
        return await this.findOneById(doc._id);
    }

    async updateOne(query: FilterQuery<T>, data: D): Promise<D> {
        const doc = await getMongoseMaster().model<T>(this.tbName).findOneAndUpdate(query, data);
        return await this.findOneById(doc._id);
    }

    async updateMany(query: FilterQuery<T>, data: D): Promise<D[]> {
        const doc = await getMongoseMaster().model<T>(this.tbName).updateMany(query, data);
        return await this.findAll({_id: doc.map(d => d._id)});
    }

    async deleteById(id: string): Promise<D> {
        const doc = await getMongoseMaster().model<T>(this.tbName).findByIdAndDelete(id);
        return doc.toObject();
    }
    
}

interface modelInterface {
    [key: string]: MongoModelMaster<any, any>;
}

const models: modelInterface = {};

export function useMongoModel<T extends Document, D>(tableName: string, schema?: Schema) : MongoModelMaster<T, D> {
    if (schema)
        models[tableName] = new MongoModelMaster<T, D>(tableName, schema);
    return models[tableName];
}

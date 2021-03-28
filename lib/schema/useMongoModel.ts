import { dbApiInterface } from './dbApiInterface';
import { Document, Schema, FilterQuery } from 'mongoose';
import {useMongose, getMongoseMaster, newSchema} from '../mongodb';

class MongoModelMaster<T extends Document> implements dbApiInterface<T> {
    tbName: string;
    constructor(tableName: string, schema: Schema) {
        this.tbName = this.tbName;
        newSchema<T>(tableName, schema);
    }
    async deleteOne(query: FilterQuery<T>): Promise<T> {
        return await useMongose().model<T>(this.tbName).findOneAndDelete(query);
    }

    async findOneById(id: string | number): Promise<T> {
        const doc = await useMongose().model<T>(this.tbName).findById(id);
        return doc;
    }

    async findOne(query: FilterQuery<T>): Promise<T> {
        const doc = await useMongose().model<T>(this.tbName).findOne(query);
        return doc;
    }

    async findAll(query?: FilterQuery<T>): Promise<T[]> {
        const doc = await useMongose().model<T>(this.tbName).find(query);
        return doc;
    }

    async add(data: T): Promise<T> {
        const doc = await getMongoseMaster().model<T>(this.tbName).insertMany(data);
        return doc;
    }
    async addMany(data: T[]): Promise<T[]> {
        const doc = await getMongoseMaster().model<T>(this.tbName).insertMany(data);
        return doc;
    }

    async updateById(id: string | number, data: T): Promise<T> {
        return await getMongoseMaster().model<T>(this.tbName).findByIdAndUpdate(id, data);
    }

    async updateOne(query: FilterQuery<T>, data: T): Promise<T> {
        return await getMongoseMaster().model<T>(this.tbName).findOneAndUpdate(query, data);
        
    }
    async updateMany(query: FilterQuery<T>, data: T): Promise<T> {
        return await getMongoseMaster().model<T>(this.tbName).updateMany(query, data);
    }

    async deleteById(id: string): Promise<T> {
        return await getMongoseMaster().model<T>(this.tbName).findByIdAndDelete(id);
    }
    
}

interface modelInterface {
    [key: string]: dbApiInterface<any>;
}

const models: modelInterface = {};

export function useMongoModel<T extends Document>(tableName: string, schema?: Schema) : dbApiInterface<T> {
    if (schema)
        models[tableName] = new MongoModelMaster<T>(tableName, schema);
    return models[tableName];
}

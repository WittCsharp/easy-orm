import { Schema, Document } from "mongoose";
import { useHttp } from "..";
import { closeKnexAll, useKnex } from "../knex";
import { closeMongoAll } from "../mongodb";
import { useMongoModel } from "../schema";
import { stopHttp } from "../server";
import * as supertest from 'supertest';
import { cleanAll as knexCleanAll } from "../schema/useKnexModel";
import { cleanAll as mongoCleanAll } from "../schema/useMongoModel";

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

export let testRequest: supertest.SuperTest<supertest.Test>;

export function useTestHandler(desc: string, fn: jest.EmptyFunction) {
    describe(desc, function() {

        beforeAll(async function() {
            const app = useHttp({
                config: {
                    port: 5000,
                    debug: true
                },
                json: 2,
                mongo: {
                    key: 'mongo',
                    default: true,
                    config: {
                        uri: 'mongodb://admin:123456@127.0.0.1:27017/admin',
                    }
                },
                knex: [{
                    key: 'mysql',
                    default: true,
                    config: {
                        client: 'mysql',
                        connection: {
                            host: '127.0.0.1',
                            user: 'root',
                            password: '12345678',
                            database: 'myapp_test',
                            port: 3306,
                        }
                    }
                },{
                    key: 'pg',
                    default: true,
                    config: {
                        client: 'pg',
                        connection: {
                            host: '127.0.0.1',
                            user: 'postgres',
                            password: '123456',
                            database: 'myapp_test'
                        },
                        searchPath: ['knex', 'public'],
                    }
                }]
            });

            testRequest = supertest(app);

            useMongoModel<IUserDocument, IUser>('user', new Schema({
                name: {type: String},
                age: { type: Number},
            }));

            await useKnex().schema.createTableIfNotExists('user', function(table) {
                table.increments('id').primary();
                table.string('name').notNullable();
            });
        });

        beforeEach(async function() {
            await knexCleanAll();
            await mongoCleanAll();
        });

        describe(desc, fn);

        afterAll(async function() {
            await closeMongoAll();
            await closeKnexAll();
            await stopHttp();
        })
    });
}
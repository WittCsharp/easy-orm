import { Application } from 'express';
import * as supertest from 'supertest';
import { useHttp, useRoute, stopHttp } from '../index';

let app: Application;

describe('server test', () => {
    beforeAll(() => {
        if (app) return;
        app = useHttp({
            config: {
                port: 5000,
                debug: true,
            },
            routes: [
                useRoute({
                    baseUrl: '/test',
                    url: {
                        get: '/:id'
                    },
                    async onGet({params}) {
                        return Object.assign({test: 'test'}, params);
                    },
                    async onPut({query}) {
                        return query;
                    },
                    async onDelete({query}) {
                        return query;
                    },
                    async onPost() {
                        return {test: 'test'};
                    },
                }),
            ]
        });
    });

    describe('route', () => {
        it('get', async () => {
            const response = await supertest(app).get('/test/id').expect(200);
            console.log(response.body);
            expect(response.body.data).toMatchObject({test: 'test', id: 'id'});
        });

        it('put', async () => {
            const response = await supertest(app).put('/test?test=test').expect(200);

            expect(response.body.data).toMatchObject({
                test: 'test'
            });
        });

        it('remove', async () => {
            const response = await supertest(app).delete('/test?id=test').expect(200);

            expect(response.body.data).toMatchObject({
                id: 'test'
            });
        });

        it('post', async () => {
            const response = await supertest(app).post('/test').expect(200);

            expect(response.body.data).toMatchObject({
                test: 'test'
            });
        });
    })

    afterAll(() => {
        stopHttp();
    })
})


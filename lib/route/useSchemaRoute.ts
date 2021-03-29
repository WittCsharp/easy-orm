import { RequestHandler, Router } from "express";
import { MongoModelMaster } from "../schema";
import { useCustomizeRoute } from "./useCustomizeRoute";
import { compact } from 'lodash';

export default function useSchemaRouter({
    baseUrl,
    model,
    before,
    after,
    disable,
} : {
    baseUrl: string;
    model() : MongoModelMaster<any, any>;
    before?: Array<RequestHandler>;
    after?: Array<RequestHandler>;
    disable?: Array<'insert' | 'list' | 'findById' | 'findOne' | 'editeById' | 'deleteById'>;
}) : Router {
    return useCustomizeRoute({
        baseUrl: baseUrl,
        before,
        after,
        handlers: compact([
            // list
            disable.includes('list') ? null : {
                url: '/list',
                async hander({ data }) {
                    return await model().findAll(data);
                },
                method: 'post'
            },
            // findById
            disable.includes('findById') ? null : {
                url: '/:id',
                async hander({ params }) {
                    return await model().findOneById(params.id);
                },
                method: 'get',
            },
            // findOne
            disable.includes('findOne') ? null : {
                url: '/findone',
                method: 'post',
                async hander({data}) {
                    return await model().findOne(data);
                }
            },
            // find by limit
            // editeById,
            disable.includes('editeById') ? null : {
                url: '/:id',
                method: 'put',
                async hander({data, params}) {
                    return await model().updateById(params.id, data);
                }
            },
            // deleteById,
            disable.includes('deleteById') ? null : {
                url: '/:id',
                method: 'delete',
                async hander({ params }) {
                    return await model().deleteById(params.id);
                }
            },
            // insert
            disable.includes('insert') ? null : {
                url: '/insert',
                method: 'post',
                async hander({data}) {
                    if (Array.isArray(data)) {
                        return await model().addMany(data);
                    }
                    return await model().addOne(data);
                }
            }
        ])
    })
}
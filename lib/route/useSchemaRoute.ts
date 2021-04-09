import { RequestHandler, Router } from "express";
import { MongoModelMaster } from "../schema";
import { useCustomizeRoute } from "./useCustomizeRoute";
import { compact } from 'lodash';
import { KnexModelMaster } from "../schema/useKnexModel";

export default function useSchemaRouter({
    baseUrl,
    model,
    before,
    after,
    disable,
} : {
    baseUrl: string;
    model() : MongoModelMaster<any, any> | KnexModelMaster<any>;
    before?: Array<RequestHandler>;
    after?: Array<RequestHandler>;
    disable?: Array<'insert' | 'list' | 'findAll' | 'findById' | 'findOne' | 'editeById' | 'deleteById'>;
}) : Router {
    disable = disable || [];
    return useCustomizeRoute({
        baseUrl: baseUrl,
        before,
        after,
        handlers: compact([
            // list
            disable.includes('list') ? null : {
                url: '/list',
                async hander({ data, query }) {
                    // 获取总数量
                    const total = await model().findCount(data?.query);
                    const {page, pageSize} = query;
                    const list = await model().findList({
                        query: data?.query,
                        page: Number(page),
                        pageSize: Number(pageSize),
                        sort: data?.sort,
                    });
                    return {
                        total, list
                    }
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
            // find all
            disable.includes('findAll') ? null : {
                url: '/findall',
                method: 'post',
                async hander({data}) {
                    return await model().findAll(data?.query, data?.sort);
                }
            },
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
                    const result = await model().addOne(data);
                    return result;
                }
            }
        ])
    })
}
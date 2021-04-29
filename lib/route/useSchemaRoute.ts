import { ErrorRequestHandler, RequestHandler, Router } from "express";
import { MongoModelMaster } from "../schema";
import { IHandlerConfig, useCustomizeRoute } from "./useCustomizeRoute";
import { compact } from 'lodash';
import { KnexModelMaster } from "../schema/useKnexModel";

export default function useSchemaRouter<T>({
    baseUrl,
    model,
    before,
    after,
    disable,
    findOneHandler,
    editeByIdHandler,
    deleteByIdHandler,
    findByIdHandler,
    insertHandler,
    listHandler,
    findAllHandler,
} : {
    baseUrl: string;
    model() : MongoModelMaster<any, any> | KnexModelMaster<any>;
    before?: Array<RequestHandler>;
    after?: Array<RequestHandler | ErrorRequestHandler>;
    disable?: Array<'insert' | 'list' | 'findAll' | 'findById' | 'findOne' | 'editeById' | 'deleteById'>;
    findOneHandler?: IHandlerConfig<T>;
    editeByIdHandler?: IHandlerConfig<T>;
    deleteByIdHandler?: IHandlerConfig<T>;
    findByIdHandler?: IHandlerConfig<T>;
    insertHandler?: IHandlerConfig<T>;
    listHandler?: IHandlerConfig<T>;
    findAllHandler?: IHandlerConfig<T>;
}) : Router {
    disable = disable || [];
    return useCustomizeRoute({
        baseUrl: baseUrl,
        before,
        after,
        handlers: compact([
            // list
            disable.includes('list') ? null : Object.assign({
                url: '/list',
                async hander({ data, query }) {
                    // 获取总数量
                    const total = await model().findCount(data?.query);
                    const {page, pageSize, select} = query;
                    const list = await model().findList({
                        query: data?.query,
                        page: Number(page),
                        pageSize: Number(pageSize),
                        sort: data?.sort,
                        select: select && JSON.parse(select),
                    });
                    return {
                        total, list
                    }
                },
                method: 'post'
            }, listHandler || {}),
            // findById
            disable.includes('findById') ? null : Object.assign({
                url: '/:id',
                async hander({ params, query }) {
                    return await model().findOneById(params.id, query?.select && JSON.parse(query?.select));
                },
                method: 'get',
            }, findByIdHandler || {}),
            // findOne
            disable.includes('findOne') ? null : Object.assign({
                url: '/findone',
                method: 'post',
                async hander({data, query}) {
                    return await model().findOne(data, query?.select && JSON.parse(query?.select));
                }
            }, findOneHandler || {}),
            // find all
            disable.includes('findAll') ? null : Object.assign({
                url: '/findall',
                method: 'post',
                async hander({data, query}) {
                    return await model().findAll(data?.query, data?.sort, query?.select && JSON.parse(query?.select));
                }
            }, findAllHandler || {}),
            // editeById,
            disable.includes('editeById') ? null : Object.assign({
                url: '/:id',
                method: 'put',
                async hander({data, params}) {
                    return await model().updateById(params.id, data);
                }
            }, editeByIdHandler || {}),
            // deleteById,
            disable.includes('deleteById') ? null : Object.assign({
                url: '/:id',
                method: 'delete',
                async hander({ params }) {
                    return await model().deleteById(params.id);
                }
            }, deleteByIdHandler || {}),
            // insert
            disable.includes('insert') ? null : Object.assign({
                url: '/insert',
                method: 'post',
                async hander({data}) {
                    if (Array.isArray(data)) {
                        return await model().addMany(data);
                    }
                    const result = await model().addOne(data);
                    return result;
                }
            }, insertHandler || {})
        ])
    })
}
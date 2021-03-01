'use strict';
import {RequestHandler} from 'express';

// useHook
/**
 * 创建中间件
 * @param func 
 */
export async function useHook(func: ({req, res, data}) => Promise<any>) : Promise<RequestHandler> {
    return async (req, res: any, done) => {
        try {
            const result = await func({
                req, res,
                data: req.body,
            });
            res.result = result;
            done();
        } catch (error) {
            done(error);
        }
    }
}
'use strict';
import {RequestHandler} from 'express';

// useHook
/**
 * 创建中间件
 * @param func 
 */
export function useHook<T, D>(func: ({req, res, data, result}: {data: T; req: any; res: any;result: D}) => Promise<any>) : RequestHandler {
    return async (req, res: any, done) => {
        try {
            const result = await func({
                req, res,
                data: req.body,
                result: res.result,
            });
            if (result)
                res.result = result;
            done();
        } catch (error) {
            done(error);
        }
    }
}

export default useHook;
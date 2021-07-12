'use strict';
import {RequestHandler} from 'express';
import { IThrowError, throwError } from '../route/useCustomizeRoute';

// useHook
/**
 * 创建中间件
 * @param func 
 */
export function useHook<T, D>(func: ({req, res, data, result, throwError}: {data: T; req: any; res: any;result: D, throwError: IThrowError}) => Promise<any> | any) : RequestHandler {
    return async (req, res: any, done) => {
        try {
            const result = await func({
                req, res,
                data: req.body,
                result: res.result,
                throwError: throwError(res),
            });
            if (result)
                res.result = result;
            done();
        } catch (error) {
            if (res.error) {
                return res.status(res.error.status || 200).json({
                    data: res.error.error,
                    status: res.error.status || 200,
                });
            }
            done(error);
        }
    }
}

export default useHook;
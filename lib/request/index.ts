import { CoreOptions } from 'request';
import * as request from 'request-promise';

export async function post(url: string, options: CoreOptions) : Promise<request.RequestPromise> {
    const res = await request.post(url, options);
    return res;
}

export async function get(url: string, options: CoreOptions): Promise<request.RequestPromise> {
    const res = await request.get(url, options);
    return res;
}
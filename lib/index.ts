import * as express from 'express';
import { Application } from 'express';

export class ServerManage {
    app: Application;
    constructor() {
        this.app = express();
    }

    async start() {

    }
}
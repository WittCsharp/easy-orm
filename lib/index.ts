import { Express } from 'express';

export class ServerManage {
    app: Express;
    constructor() {
        this.app = new Express();
    }

    async start() {
        
    }
}
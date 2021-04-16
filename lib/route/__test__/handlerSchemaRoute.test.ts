import { testRequest, useTestHandler } from "../../tests/useTestHandler";
import useSchemaRouter from '../../route/useSchemaRoute';
import { useKnexModel } from "../../schema/useKnexModel";
import useLogger from "../../log4j";
import useHook from "../../hook";

useTestHandler('自定义handler', () => {
    useSchemaRouter({
        baseUrl: '/test/handler',
        model: function() {
            return useKnexModel('user');
        },
        listHandler: {
            hander: () => {
                return 'hello world!!!';
            }
        },
        insertHandler: {
            after: [
                useHook(() => {
                    return 'this is hook';
                }),
            ]
        }
    });

    it('list', async () => {
        const response = await testRequest.post('/test/handler/list');
        useLogger().log(JSON.stringify(response.body));

        expect(response.body.data).toEqual('hello world!!!');
    });

    it('hook', async () => {
        const response = await testRequest.post('/test/handler/insert')
            .set('content-type', 'application/json')
            .send({
                name: 'test',
            });
        
        useLogger().log(JSON.stringify(response.body));

        expect(response.body.data).toEqual('this is hook');
    })
});
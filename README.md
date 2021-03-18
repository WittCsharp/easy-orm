# xeasy-orm
便捷的orm,基于express搭建的简单易用的ORM

## 快速开始

```
npm install --save xeasy-orm
or
yarn add xeasy-orm
```

创建index.ts

```
import { useHttp } from 'xeasy-orm';

const app = useHttp({
    config: {
        port: 3000,
        debug: true,
    }
})
```

> useHttp: 启动express服务
> config为基本配置
> - port： 启动端口号
> - debug：启动日志模式

> useHttp config

属性 | 是否必填 | 数据类型 | 说明
---|---------|----------|------
config | 必填 | object | express基本配置
 --port | 必填 | number | 启动端口号
 --debug | 必填 | boolean | 是否启动debug模式
routes | 非必填 | Array<express.Router> | 需要加载的路由
hooks | 非必填 | object | express中间件
 --befor | 非必填 | Array<express.RequestHandler> | 访问所有api前调用
 --after | 非必填 | Array<express.RequestHandler> | 访问所有api后调用
knex | 非必填 | Array<Knex.Config> or Knex.Config | 创建knex对象，需要安装对应的数据库包

这样我们的服务便启动完成了

### 添加Knex初始化

#### 使用

```
import {useKnex, getKnexMaster} from 'xeasy-orm';

// 读写分离模式的情况下，可以传递数组，数组的第一位为master数据库，用于写入操作
useKnex({
    client: 'mysql',
    connection: {
        host: 'localhost',
        user: 'root',
        password: 'password',
        database: 'app_test',
        port: 3306,
    }
});

// 使用useKnex获取client对象时，会默认逐个使用数据库连接
const userList = await useKnex().table('user').select(*);
// 使用master写入
await getKnexMaster().table('user').install({name: 'name'});
```

#### useKnex 创建knex连接
# easy-orm
便捷的orm

### 功能设定

- 简单的路由生成
- 简单的逻辑配置
- 简单的schema配置

### 第三方库

- express
- knexjs
- redis
- mongoose
- mysql

## 重点

### 路由规则制定

1. 路由入参 （涉及数据格式以及传递类型，采用resfulAPI风格， get、post、patch、delete）
2. 中间件过滤（设置中间件，采用ts格式配置路由格式以及入参和需要过滤的前后中间件）

### 授权机制 （中间件/微服务）

1. 自有机制 token （配置用户名密码字段，加密方式等，表名）
2. 第三方登录 钉钉、微信、支付宝等
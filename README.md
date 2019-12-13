JavaScript and TypeScript clients for SignalR for ASP.NET Core

# @aspnet/signalr for wechat miniprogram

> **copy from @aspnet/signalr**

**注意,当前版本还不算稳定,毕竟刚做出来,如果要重写 Transport,建议 fork 代码库自行修改.或完全按照官方原生方式使用**

> 目前已经这个库已经算一个初步稳定的版本, 不过还请遵循 @aspnet/signalr 原版api 使用.
> 这份文档 2019年12月13日 23:08:31 整理了下, 只保留跟原版 @aspnet/signalr 差异供参考.

#### version
- 2019年12月13日 23:03:01
 1. 公司用的 `signalr-for-wx` 的小程序交互的小程序已经进入测试了, 开发阶段使用没出过什么问题,文档参考原版就行.
 2. `IHttpConnectionOptions.ts` 增加可选参数 `socketUrlFactory` 用来解决后端修改 `access_token` 字段的情况. 
 
- 2019年12月9日 16:39:33 (有改动)
 1. 因为这个库超过了100kb,导致直接在小程序项目中 `require("signalr-for-wx")` 在真机运行时,报 `signalr-for-wx is not defined.` 错误。
 原因是因为

- 2019 年 12 月 6 日 13:26:01
  今天改了下 bug,然后修改了原生实现自定义 `Transport` 方法,
  目前,实现自定义 `Transport` 需要继承对应的 Transport class,或者 实现对应的 `[WxSocket|LongPolling]TransportOptions]`
  还有就是,修改了 `Transport` 构造函数,将原有的传入多参数封装成为 `options`,可以引用自定义实现的 options 来创建传输实例了.

### library

> 原始项目地址 [@aspnet/signalr](https://github.com/aspnet/SignalR#readme)

### notes

> 基于@aspnet/signalr ts client 源码实现,操作方式参考`@aspnet/signalr`

> 代码改动还不完善 有 bug 的话,github 上帮忙提下 issue [issues link](https://github.com/a951055/signalr-for-wx/issues)

> 自己编译的话,执行 `yarn build:wx` 即可.

### 变更内容

1.  引入 微信 ts library [./typings/\*\*](/typings),修改了编译指向为 `./src/**/*.ts`
2.  将 引用 parent project 的 配置项,引入项目内,直接使用。
3.  关闭了一些 tslint 检测,同时删除了原有的编译 esm,cjs ... 编译命令,引入新的 `build:wx` 命令
4.  引入了封装了的 `wx-request` 请求库, 参考 axios 官方示例 (github)[https://github.com/axios/axios]
5.  (core) 注意,重写的主要内容包含两块, **1. 删除原有的 HttpClient 实现,引入 wx-request**, **2. 删除原有 WebSocket 及 socket 事件绑定,修改为微信支持的 wx.connectSocket() 方法**
6.  (remove) 删除了 项目中兼容 node,browser 的文件,方法. 如:`browser-index.ts` 和 `Buffer` 对象兼容
7.  加上了**山寨版**的中文注释
8.  重写后的 about() 方法支持的不太完善.因为不清楚 wx.requestTask 运行机制,仅能在`请求前`,`获得响应后`,`headers变化时`,判断是否需要中断请求
9. (2019年12月13日 23:09:18 新增) 增加 `socketUrlFactory()` 参数, 用来解决后端修改 `access_token` 字段的情况.

### path manifest

┌\n
├ [./wx](./wx) 修改后的源码路径\n
├ ─ [./wx/wx-request](./wx/wx-request) 封装微信请求库\n
├ \n
├ [./library](./library) 微信小程序 lib.d.ts\n
├ [./src](./src) 原始源码路径, 但是现在没法编译了,因为改写了 tsrootpath.\n
├ [./dist](./dist) 编译后的 js 包, es 版本, 没其他的\n
├ [./typings](./typings) 导出的 ts .d.ts\n
└

## 使用

1. install `yarn add signalr-for-wx`
2. 执行小程序 npm 包 编译
3. use | 参考官方文档

### Example (use for wechat miniprogram)

> 官方API
 1. (yarn libiary)[https://yarnpkg.com/en/package/@aspnet/signalr]
 2. (github)[https://github.com/SignalR/SignalR]

> 修改后差异使用示例
```
this.socket = new signalr.HubConnectionBuilder()
      .configureLogging(1)
      .withUrl(`${config.baseUrl}/socket`, {
        logger, // 自定义Ilogger [遵循官方即可]
        request, // 可选, 替换默认请求库
        socketUrlFactory: async url => {
          // 注意: 差异部分, 用于替换原有 accessTokenFactory() 在 后端修改 access_token 参数情况下,替换socket链接url使用.
          return url;
        }
      })
      .build();
```
> 自定义 request

1. 参数请参考 axios 官方示例 (github)[https://github.com/axios/axios]

```
// 改写 axios 实现
export const request = new signalr.Request(
  {
    baseUrl: ``,
    timeout: 60 * 1000,
    headers: { tenantId: config.abpTenantId, "content-type": "application/json" },
    transformRequest: [],
    transformResponse: [],
    responseType: signalr.ResponseType.JSON,
    method: signalr.RequestMethod.GET
  }, 
  new Ilogger() // logger 接口实现,可不传
);

```
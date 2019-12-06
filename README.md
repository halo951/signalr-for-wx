JavaScript and TypeScript clients for SignalR for ASP.NET Core

# @aspnet/signalr for wechat miniprogram

> **copy from @aspnet/signalr**

#### version

- 2019 年 12 月 6 日 13:26:01
  今天改了下 bug,然后修改了原生实现自定义 `Transport` 方法,
  目前,实现自定义 `Transport` 需要继承对应的 Transport class,或者 实现对应的 `[WxSocket|LongPolling]TransportOptions`
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
4.  引入了封装了的 `wx-request` 请求库,参考`axios`
5.  (core) 注意,重写的主要内容包含两块, **1. 删除原有的 HttpClient 实现,引入 wx-request**, **2. 删除原有 WebSocket 及 socket 事件绑定,修改为微信支持的 wx.connectSocket() 方法**
6.  (remove) 删除了 项目中兼容 node,browser 的文件,方法. 如:`browser-index.ts` 和 `Buffer` 对象兼容
7.  加上了**山寨版**的中文注释
8.  重写后的 about() 方法支持的不太完善.因为不清楚 wx.requestTask 运行机制,仅能在`请求前`,`获得响应后`,`headers变化时`,判断是否需要中断请求

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
3. use | 参考下方使用示例

### Example (use for wechat miniprogram)

```
// import signalr
import SignalR from "signalr-for-wx";

 // 实际使用按照 signalR官方参数使用就行,逻辑没动,就改了 socket,request 实现方式
let connection = new signalR.HubConnectionBuilder().withUrl("http://192.168.123.155:21021/signalr-answer").build();
connection.on("CallBack", function(data) {
    console.log(data);
});
connection.start().then(function() {
    connection.invoke("Sayhello").then(function(data) {
      console.log(data);
  });
});

// connect socket
connection.start().then(()=>{
    // connected
}).catch(res=>{
    // connect fail.
    console.error(res); // print error msg.
});

// 后端修改默认 accessToken 示例

  this.socket = new signalr.HubConnectionBuilder()
      .configureLogging(1)
      .withUrl(`${config.baseUrl}signalr`, {
        // 这里放弃 accessTokenFactory(), 直接手工改写url
        socketUrlFactory: async url => {
          const code = await this.wechatLogin();
          vlogger.info(`[getted code]:${code}`);
          const { accessToken, encryptedAccessToken } = await this.generateAccessToken(code);
          // 同步更新 request header token.
          request.config.headers["Authorization"] = `Bearer ${accessToken}`;
          // 参考 signalr原生参数附加方式
          url += 0 > url.indexOf("?") ? "?" : "&" + `enc_access_token=${encodeURIComponent(encryptedAccessToken)}`;
          return url;
        }
      })
      .build();

// 注意: message event 第一个参数是事件名,且必须是 string 类型, 否则抛出异常(第三个errMsg参数)

// bind message event
connection.on("message event", data => {
    // TODO handle callback
});

/**
 * invoke send message api
 * @params {string} method | 调用方法
 * @params {any} data | 消息数据
 * @params {InvokeOptions} options | 调用选项
 * @returns Promise<ResponseMesage>
 *
 * @description 重写了原有的 invoke 方法
 * - 在原有方法基础上 使用 array 实现队列推送
 * - 连接成功前调用的 invoke,以及 连接中断后的 invoke 将在队列中等待,下次连接成功时,
 * - 禁用此项需要
 */
connection.invoke(method,data).then(res=>{
    // send success
    console.log(res); // print response data.
}).catch(res => {
    // send fail.
    console.error(res); // print error msg.
})
```

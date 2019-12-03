// 版权所有（c）.NET基金会。保留所有权利。

// 在2.0版Apache许可下授权。有关许可证信息，请参见项目根目录中的License.txt。

// 版本号模板 - builder 自动更新,无需手动
/** The version of the SignalR client. */
export const VERSION: string = "0.0.0-DEV_BUILD";

// singlr 基类
export { AbortSignal } from "./AbortController";
// 协议|类型参数 导出
export {
  MessageType,
  MessageHeaders,
  HubMessage,
  HubMessageBase,
  HubInvocationMessage,
  InvocationMessage,
  StreamInvocationMessage,
  StreamItemMessage,
  CompletionMessage,
  PingMessage,
  CloseMessage,
  CancelInvocationMessage,
  IHubProtocol
} from "./IHubProtocol";
// json格式传输协议
export { JsonHubProtocol } from "./JsonHubProtocol";

export { HubConnectionBuilder } from "./HubConnectionBuilder";
export { HubConnection, HubConnectionState } from "./HubConnection";

// 微信最低版本支持检查
export { isVersionSupport } from "./WechatVersionDiff";
// 微信socket传输实现
export { WxSocketTransport } from "./WxSocketTransport";

// 微信 request 请求实现(封装 wx.request)
export { Request } from "./wx-request/index";
export { RequestConfig, RequestMethod, RequestOption, ResponseOptions, ResponseType } from "./wx-request/model";

// Error 接口
export { AbortError, HttpError, TimeoutError } from "./Errors";
// logger 接口
export { ILogger, LogLevel } from "./ILogger";
// Transport 接口
export { HttpTransportType, TransferFormat, ITransport } from "./ITransport";
// 流接口
export { IStreamSubscriber, IStreamResult, ISubscription } from "./Stream";
// 链接实现接口
export { IHttpConnectionOptions } from "./IHttpConnectionOptions";
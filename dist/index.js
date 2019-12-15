// 版权所有（c）.NET基金会。保留所有权利。
// 在2.0版Apache许可下授权。有关许可证信息，请参见项目根目录中的License.txt。
// 版本号模板 - builder 自动更新,无需手动
/** The version of the SignalR client. */
export var VERSION = "1.0.9";
// 协议|类型参数 导出
export { MessageType } from "./IHubProtocol";
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
export { RequestMethod, ResponseType } from "./wx-request/model";
// Error 接口
export { AbortError, HttpError, TimeoutError } from "./Errors";
// logger 接口
export { LogLevel } from "./ILogger";
// Transport 接口
export { HttpTransportType, TransferFormat } from "./ITransport";

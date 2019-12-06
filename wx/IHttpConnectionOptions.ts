// 版权所有（c）.NET基金会。保留所有权利。
// 在2.0版Apache许可下授权。有关许可证信息，请参见项目根目录中的License.txt。

import { ILogger, LogLevel } from "./ILogger";
import { HttpTransportType, ITransport } from "./ITransport";
import { Request } from "./wx-request/index";
import { WxSocketTransport } from "./WxSocketTransport";
import { LongPollingTransport } from './LongPollingTransport';

/**
 * Options provided to the 'withUrl' method on {@link @aspnet/signalr.HubConnectionBuilder} to configure options for the HTTP-based transports.
 *
 * 为 {@link @aspnet/signalr.HubConnectionBuilder}上的“withUrl”方法提供的选项，用于配置基于HTTP的传输的选项。
 */
export interface IHttpConnectionOptions {
  /**
   * An {@link @aspnet/signalr.HttpClient} that will be used to make HTTP requests.
   *
   * ! 此处重写, 修改为 封装过的 wx-request 请求库
   *
   */
  request?: Request;

  /**
   * An {@link @aspnet/signalr.HttpTransportType} value specifying the transport to use for the connection.
   * 指定特定的HTTP传输类型 | 或者自己实现传输对象
   * @description 如果不使用默认的话,需要实现 `ITransport` 接口
   */
  transport?: HttpTransportType | ITransport;

  /**
   * Configures the logger used for logging.
   * 配置或者实现logger
   * Provide an {@link @aspnet/signalr.ILogger} instance, and log messages will be logged via that instance. Alternatively, provide a value from
   * the {@link @aspnet/signalr.LogLevel} enumeration and a default logger which logs to the Console will be configured to log messages of the specified
   * level (or higher).
   * @description 如果不使用默认的话,需要实现 `ILogger` 接口
   */
  logger?: ILogger | LogLevel;

  /**
   * A function that provides an access token required for HTTP Bearer authentication.
   * 实现一个提供http身份验证的工厂函数
   * @returns {string | Promise<string>} A string containing the access token, or a Promise that resolves to a string containing the access token.
   */
  accessTokenFactory?(): string | Promise<string>;

  /**
   * socket url 替换 (当accessTokenFactory 满足不了需求情况下使用这个)
   * @returns {string | Promise<string> | undefined} 当返回string|Promise<string> 将替换 连接url 
   * @memberof IHttpConnectionOptions
   */
  socketUrlFactory?(url: string): string | Promise<string> | undefined;

  /**
   * A boolean indicating if message content should be logged.
   * 是否记录消息内容
   *
   * Message content can contain sensitive user data, so this is disabled by default.
   */
  logMessageContent?: boolean;

  /**
   * A boolean indicating if negotiation should be skipped.
   * 指示是否应跳过协商
   * Negotiation can only be skipped when the {@link @aspnet/signalr.IHttpConnectionOptions.transport} property is set to 'HttpTransportType.WebSockets'.
   * -fy : 指示是否应跳过协商。只有当{@link@aspnet/signaler.IHttpConnectionOptions.transport}属性设置为“HttpTransportType.WebSockets”时，才能跳过协商。
   */
  skipNegotiation?: boolean;
  /**
   * 微信socket 自定义实现接口
   * @description 需要继承 WxSocketTransport 然后,传入 class
   * @type {WxSocketTransport}
   * @memberof IHttpConnectionOptions
   */
  WxSocket?: WxSocketTransport | any;
  /**
   * 长轮询自定义实现接口
   *
   * @description 需要继承 LongPollingTransport 然后,传入 class
   * @type {LongPollingTransport}
   * @memberof IHttpConnectionOptions
   */
  LongPolling?: LongPollingTransport | any;
  /**
   * ! 自定义解析url方法,用于兼容 signalr 默认使用 <a href> 解析非全路径问题
   */
  resolveUrl?: (url: string) => string;
}

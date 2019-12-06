import { ILogger } from "./ILogger";
import { Request } from "./wx-request";

// 版权所有（c）.NET基金会。保留所有权利。
// 在2.0版Apache许可下授权。有关许可证信息，请参见项目根目录中的License.txt。

//这在将来会被当作一个位标志，所以我们使用两个值的幂来保持它。
/**指定特定的HTTP传输类型。*/
export enum HttpTransportType {
  /**未指定传输首选项。*/
  None = 0,
  /**指定WebSocket传输。*/
  WebSockets = 1,
  /**指定长轮询传输。*/
  LongPolling = 4
}

/**指定连接的传输格式。*/
export enum TransferFormat {
  /**指定仅通过连接传输文本数据。*/
  Text = 1,
  /**指定将通过连接传输二进制数据。*/
  Binary = 2
}
export interface ConnectOptions extends WechatMiniprogram.ConnectSocketOption {
  transferFormat?: TransferFormat;
}

/**对传输行为的抽象。这是为了支持框架而设计的，而不是供应用程序使用。*/
export interface ITransport {
  /**
   * 创建链接
   * @param url
   * @param transferFormat
   */
  connect(options: ConnectOptions): Promise<WechatMiniprogram.GeneralCallbackResult>;
  /**
   * 发送数据
   * @param data
   */
  send(data: any): Promise<void>;
  /**
   * 停止(断开连接?)
   */
  stop(): Promise<WechatMiniprogram.GeneralCallbackResult>;
  /**
   * 接收消息
   */
  onreceive: ((data: string | ArrayBuffer) => void) | null;
  /**
   * 关闭行为
   */
  onclose: ((error?: Error) => void) | null;
}


/**
 * 微信socket实例化参数
 */
export interface WxSocketTransportOptions {
  // token 工厂
  accessTokenFactory: (() => string | Promise<string>) | undefined;
  // socket url 替换 (当accessTokenFactory 满足不了需求情况下使用这个)
  socketUrlFactory: ((url: string) => string | Promise<string> | undefined) | undefined;
  // logger
  logger: ILogger;
  logMessageContent: boolean;
  /** 是否允许替换socket连接
   *
   * 小程序 版本 < 1.7.0 时, 最多允许存在一个socket连接, 此参数用于是否允许在这个情况下,替换这个打开的socket
   */
  allowReplaceSocket?: boolean;
  /** 是否启用消息队列缓存连接建立前消息,并在建立连接后发送 */
  enableMessageQueue?: boolean;
  /** 建立连接超时时间 - (默认 60s) */
  timeout?: number;
  /** 监听等待时间 */
  delayTime?: number;
  /** 重连设置 */
  reconnect?: {
    enable?: boolean; // 是否启用
    max?: number; // 最大重连次数
  };
}
/**
 * 长轮询 实例化参数
 *
 * @export
 * @interface LongPollingTransportOptions
 */
export interface LongPollingTransportOptions {
  request?: Request;
  accessTokenFactory: (() => string | Promise<string>) | undefined;
  logger: ILogger;
  logMessageContent: boolean;
}
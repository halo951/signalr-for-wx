// 版权所有（c）.NET基金会。保留所有权利。
// 在2.0版Apache许可下授权。有关许可证信息，请参见项目根目录中的License.txt。

import { TransferFormat } from "./ITransport";
import { EventNotFoundError } from "./Errors";

/**
 *
 * 连接基类
 *
 * @private
 * @export
 * @interface IConnection
 */
export interface IConnection {
  /**
   * 特征
   *
   * @type {*}
   * @memberof IConnection
   */
  readonly features: any;
  /**
   * 建立连接方法
   *
   * @param {TransferFormat} transferFormat 预处理
   * @returns {Promise<void>}
   * @memberof IConnection
   */
  start(transferFormat: TransferFormat): Promise<void>;
  /**
   * send message
   *
   * @param {(string | ArrayBuffer)} data
   * @returns {Promise<void>}
   * @memberof IConnection
   */
  send(data: string | ArrayBuffer): Promise<void>;
  /**
   * 断开连接
   *
   * @param {Error} [error]
   * @returns {Promise<void>}
   * @memberof IConnection
   */
  stop(error?: Error | WechatMiniprogram.GeneralCallbackResult): Promise<void>;
  /**
   * 收到消息回调
   *
   * @memberof IConnection
   */
  onreceive: ((data: string | ArrayBuffer) => void) | null;
  /**
   * 关闭回调
   *
   * @memberof IConnection
   */
  onclose: ((error?: Error) => void) | null;
  /**
   * 消息事件未定义回调
   */
  onEventNotFound?: ((error?: EventNotFoundError) => boolean | void) | null;
}

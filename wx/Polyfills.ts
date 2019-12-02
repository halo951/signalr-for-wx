// 版权所有（c）.NET基金会。保留所有权利。
// 在2.0版Apache许可下授权。有关许可证信息，请参见项目根目录中的License.txt
import * as EventSource from "eventsource";

// Not exported from index
/**
 * event source 接口
 *
 * @export
 * @interface EventSourceConstructor
 */
export interface EventSourceConstructor {
  new (url: string, eventSourceInitDict?: EventSource.EventSourceInitDict): EventSource;
}

/**
 * 小程序socket连接状态[枚举]
 */
export enum WxSocketReadyState {
  CONNECTING = 0,
  OPEN = 1,
  CLOSING = 2,
  CLOSED = 3
}

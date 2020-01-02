import { InvocationMessage } from "./IHubProtocol";

// 版权所有（c）.NET基金会。保留所有权利。
// 在2.0版Apache许可下授权。有关许可证信息，请参见项目根目录中的License.txt。

/**
 * Error thrown when an HTTP request fails.
 * HTTP请求失败时引发错误。
 */
export class HttpError extends Error {
  // @ts-ignore: Intentionally unused.
  // tslint:disable-next-line:variable-name
  private __proto__: Error;

  /** The HTTP status code represented by this error. */
  public statusCode: number;

  /** Constructs a new instance of {@link @aspnet/signalr.HttpError}.
   *
   * @param {string} errorMessage A descriptive error message.
   * @param {number} statusCode The HTTP status code represented by this error.
   */
  constructor(errorMessage: string, statusCode: number) {
    const trueProto = new.target.prototype;
    super(errorMessage);
    this.statusCode = statusCode;

    // Workaround issue in Typescript compiler
    // https://github.com/Microsoft/TypeScript/issues/13965#issuecomment-278570200
    this.__proto__ = trueProto;
  }
}

/**
 * Error thrown when a timeout elapses.
 * 超时错误
 */
export class TimeoutError extends Error {
  // @ts-ignore: Intentionally unused.
  // tslint:disable-next-line:variable-name
  private __proto__: Error;

  /** Constructs a new instance of {@link @aspnet/signalr.TimeoutError}.
   *
   * @param {string} errorMessage A descriptive error message.
   */
  constructor(errorMessage: string = "A timeout occurred.") {
    const trueProto = new.target.prototype;
    super(errorMessage);

    // Workaround issue in Typescript compiler
    // https://github.com/Microsoft/TypeScript/issues/13965#issuecomment-278570200
    this.__proto__ = trueProto;
  }
}

/**
 * Error thrown when an action is aborted.
 * 连接错误
 */
export class AbortError extends Error {
  // @ts-ignore: Intentionally unused.
  // tslint:disable-next-line:variable-name
  private __proto__: Error;

  /** Constructs a new instance of {@link AbortError}.
   *
   * @param {string} errorMessage A descriptive error message.
   */
  constructor(errorMessage: string = "An abort occurred.") {
    const trueProto = new.target.prototype;
    super(errorMessage);

    // Workaround issue in Typescript compiler
    // https://github.com/Microsoft/TypeScript/issues/13965#issuecomment-278570200
    this.__proto__ = trueProto;
  }
}
/**
 * Error thrown when message event is not found.
 * 事件未定义
 */
export class EventNotFoundError extends Error {
  // @ts-ignore: Intentionally unused.
  // tslint:disable-next-line:variable-name
  private __proto__: Error;

  methodName: string;
  invocationMessage: InvocationMessage;

  /** Constructs a new instance of {@link AbortError}.
   *
   * @param {string} errorMessage A descriptive error message.
   */
  constructor(invocationMessage: InvocationMessage, errorMessage: string = "message event not found.") {
    const trueProto = new.target.prototype;
    super(errorMessage);
    this.methodName = invocationMessage.target;
    this.invocationMessage = invocationMessage;
    // Workaround issue in Typescript compiler
    // https://github.com/Microsoft/TypeScript/issues/13965#issuecomment-278570200
    this.__proto__ = trueProto;
  }
}

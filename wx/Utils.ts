// 版权所有（c）.NET基金会。保留所有权利。
// 在2.0版Apache许可下授权。有关许可证信息，请参见项目根目录中的License.txt。

import { Request } from "./wx-request/index";
import { ILogger, LogLevel } from "./ILogger";
import { NullLogger } from "./Loggers";
import { IStreamResult, IStreamSubscriber, ISubscription } from "./Stream";
import { ResponseType } from "./wx-request/model/ResponseType";

/**
 * 参数处理方法
 *  @private
 */
export class Arg {
  /**
   * 是否存在
   *
   * @static
   * @param {*} val
   * @param {string} name
   * @memberof Arg
   */
  public static isRequired(val: any, name: string): void {
    if (val === null || val === undefined) {
      throw new Error(`The '${name}' argument is required.`);
    }
  }
  /**
   * 是否包含
   *
   * @static
   * @param {*} val
   * @param {*} values
   * @param {string} name
   * @memberof Arg
   */
  public static isIn(val: any, values: any, name: string): void {
    // TypeScript enums have keys for **both** the name and the value of each enum member on the type itself.
    if (!(val in values)) {
      throw new Error(`Unknown ${name} value: ${val}.`);
    }
  }
  /**
   * 验证url是否被微信支持
   */
  public static validationUrlIsSupportByWechat(url) {
    if (!url) {
      throw new Error(`Url is undefined.`);
    } else if (!/^(ws|wws):\/\//.test(url)) {
      if (/^http/.test(url)) {
        return url.replace(/^http/, "wx");
      }
      throw new Error(`error: instantiation [url](${url}) not supported by wechat miniprogram.`);
    } else {
      return url;
    }
  }
}

/**
 * 获取data details
 * @param data origin data
 * @param includeContent 是否导出上下文?
 */
export function getDataDetail(data: any, includeContent: boolean): string {
  let detail = "";
  if (isArrayBuffer(data)) {
    detail = `Binary data of length ${data.byteLength}`;
    if (includeContent) {
      detail += `. Content: '${formatArrayBuffer(data)}'`;
    }
  } else if (typeof data === "string") {
    detail = `String data of length ${data.length}`;
    if (includeContent) {
      detail += `. Content: '${data}'`;
    }
  }
  return detail;
}

/**
 * 格式化 array buffer
 * @private
 */
export function formatArrayBuffer(data: ArrayBuffer): string {
  const view = new Uint8Array(data);

  // Uint8Array.map only supports returning another Uint8Array?
  let str = "";
  view.forEach(num => {
    const pad = num < 16 ? "0" : "";
    str += `0x${pad}${num.toString(16)} `;
  });

  // Trim of trailing space.
  return str.substr(0, str.length - 1);
}

// Also in signalr-protocol-msgpack/Utils.ts
/**
 * 判断是不是 ArrayBuffer
 * @private
 */
export function isArrayBuffer(val: any): val is ArrayBuffer {
  return (
    val &&
    typeof ArrayBuffer !== "undefined" &&
    (val instanceof ArrayBuffer ||
      // Sometimes we get an ArrayBuffer that doesn't satisfy instanceof
      (val.constructor && val.constructor.name === "ArrayBuffer"))
  );
}

/**
 * 发送消息
 * @param logger 日志工具
 * @param transportName
 * @param request  - 注: 原版代码为 httpClient,这里使用 wx-request.
 * @param url
 * @param accessTokenFactory
 * @param content
 * @param logMessageContent
 */
export async function sendMessage(
  logger: ILogger,
  transportName: string,
  request: Request,
  url: string,
  accessTokenFactory: (() => string | Promise<string>) | undefined,
  content: string | ArrayBuffer,
  logMessageContent: boolean
): Promise<void> {
  let headers;

  if (accessTokenFactory) {
    const token = await accessTokenFactory();
    if (token) {
      headers = {
        ["Authorization"]: `Bearer ${token}`
      };
    }
  }

  logger.log(
    LogLevel.Trace,
    `(${transportName} transport) sending data. ${getDataDetail(content, logMessageContent)}.`
  );
  // ! 这里修改为 wx-request ResponseType
  const responseType: ResponseType = isArrayBuffer(content) ? ResponseType.ARRAY_BUFFER : ResponseType.TEXT;
  const response = await request.post(url, content, {
    headers,
    responseType: responseType
  });
  logger.log(LogLevel.Trace, `(${transportName} transport) request complete. Response status: ${response.statusCode}.`);
}

/**
 * 创建一个 logger
 * @private
 */
export function createLogger(logger?: ILogger | LogLevel) {
  if (logger === undefined) {
    return new ConsoleLogger(LogLevel.Information);
  }

  if (logger === null) {
    return NullLogger.instance;
  }

  if ((logger as ILogger).log) {
    return logger as ILogger;
  }

  return new ConsoleLogger(logger as LogLevel);
}

/**
 * 订阅接口实现
 * @private
 */
export class Subject<T> implements IStreamResult<T> {
  public observers: Array<IStreamSubscriber<T>>;
  public cancelCallback: () => Promise<void>;

  constructor(cancelCallback: () => Promise<void>) {
    this.observers = [];
    this.cancelCallback = cancelCallback;
  }

  public next(item: T): void {
    for (const observer of this.observers) {
      observer.next(item);
    }
  }

  public error(err: any): void {
    for (const observer of this.observers) {
      if (observer.error) {
        observer.error(err);
      }
    }
  }

  public complete(): void {
    for (const observer of this.observers) {
      if (observer.complete) {
        observer.complete();
      }
    }
  }

  public subscribe(observer: IStreamSubscriber<T>): ISubscription<T> {
    this.observers.push(observer);
    return new SubjectSubscription(this, observer);
  }
}

/**
 * 主题订阅??
 * 应该时定制 断开流 的 实现吧.
 * @private
 */
export class SubjectSubscription<T> implements ISubscription<T> {
  private subject: Subject<T>;
  private observer: IStreamSubscriber<T>;

  constructor(subject: Subject<T>, observer: IStreamSubscriber<T>) {
    this.subject = subject;
    this.observer = observer;
  }

  public dispose(): void {
    const index: number = this.subject.observers.indexOf(this.observer);
    if (index > -1) {
      this.subject.observers.splice(index, 1);
    }

    if (this.subject.observers.length === 0) {
      this.subject.cancelCallback().catch(_ => { });
    }
  }
}

/**
 * console logger 内置实现
 * @private
 */
export class ConsoleLogger implements ILogger {
  /**
   * 日志打印等级
   *
   * @private
   * @type {LogLevel}
   * @memberof ConsoleLogger
   */
  private readonly minimumLogLevel: LogLevel;
  /**
   * 构造方法 定义 最小输出日志等级
   * @param {LogLevel} minimumLogLevel
   * @memberof ConsoleLogger
   */
  constructor(minimumLogLevel: LogLevel) {
    this.minimumLogLevel = minimumLogLevel;
  }

  /**
   * 日志输出
   *
   * @param {LogLevel} logLevel
   * @param {string} message
   * @memberof ConsoleLogger
   */
  public log(...msg: LogLevel | any): void {
    let logLevel = LogLevel.Information;
    for (let ll of (arguments as any)) {
      if (Object.values(LogLevel).indexOf(ll) != -1) {
        logLevel = ll;
        break;
      }
    }
    if (logLevel >= this.minimumLogLevel) {
      switch (logLevel) {
        case LogLevel.Critical:
        case LogLevel.Error:
          console.error(`[${new Date().toISOString()}] ${LogLevel[logLevel]} =>`, ...msg.slice(1, msg.length));
          break;
        case LogLevel.Warning:
          console.warn(`[${new Date().toISOString()}] ${LogLevel[logLevel]} =>`, ...msg);
          break;
        case LogLevel.Information:
          console.info(`[${new Date().toISOString()}] ${LogLevel[logLevel]} =>`, ...msg);
          break;
        default:
          // console.debug only goes to attached debuggers in Node, so we use console.log for Trace and Debug
          console.log(`[${new Date().toISOString()}] ${LogLevel[logLevel]} =>`, ...msg);
          break;
      }
    }
  }
}

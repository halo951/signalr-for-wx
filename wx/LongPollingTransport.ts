// 版权所有（c）.NET基金会。保留所有权利。
// 在2.0版Apache许可下授权。有关许可证信息，请参见项目根目录中的License.txt。

import { AbortController } from "./AbortController";
import { HttpError, TimeoutError } from "./Errors";
import { ILogger, LogLevel } from "./ILogger";
import { ITransport, TransferFormat, ConnectOptions } from "./ITransport";
import { Arg, getDataDetail, sendMessage } from "./Utils";
import { Request } from "./wx-request/index";
import { ResponseType } from "./wx-request/model/ResponseType";
import { RequestOption } from "./wx-request/model/RequestOption";

// Not exported from 'index', this type is internal.
/**
 * 长轮询
 * @private
 */
export class LongPollingTransport implements ITransport {
  /**
   * http 请求库, 这里使用 封装微信 wx.request 实现
   * @private
   * @old-code | private readonly httpClient: HttpClient;
   * @type {Request}
   * @memberof LongPollingTransport
   */
  private readonly request: Request;

  private readonly accessTokenFactory: (() => string | Promise<string>) | undefined;
  private readonly logger: ILogger;
  private readonly logMessageContent: boolean;
  private readonly pollAbort: AbortController;

  private url?: string;
  private running: boolean;
  private receiving?: Promise<void>;
  private closeError?: Error;

  public onreceive: ((data: string | ArrayBuffer) => void) | null;
  public onclose: ((error?: Error) => void) | null;

  // This is an internal type, not exported from 'index' so this is really just internal.
  public get pollAborted() {
    return this.pollAbort.aborted;
  }
  /**
   * 导出 request 工具
   * @param {Request} request
   * @param {((() => string | Promise<string>) | undefined)} accessTokenFactory access-token-factory
   * @param {ILogger} logger
   * @param {boolean} logMessageContent
   * @memberof LongPollingTransport
   */
  constructor(
    request: Request,
    accessTokenFactory: (() => string | Promise<string>) | undefined,
    logger: ILogger,
    logMessageContent: boolean
  ) {
    this.request = request; // ! rewrite lint
    this.accessTokenFactory = accessTokenFactory;
    this.logger = logger;
    this.pollAbort = new AbortController();
    this.logMessageContent = logMessageContent;
    this.running = false;
    this.onreceive = null;
    this.onclose = null;
  }
  /**
   * 连接 - 这里理解为请求
   *
   * @param {string} url
   * @param {TransferFormat} transferFormat
   * @returns {Promise<void>}
   * @memberof LongPollingTransport
   */

  public async connect(options: ConnectOptions): Promise<WechatMiniprogram.GeneralCallbackResult> {
    /* 验证参数完整性,不完整抛出异常 */
    Arg.isRequired(options, "options");
    Arg.isRequired(options.transferFormat, "transferFormat");
    Arg.isIn(options.transferFormat, TransferFormat, "transferFormat");

    // update options
    this.url = options.url;
    // print log
    this.logger.log(LogLevel.Trace, "(LongPolling transport) Connecting.");

    // ! 这处检查将忽略掉,微信支持 ArrayBuffer

    const pollOptions: RequestOption = {
      config: {
        // 中断信号
        about: this.pollAbort.signal.aborted,
        timeout: 120 * 1000 // 超时时间 2 min
      },
      // origin header 头
      headers: {}
    };

    if (options.transferFormat === TransferFormat.Binary) {
      pollOptions.responseType = ResponseType.ARRAY_BUFFER;
    }

    const token = await this.getAccessToken();

    this.updateHeaderToken(pollOptions, token);

    // Make initial long polling request
    // Server uses first long polling request to finish initializing connection and it returns without data
    //发出初始长轮询请求
    //服务器使用第一个长轮询请求完成连接初始化，它返回时不带数据
    this.logger.log(LogLevel.Trace, `(LongPolling transport) polling: [url]${this.url}`);
    // ! 这里重写了请求逻辑 因为wx.request 不在url中 附加 参数,参数合并交由wx处理
    const response = await this.request.get(
      this.url,
      {
        _: Date.now()
      },
      pollOptions
    );
    if (response.statusCode !== 200) {
      this.logger.log(LogLevel.Error, `(LongPolling transport) Unexpected response code: ${response.statusCode}.`);
      // Mark running as false so that the poll immediately ends and runs the close logic
      // ! 重写了 内置 的 创建 `HttpError` 方法
      this.closeError = new HttpError(response.errMsg || "", response.statusCode);
      this.running = false;
    } else {
      this.running = true;
    }
    this.receiving = this.poll(this.url, pollOptions);
    return Promise.resolve({
      errMsg: "connect success"
    });
  }
  /**
   * 获取 access-token
   *
   * @private
   * @returns {(Promise<string | null>)}
   * @memberof LongPollingTransport
   */
  private async getAccessToken(): Promise<string | null> {
    if (this.accessTokenFactory) {
      return await this.accessTokenFactory();
    }
    return null;
  }
  /**
   * 更新 access-token
   *
   * @private
   * @param {RequestOption} request
   * @param {(string | null)} token
   * @returns
   * @memberof LongPollingTransport
   */
  private updateHeaderToken(request: RequestOption, token: string | null) {
    /**
     * fix header
     */
    if (!request.headers) {
      request.headers = {};
    }
    /**
     * push token to headers
     */
    if (token) {
      // tslint:disable-next-line:no-string-literal
      request.headers["Authorization"] = `Bearer ${token}`;
      return;
    }
    // tslint:disable-next-line:no-string-literal
    if (request.headers["Authorization"]) {
      // tslint:disable-next-line:no-string-literal
      delete request.headers["Authorization"];
    }
  }
  /**
   * 异步计数?
   *
   * @private
   * @param {string} url
   * @param {RequestOption} pollOptions
   * @returns {Promise<void>}
   * @memberof LongPollingTransport
   */
  private async poll(url: string, pollOptions: RequestOption): Promise<void> {
    try {
      while (this.running) {
        // We have to get the access token on each poll, in case it changes
        const token = await this.getAccessToken();
        this.updateHeaderToken(pollOptions, token);

        try {
          const pollUrl = `${url}&_=${Date.now()}`;
          this.logger.log(LogLevel.Trace, `(LongPolling transport) polling: ${pollUrl}.  - (fy:长轮询传输 - polling)`);
          const response = await this.request.get(
            this.url,
            {
              _: Date.now()
            },
            pollOptions
          );
          if (response.statusCode === 204) {
            this.logger.log(
              LogLevel.Information,
              "(LongPolling transport) Poll terminated by server. - (fy:长轮询传输 - 由服务器终止轮询。)"
            );

            this.running = false;
          } else if (response.statusCode !== 200) {
            this.logger.log(
              LogLevel.Error,
              `(LongPolling transport) Unexpected response code: ${response.statusCode}.  - (fy:长轮询传输 - 意外的响应代码)`
            );
            // Unexpected status code
            this.closeError = new HttpError(response.errMsg || "", response.statusCode);
            this.running = false;
          } else {
            // Process the response
            if (response.data) {
              this.logger.log(
                LogLevel.Trace,
                `(LongPolling transport) data received. ${getDataDetail(response.data, this.logMessageContent)}.`
              );
              if (this.onreceive) {
                this.onreceive(response.data);
              }
            } else {
              // This is another way timeout manifest.
              this.logger.log(LogLevel.Trace, "(LongPolling transport) Poll timed out, reissuing.");
            }
          }
        } catch (e) {
          if (!this.running) {
            // Log but disregard errors that occur after stopping - fy: 记录但忽略停止后发生的错误
            this.logger.log(LogLevel.Trace, `(LongPolling transport) Poll errored after shutdown: ${e.message}`);
          } else {
            if (e instanceof TimeoutError) {
              // Ignore timeouts and reissue the poll. - 忽略超时并重新发出投票
              this.logger.log(
                LogLevel.Trace,
                "(LongPolling transport) Poll timed out, reissuing.  - (fy:长轮询传输 - 请求超时)"
              );
            } else {
              // Close the connection with the error as the result.
              this.closeError = e;
              this.running = false;
            }
          }
        }
      }
    } finally {
      this.logger.log(LogLevel.Trace, "(LongPolling transport) Polling complete.   - (fy:长轮询传输 - 请求完成)");
      // We will reach here with pollAborted==false when the server returned a response causing the transport to stop.
      // If pollAborted==true then client initiated the stop and the stop method will raise the close event after DELETE is sent.
      //当服务器返回导致传输停止的响应时，我们将使用pollAborted==false到达这里。
      //如果pollAborted==true，则客户端启动了stop，stop方法将在发送DELETE后引发close事件。
      if (!this.pollAborted) {
        this.raiseOnClose();
      }
    }
  }
  /**
   * 发送轮询包
   *
   * @param {*} data
   * @returns {Promise<void>}
   * @memberof LongPollingTransport
   */
  public async send(data: any): Promise<void> {
    if (!this.running) {
      return Promise.reject(new Error("Cannot send until the transport is connected"));
    }
    return sendMessage(
      this.logger,
      "LongPolling",
      this.request,
      this.url!,
      this.accessTokenFactory,
      data,
      this.logMessageContent
    );
  }
  /**
   * 停止
   *
   * @returns {Promise<void>}
   * @memberof LongPollingTransport
   */
  public async stop(): Promise<WechatMiniprogram.GeneralCallbackResult> {
    this.logger.log(LogLevel.Trace, "(LongPolling transport) Stopping polling.");

    // Tell receiving loop to stop, abort any current request, and then wait for it to finish
    this.running = false;
    this.pollAbort.abort();

    try {
      await this.receiving; // 这里 receiving 本身是一个 promise result, 用这个对象来监控请求未完成
      // Send DELETE to clean up long polling on the server
      // 发送DELETE以清除服务器上的长轮询
      this.logger.log(LogLevel.Trace, `(LongPolling transport) sending DELETE request to ${this.url}.`);

      const deleteOptions: RequestOption = {
        headers: {}
      };
      const token = await this.getAccessToken();
      this.updateHeaderToken(deleteOptions, token);
      await this.request.delete(this.url!, {}, deleteOptions);
      this.logger.log(LogLevel.Trace, "(LongPolling transport) DELETE request sent.");
      return Promise.resolve({
        errMsg: "stop success"
      });
    } catch (e) {
      this.logger.log(LogLevel.Error, `(LongPolling transport) Stop error.${e}`);
      return Promise.reject({
        errMsg: "stop fail"
      });
    } finally {
      this.logger.log(LogLevel.Trace, "(LongPolling transport) Stop finished.");
      // Raise close event here instead of in polling
      // It needs to happen after the DELETE request is sent
      //在此处引发关闭事件，而不是在轮询中
      //它需要在发送删除请求后发生
      this.raiseOnClose();
    }
  }
  /**
   * 调用关闭回调
   *
   * @private
   * @memberof LongPollingTransport
   */
  private raiseOnClose() {
    if (this.onclose) {
      let logMessage = "(LongPolling transport) Firing onclose event.";
      if (this.closeError) {
        logMessage += " Error: " + this.closeError;
      }
      this.logger.log(LogLevel.Trace, logMessage);
      this.onclose(this.closeError);
    }
  }
}

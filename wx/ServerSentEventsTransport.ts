// Copyright (c) .NET Foundation. All rights reserved.
// Licensed under the Apache License, Version 2.0. See License.txt in the project root for license information.

import { ILogger, LogLevel } from "./ILogger";
import { ITransport, TransferFormat, ConnectOptions } from "./ITransport";
import { EventSourceConstructor } from "./Polyfills";
import * as EventSource from "eventsource";
import { Arg, getDataDetail, sendMessage } from "./Utils";
import { Request } from "./wx-request/index";

/**
 * 服务器事件传输
 * @private
 */
export class ServerSentEventsTransport implements ITransport {
  private readonly request: Request;
  private readonly accessTokenFactory: (() => string | Promise<string>) | undefined;
  private readonly logger: ILogger;
  private readonly logMessageContent: boolean;
  private readonly eventSourceConstructor: EventSourceConstructor;
  private eventSource?: EventSource;
  private url?: string;

  public onreceive: ((data: string | ArrayBuffer) => void) | null;
  public onclose: ((error?: Error) => void) | null;
  /**
   *Creates an instance of ServerSentEventsTransport.
   * @param {Request} request
   * @param {((() => string | Promise<string>) | undefined)} accessTokenFactory
   * @param {ILogger} logger
   * @param {boolean} logMessageContent
   * @param {EventSourceConstructor} eventSourceConstructor
   * @memberof ServerSentEventsTransport
   */
  constructor(
    request: Request,
    accessTokenFactory: (() => string | Promise<string>) | undefined,
    logger: ILogger,
    logMessageContent: boolean,
    eventSourceConstructor: EventSourceConstructor
  ) {
    this.request = request; // ! rewrite lint
    this.accessTokenFactory = accessTokenFactory;
    this.logger = logger;
    this.logMessageContent = logMessageContent;
    this.eventSourceConstructor = eventSourceConstructor;

    this.onreceive = null;
    this.onclose = null;
  }

  public async connect(options: ConnectOptions): Promise<WechatMiniprogram.GeneralCallbackResult> {
    /* 验证参数完整性,不完整抛出异常 */
    Arg.isRequired(options, "options");
    Arg.isRequired(options.transferFormat, "transferFormat");
    Arg.isIn(options.transferFormat, TransferFormat, "transferFormat");

    this.logger.log(LogLevel.Trace, "(SSE transport) Connecting.");

    // set url before accessTokenFactory because this.url is only for send and we set the auth header instead of the query string for send
    // 在accessTokenFactory之前设置url，因为this.url仅用于send，我们设置auth头而不是send的查询字符串
    this.url = options.url;

    if (this.accessTokenFactory) {
      const token = await this.accessTokenFactory();
      if (token) {
        options.url += (options.url.indexOf("?") < 0 ? "?" : "&") + `access_token=${encodeURIComponent(token)}`;
      }
    }

    return new Promise((resolve, reject) => {
      let opened = false;
      if (options.transferFormat !== TransferFormat.Text) {
        reject({
          errMsg: "The Server-Sent Events transport only supports the 'Text' transfer format"
        });
        return;
      }

      let eventSource: EventSource;

      // 事件源
      eventSource = new this.eventSourceConstructor(options.url, {
        withCredentials: true,
        headers: {}
      } as EventSource.EventSourceInitDict);

      try {
        eventSource.onmessage = (e: MessageEvent) => {
          if (this.onreceive) {
            try {
              this.logger.log(
                LogLevel.Trace,
                `(SSE transport) data received. ${getDataDetail(e.data, this.logMessageContent)}.`
              );
              this.onreceive(e.data);
            } catch (error) {
              this.close(error);
              return;
            }
          }
        };

        eventSource.onerror = (e: MessageEvent) => {
          const error = new Error(e.data || "Error occurred");
          if (opened) {
            this.close(error);
          } else {
            reject(error);
          }
        };

        eventSource.onopen = () => {
          this.logger.log(LogLevel.Information, `SSE connected to ${this.url}`);
          this.eventSource = eventSource;
          opened = true;
          resolve();
        };
      } catch (e) {
        reject(e);
        return;
      }
    });
  }

  public async send(data: any): Promise<void> {
    if (!this.eventSource) {
      return Promise.reject(new Error("Cannot send until the transport is connected"));
    }
    return sendMessage(
      this.logger,
      "SSE",
      this.request,
      this.url,
      this.accessTokenFactory,
      data,
      this.logMessageContent
    );
  }

  public stop(): Promise<WechatMiniprogram.GeneralCallbackResult> {
    this.close();
    return Promise.resolve({
      errMsg: `close success`
    });
  }

  private close(e?: Error) {
    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = undefined;

      if (this.onclose) {
        this.onclose(e);
      }
    }
  }
}

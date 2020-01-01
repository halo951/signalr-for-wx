// Copyright (c) .NET Foundation. All rights reserved.
// Licensed under the Apache License, Version 2.0. See License.txt in the project root for license information.

import { ILogger, LogLevel } from "./ILogger";
import { ITransport, ConnectOptions, WxSocketTransportOptions } from "./ITransport";
import { Arg, getDataDetail } from "./Utils";
import { WxSocketReadyState } from "./Polyfills";
import { isVersionSupport } from "./WechatVersionDiff";
/**
 * 微信 sosocket 数据传输
 * @description 整体重写了这部分websocket支持,逻辑这样看起来合理一些
 */
export class WxSocketTransport implements ITransport {
  private readonly logger: ILogger;
  private readonly accessTokenFactory: (() => string | Promise<string>) | undefined;
  private readonly socketUrlFactory: ((url: string) => string | Promise<string> | undefined) | undefined;
  private readonly logMessageContent: boolean;

  private socketTask?: WechatMiniprogram.SocketTask;
  private readyState: WxSocketReadyState = WxSocketReadyState.CONNECTING;
  public onreceive: ((data: string | ArrayBuffer) => void) | null;
  public onclose: ((error?: Error) => void) | null;

  /**
   * 静态变量 - 表示当前是否有正在连接中的socket
   */
  static count: number = 0;
  /** 是否允许替换socket连接
   *
   * 小程序 版本 < 1.7.0 时, 最多允许存在一个socket连接, 此参数用于是否允许在这个情况下,替换这个打开的socket
   */
  public allowReplaceSocket: boolean;
  /** ! 新增 消息队列,在连接建立前,send的消息将会存放到 */
  public enableMessageQueue: boolean;
  public messageQueue: Array<any>;
  /** ! 超时设置 */
  public timeout: number;
  /** 监听等待时间 */
  
  public delayTime: number;
  /** 重连设置 */
  public reconnect: {
    enable: boolean; // 是否启用
    max: number; // 最大重连次数
    val: number; // 尝试次数
  };
  /** 连接参数 */
  connectOptions: WechatMiniprogram.ConnectSocketOption;

  constructor(options?: WxSocketTransportOptions) {
    this.logger = options.logger;
    this.accessTokenFactory = options.accessTokenFactory;
    this.socketUrlFactory = options.socketUrlFactory;
    this.logMessageContent = options.logMessageContent;
    this.onreceive = null;
    this.onclose = null;
    this.allowReplaceSocket = options.allowReplaceSocket;
    this.timeout = options.timeout ? options.timeout : 60 * 1000;
    this.delayTime = options.delayTime ? options.delayTime : 100;
    if (options.enableMessageQueue) {
      this.enableMessageQueue = true;
      this.messageQueue = [];
    } else {
      this.enableMessageQueue = false;
    }
    if (options.reconnect) {
      this.reconnect = {
        enable: options.reconnect.enable == true ? true : false,
        max: options.reconnect.max ? options.reconnect.max : 3,
        val: 0
      };
    } else {
      this.reconnect = {
        enable: false,
        max: 3,
        val: 0
      };
    }
  }

  public async connect(options: ConnectOptions): Promise<WechatMiniprogram.GeneralCallbackResult> {
    // vali is exists
    Arg.isRequired(options, "options");
    // vali url is support by wechat
    Arg.validationUrlIsSupportByWechat(options.url);
    this.connectOptions = options; // 连接参数缓存
    this.logger.log(LogLevel.Trace, "(WebSockets transport) Connecting.");
    /**
     * 添加 token
     */
    if (this.socketUrlFactory) {
      // 为了兼容后端使用 enc_access_token 场景,增加一个 socketUrlFactory 方法,替换url.
      const replacedUrl = await this.socketUrlFactory(options.url);
      if (replacedUrl) {
        options.url = replacedUrl;
      }
    } else if (this.accessTokenFactory) {
      const token = await this.accessTokenFactory();
      this.logger.log(LogLevel.Debug, `getted token:`, token);
      if (token) {
        options.url += (options.url.indexOf("?") < 0 ? "?" : "&") + `access_token=${encodeURIComponent(token)}`;
      }
    }

    return new Promise<WechatMiniprogram.GeneralCallbackResult>((resolve, reject) => {
      // 忽略url修正,因为传入错误url的话,将直接抛出异常
      options.url = options.url.replace(/^http/, "ws");
      // 这里执行的是连接操socket的逻辑
      let socketTask: WechatMiniprogram.SocketTask | undefined;
      // 1.7.0 及以上版本，最多可以同时存在 5 个 WebSocket 连接, 以下版本，一个小程序同时只能有一个 WebSocket 连接，如果当前已存在一个 WebSocket 连接，会自动关闭该连接，并重新创建一个 WebSocket 连接
      let supportCount = isVersionSupport("1.7.0") ? 5 : 1;
      if (supportCount <= WxSocketTransport.count && !this.allowReplaceSocket) {
        // 抛出异常, 并return
        reject({
          errMsg: `Maximum connections|${WxSocketTransport.count}`
        });
        return;
      } else if (WxSocketTransport.count == 5) {
        // 抛出异常, 并return
        reject({
          errMsg: `Maximum connections|${WxSocketTransport.count}`
        });
        return;
      }
      if (!socketTask) {
        socketTask = wx.connectSocket({
          // 传入 两个默认的 回调,当然也可以在 options 里面覆盖 使用自定义回调.
          success: (res: WechatMiniprogram.GeneralCallbackResult) => {
            this.logger.log(LogLevel.Debug, "wx.connectSocket():success");
          },
          fail: (res: WechatMiniprogram.GeneralCallbackResult) => {
            this.logger.log(LogLevel.Debug, "wx.connectSocket():fail");
            reject(res);
          },
          ...options
        });
      }
      // ! 因为小程序两种协议都支持,所以不需要指定特定的 binaryType
      /** 连接成功处理 */
      socketTask.onOpen(async (result: WechatMiniprogram.OnOpenCallbackResult) => {
        this.logger.log(
          LogLevel.Information,
          `websocket连接建立 ${this.logMessageContent ? "wx api:[" + options.url + "]" : ""}`
        );
        this.logger.log(LogLevel.Debug, `wx.connectSocket success message:`, result);
        WxSocketTransport.count += 1;
        this.readyState = WxSocketReadyState.OPEN;
        this.socketTask = socketTask;
        // 等待回调执行完成后,再重新队列中消息
        await resolve();
        // 发送在连接建立前发送的消息
        if (this.enableMessageQueue && this.messageQueue.length > 0) {
          // 队列推送
          for (let msg of this.messageQueue) {
            this.logger.log(LogLevel.Debug, `推送离线消息`, this.logMessageContent ? msg : "");
            await this.send(msg);
          }
        }
      });
      /** 建立连接出错处理 */
      socketTask.onError((res: WechatMiniprogram.SocketTaskOnErrorCallbackResult) => {
        this.readyState = WxSocketReadyState.CLOSED;
        if (this.reconnect.enable && this.reconnect.val < this.reconnect.max) {
          this.reconnect.val += 1;
          this.connect(options)
            .then(res => {
              this.reconnect.val = 0;
              resolve(res);
            })
            .catch(res => reject(res));
        } else {
          reject(res);
        }
      });
      /** 接收到消息处理 */
      socketTask.onMessage((res: WechatMiniprogram.SocketTaskOnMessageCallbackResult) => {
        this.logger.log(
          LogLevel.Trace,
          `(WebSockets transport) data received.`,
          getDataDetail(res.data, this.logMessageContent)
        );
        if (this.onreceive) {
          this.onreceive(res.data);
        }
      });
      socketTask.onClose((res: WechatMiniprogram.SocketTaskOnCloseCallbackResult) => this.close(res));
    });
  }
  /** 休眠 */
  private delay() {
    return new Promise(resolve => {
      // ! 由于小程序机制,所以需要手工清理timer
      let timer = setTimeout(() => {
        clearTimeout(timer);
        resolve();
      }, this.delayTime);
    });
  }
  /** 发送 */
  public async send(data: any): Promise<void> {
    if (this.socketTask && this.readyState === WxSocketReadyState.OPEN) {
      this.logger.log(LogLevel.Trace, `[WxSocket] 推送数据.`, getDataDetail(data, this.logMessageContent));
      return new Promise((resolve, reject) => {
        this.socketTask.send({
          data,
          success: () => resolve(),
          fail: () => reject()
        });
      });
    } else if (this.enableMessageQueue) {
      this.messageQueue.push(data);
      let loop = 0;
      while (this.socketTask && this.readyState !== WxSocketReadyState.OPEN) {
        await this.delay();
        loop += this.delayTime;
        if (loop >= this.timeout) {
          // 超时设置
          return Promise.reject({
            errMsg: "WebSocket connect timeout."
          });
        }
      }
      // 回调
      return this.send(data);
    } else {
      return Promise.reject({
        errMsg: "WebSocket is not in the OPEN state"
      });
    }
  }

  /** 停止 */
  public stop(): Promise<WechatMiniprogram.GeneralCallbackResult> {
    return new Promise((resolve, reject) => {
      if (this.socketTask) {
        this.socketTask.close({
          code: 1000,
          reason: `stop socket`,
          success: res => resolve(res),
          fail: res => reject(res)
        });
      }
    });
  }
  /**
   * 连接断开处理
   * @param res
   */
  private close(res: WechatMiniprogram.SocketTaskOnCloseCallbackResult): void {
    // webSocket will be null if the transport did not start successfully
    this.logger.log(LogLevel.Trace, "(WebSockets transport) socket closed.");
    WxSocketTransport.count = WxSocketTransport.count > 0 ? WxSocketTransport.count - 1 : 0;
    if (this.onclose) {
      if (res && res.code !== 1000) {
        this.onclose(new Error(`WebSocket closed with status code: ${res.code} (${res.reason}).`));
      } else {
        this.onclose();
      }
    }
  }
}

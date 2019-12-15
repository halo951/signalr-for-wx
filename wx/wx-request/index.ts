import { RequestConfig } from "./model/RequestConfig";
import { RequestMethod } from "./model/RequestMethod";
import { ResponseType } from "./model/ResponseType";
import { ResponseOptions } from "./model/ResponseOptions";
import { RequestOption } from "./model/RequestOption";
import { ILogger, LogLevel } from "../ILogger";
import { TimeoutError, HttpError } from "../Errors";
import { NullLogger } from "../Loggers";

/**
 * 封装微信ajax请求工具
 * @author halo
 */
export class Request {
  config: RequestConfig;

  logger: ILogger;

  /**
   * Creates an instance of Request.
   * 实例化配置
   * @param {*} [config]
   * @memberof Request
   */
  constructor(config: RequestConfig = {}, logger?: ILogger) {
    // 写入配置
    if (wx) {
      // Time: 继承 signalR logger. 日志统一维护
      this.logger = logger ? logger : new NullLogger();
    } else {
      throw new Error("当前运行环境不是微信运行环境");
    }
    // custom wx request promise library.
    this.setConfig(config);
  }
  /**
   * merge config
   * @param config
   */
  setConfig(config: RequestConfig = {}) {
    // 合并默认配置和
    this.config = {
      baseUrl: "http://", // 默认baseUrl
      headers: { "Content-Type": "application/json" }, // 默认请求头
      forceEnableHttps: false,
      method: RequestMethod.GET,
      responseType: ResponseType.JSON,
      responseEncoding: "utf8",
      timeout: 60 * 1000,
      transformRequest: [],
      transformResponse: [],
      // merge custom config
      ...config
    };
    // 请求头默认附加response 解析器
    if (!this.config.transformResponse) {
      this.config.transformResponse = [];
    }
    this.logger.log(LogLevel.Information, `set config success.`);
  }

  /**
   * 请求参数序列化
   *
   * @param {RequestOptions} options
   * @memberof Request
   *
   * @description 只支持普通get请求,和content-type = json 的 其他请求(post,put,delete,patch)
   */
  private async handleRequestOptions(options: RequestOption) {
    // 请求地址处理,对于非<scene>:// 请求,附加baseUrl
    if (options.url && !/:\/\/.+?/.test(options.url)) {
      options.url = `${options.config ? options.config.baseUrl : ""}/${options.url}`.replace(/([^:])(\/\/)/g, "$1/");
    }
    this.logger.log(LogLevel.Trace, `checked request url`);
    // https 处理
    if (options.config && options.config.forceEnableHttps) {
      options.url = options.url.replace(/http:/, "https:");
      this.logger.log(LogLevel.Trace, `execute fix [request.config.forceEnableHttps] ${options.url}`);
    }
    // header 合并
    options.headers = Object.assign({}, options.config ? options.config.headers : {}, options.headers);
    this.logger.log(LogLevel.Trace, `merge headers `, options.headers);
    // 移除微信封锁参数
    delete options.headers["Referer"];
    this.logger.log(LogLevel.Trace, `try delete headers Referer.`);
    // 替换请求内的ResponseType
    options.responseType = options.responseType
      ? options.responseType
      : options.config
      ? options.config.responseType
      : ResponseType.TEXT;
    this.logger.log(LogLevel.Trace, `checked responseType [${options.responseType}]`);
    // 执行请求调用链
    if (options.config && options.config.transformRequest) {
      this.logger.log(LogLevel.Trace, `execute transform request list. -result\n`, options.config);
      for (let fun of options.config.transformRequest){
        try{
          await fun(options);
        }catch(e){
          throw e;
        }
      }
    }
    // debug print handled request options
    this.logger.log(LogLevel.Debug, `handled request options \n`, options);
  }

  /**
   * 验证响应结果,执行回调
   *
   * @param {*} resolve
   * @param {*} reject
   * @param {*} response
   * @memberof Request
   */
  private async handleResponse(response: ResponseOptions): Promise<ResponseOptions> {
    // 仅处理响应类型为JSON 返回值
    if (
      response.options.config &&
      response.options.config.responseType == "json" &&
      response.options.config.transformResponse
    ) {
      for (let fun of response.options.config.transformResponse) {
        try {
          // handler response
          await fun(response);
        } catch (res) {
          this.logger.log(LogLevel.Trace, `execute transform request list. -result \n `, res);
          throw res;
        }
      }
    }
    // debug print handled response context
    this.logger.log(LogLevel.Debug, `handled response context \n`, response);
    return Promise.resolve(response);
  }

  /**
   * 执行请求
   *
   * @param {RequestOptions} [options={
   *       url: this.config.baseUrl
   *     }]
   * @returns {Promise<any>}
   * @memberof Request
   */
  executeRequest(options: RequestOption): Promise<ResponseOptions> {
    return new Promise(async (resolve, reject) => {
      this.logger.log(LogLevel.Trace, `execute request -options \n`, options);
      // 合并 baseConfig
      options.config = options.config ? { ...this.config, ...options.config } : { ...this.config };
      if (this.checkAbout(options.config, reject)) return;
      try {
        // 序列化请求参数
        await this.handleRequestOptions(options);
      } catch (error) {
        // 抛出异常.
        return reject({
          data:null,
          header: null,
          statusCode: -1,
          options,
          ...error
        });
      }
      if (this.checkAbout(options.config, reject)) return;
      // print fixed options
      this.logger.log(LogLevel.Debug, `fixed options \n`, options);
      // execute request
      this.logger.log(LogLevel.Trace, `invoke wx.request`);
      let task = wx.request({
        url: options.url,
        data: options.data,
        dataType: options.responseType,
        header: options.headers,
        method: options.method,
        responseType: (() => {
          switch (options.responseType) {
            case "json":
            case "text":
              return "text";
            case "arraybuffer":
              return "arraybuffer";
          }
        })(),
        success: async (res: { data: string | any | ArrayBuffer; header: any; statusCode: number; errMsg: string }) => {
          if (this.checkAbout(options.config, reject)) return;
          this.logger.log(LogLevel.Debug, `origin response context \n`, res);
          let { data, header, statusCode, errMsg } = res;
          // 创建原始响应
          let responseOptions: ResponseOptions = {
            data,
            header,
            statusCode,
            options,
            errMsg
          };
          // 调用响应处理链(并返回结果)
          this.handleResponse(responseOptions)
            .then(res => {
              // print debug
              this.logger.log(LogLevel.Debug, `handle response context is success. \n`, res);
              /**
               * check and cache cookie (if has) |
               * @description 这里因为 signalR的原因,内置了一个 cookies.js [library](https://github.com/jshttp/cookie/index.js)
               * 略有改写,暂时将cookie 扔到内存中维护(毕竟就signalr使用,不考虑扔到 localStore 中占地方).
               */
              if (options.config.cookie) options.config.cookie.set(options.url, header);
              // callback
              resolve(res);
            })
            .catch((res: ResponseOptions) => {
              // print log
              this.logger.log(LogLevel.Error, `handle response context is fail. \n `, res);
              // ! 这里为了兼容 signalR的错误格式,抛出继承了HttpError异常.
              let httpError = new HttpError(res.errMsg, res.statusCode);
              // callback  - 合并后,返回,可以被认定为 继承 HttpError对象.
              reject({ ...res, ...httpError });
            });
        },
        fail: (res: { errMsg: string }) => {
          let responseOptions: ResponseOptions | any = null;
          if (res && /request:fail socket time out timeout/.test(res.errMsg)) {
            // ! 这里为了兼容 signalR的错误格式,抛出继承了TimeoutError异常.
            responseOptions = {
              data: null,
              status: -1,
              errMsg: res.errMsg,
              ...new TimeoutError(res.errMsg)
            };
          } else {
            // ! 这里为了兼容 signalR的错误格式,抛出继承了HttpError异常.
            responseOptions = {
              data: null,
              status: -1,
              errMsg: res.errMsg,
              ...new HttpError(res.errMsg, 500)
            };
          }
          /**
           *  @date 2019年12月11日 13:14:25
           * ! 修复bug,wx.request fail 情况下, 未调用 response 处理链.
           */
          // 调用响应处理链(并返回结果)
          this.handleResponse(responseOptions)
            .then(res => {
              // print debug
              this.logger.log(LogLevel.Debug, `handle response context is success. \n`, res);
              /**
               * check and cache cookie (if has) |
               * @description 这里因为 signalR的原因,内置了一个 cookies.js [library](https://github.com/jshttp/cookie/index.js)
               * 略有改写,暂时将cookie 扔到内存中维护(毕竟就signalr使用,不考虑扔到 localStore 中占地方).
               */
              if (options.config.cookie) options.config.cookie.set(options.url, {});
              // callback
              resolve(res);
            })
            .catch((res: ResponseOptions) => {
              // print log
              this.logger.log(LogLevel.Error, `handle response context is fail. \n `, res);
              // ! 这里为了兼容 signalR的错误格式,抛出继承了HttpError异常.
              let httpError = new HttpError(res.errMsg, res.statusCode);
              // callback  - 合并后,返回,可以被认定为 继承 HttpError对象.
              reject({ ...res, ...httpError });
            });
        }
      });
      // 监听 headers 变化
      task.onHeadersReceived(() => {
        // 当检查到 about() 状态,中断请求
        if (this.checkAbout(options.config, reject)) {
          // 中断请求
          task.abort();
          return;
        }
      });
    });
  }
  /**
   * 检查中断
   *
   * @memberof Request
   */
  checkAbout(options: RequestOption, reject: Function) {
    if (options.config && options.config.about) {
      reject({
        data: null,
        header: options.headers,
        statusCode: 412, // 使用 412 状态码 处理请求中断
        options,
        errMsg: "网络异常" // 直接自定义错误了.
      });
      return true;
    } else {
      return false;
    }
  }

  /**
   * GET 请求
   * @description 封装调用
   * @param url 请求地址
   * @param data 请求参数
   * @param options 请求配置
   */
  get(url: string, data: any = {}, options?: RequestOption): Promise<ResponseOptions> {
    // print execute step
    this.logger.log(LogLevel.Trace, `invoke request.get()`);
    // merge config
    let requestOptions: RequestOption = {
      ...(() => (options ? options : {}))(),
      method: RequestMethod.GET,
      url,
      data
    };
    // execute and response
    return this.executeRequest(requestOptions);
  }
  /**
   * POST 请求
   * @description 封装调用
   * @param url 请求地址
   * @param data 请求参数
   * @param options 请求配置
   */
  post(url: string, data: any = {}, options?: RequestOption): Promise<ResponseOptions> {
    // print execute step
    this.logger.log(LogLevel.Trace, `invoke request.post()`);
    // merge config
    let requestOptions: RequestOption = {
      ...(() => (options ? options : {}))(),
      method: RequestMethod.POST,
      url,
      data
    };
    // execute and response
    return this.executeRequest(requestOptions);
  }
  /**
   * PUT 请求
   * @description 封装调用
   * @param url 请求地址
   * @param data 请求参数
   * @param options 请求配置
   */
  put(url: string, data: any = {}, options?: RequestOption): Promise<ResponseOptions> {
    // print execute step
    this.logger.log(LogLevel.Trace, `invoke request.put()`);
    // merge config
    let requestOptions: RequestOption = {
      ...(() => (options ? options : {}))(),
      method: RequestMethod.PUT,
      url,
      data
    };
    // execute and response
    return this.executeRequest(requestOptions);
  }

  /**
   * DELETE 请求
   * @description 封装调用
   * @param url 请求地址
   * @param data 请求参数
   * @param options 请求配置
   */
  delete(url: string, data: any = {}, options?: RequestOption): Promise<ResponseOptions> {
    // print execute step
    this.logger.log(LogLevel.Trace, `invoke request.delete()`);
    // merge config
    let requestOptions: RequestOption = {
      ...(() => (options ? options : {}))(),
      method: RequestMethod.DELETE,
      url,
      data
    };
    // execute and response
    return this.executeRequest(requestOptions);
  }
  /**
   * 多请求同步执行
   * @param taskQueue
   */
  all(taskQueue: Array<Promise<ResponseOptions>>): Promise<ResponseOptions[]> {
    // print execute step
    this.logger.log(LogLevel.Trace, `invoke request.all()`);
    // merge config
    return Promise.all(taskQueue);
  }
  /**
   * 用于兼容 @aspnet/signalR 的 获取 cookie 方法
   *
   * @description 这里用内存对象来维护一个 在线 cookies
   * @param {string} url
   * @returns
   * @memberof Request
   */
  getCookieString(url: string) {
    if (this.config && this.config.cookie) {
      return this.config.cookie.origin(url);
    } else {
      return ``;
    }
  }
  cookie(url: string, key: string) {
    if (this.config && this.config.cookie) {
      return this.config.cookie.get(url, key);
    } else {
      return ``;
    }
  }
}

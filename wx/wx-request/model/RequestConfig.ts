import { RequestMethod } from "./RequestMethod";
import { ResponseType } from "./ResponseType";

/**
 * 请求配置信息
 * @description
 *  1. 使用 setConfig 可以替换掉当前的配置信息
 *  2. RequestParams 中参数配置,可以在本次请求中替换实例配置
 * @interface RequestConfig
 */
export interface RequestConfig {
  /**
   * 请求前缀
   *
   * @type {string}
   * @memberof RequestConfig
   */
  baseUrl?: string;
  /**
   * 请求等待时间
   *
   * @type {number}
   * @memberof RequestConfig
   */
  timeout?: number;

  /**
   * 强制启用https
   * @description 建议 production 环境下开启
   * 操作:会在请求数据处理链调用结束后,检查并增加https
   * @type {boolean}
   * @memberof RequestConfig
   */
  forceEnableHttps?: boolean;

  /**
   * 请求头
   *
   * @type {*}
   * @memberof RequestConfig
   */
  headers?: { [key: string]: any };

  /**
   * 请求方式GET
   *
   * @type {RequestMethod}
   * @memberof RequestConfig
   */
  method?: RequestMethod;

  /**
   * 响应数据类型
   *
   * @type {ResponseType}
   * @memberof RequestConfig
   */
  responseType?: ResponseType;

  /**
   * 响应数据编码
   *
   * @type {"utf8"}
   * @memberof RequestConfig
   */
  responseEncoding?: String;

  /**
   * 请求信息处理链
   *
   * @type {Array<Function>}
   * @memberof RequestConfig
   */
  transformRequest?: Array<Function>;

  /**
   * 响应信息处理链
   *
   * @type {Array<Function>}
   * @memberof RequestConfig
   */
  transformResponse?: Array<Function>;
  /**
   * 中断请求,如果这个参数 是 true 的话,将中断请求
   * @description
   * - 未开始执行的请求,直接 reject
   * - 执行中的请求, 暂不处理
   * - 执行结果处理时,遇到此参数,中断,并抛出异常.
   * @time 2019年12月1日 17:56:06 新增
   * @type {boolean}
   * @memberof RequestConfig
   */
  about?: boolean;
  /**
   * cookie key from headers
   *
   * @description
   * - 小程序默认不支持cookies,这里做一个
   * @type {(string | null)}
   * @memberof RequestConfig
   */
  cookie?: {
    set: (url: string, header: any) => void;
    get: (url: string, key: string) => any;
    origin: (url: string) => string;
  };
}

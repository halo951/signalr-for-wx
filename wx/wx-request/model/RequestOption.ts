import { RequestConfig } from "./RequestConfig";
import { RequestMethod } from "./RequestMethod";
import { ResponseType } from "./ResponseType";

/**
 * 请求参数
 */
export interface RequestOption {
    /**
     * 本次请求配置
     *
     * @type {RequestConfig}
     * @memberof RequestParams
     */
    config?: RequestConfig;
    /**
     * 请求地址
     *
     * @type {string}
     * @memberof RequestParams
     */
    url?: string;
    /**
     * 请求方法
     *
     * @type {RequestMethod}
     * @memberof RequestParams
     */
    method?: RequestMethod;
    /**
     * 请求头 
     * 
     * @type {*}
     * @memberof RequestOptions
     */
    headers?: any;
    /**
     * 请求携带数据
     *
     * @type {*}
     * @memberof RequestParams
     */
    data?: string | any | ArrayBuffer;
    responseType?: ResponseType;
    // 自定义参数(仅参与携带)
    custom?: any;
}
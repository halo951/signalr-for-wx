import { Request } from "./wx-request/index";
import { RequestMethod, ResponseType } from "wx";
import { RequestConfig } from "./wx-request/model/RequestConfig";
import { ILogger } from "./ILogger";
/**
 * 生成默认请求库
 *
 * @export
 * @class DefaultRequest
 */
export default class DefaultRequest extends Request {
  constructor(config: RequestConfig, logger: ILogger) {
    super();
    // default config
    this.setConfig({
      about: false,
      forceEnableHttps: false,
      headers: {},
      method: RequestMethod.GET,
      responseEncoding: ResponseType.JSON,
      timeout: 2 * 60 * 1000,
      transformRequest: [],
      transformResponse: [],
      ...config
    });
    this.logger = logger;
  }
}

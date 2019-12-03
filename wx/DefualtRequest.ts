import { Request } from "./wx-request/index";
import { RequestConfig } from "./wx-request/model/RequestConfig";
import { ILogger, LogLevel } from "./ILogger";
import { RequestMethod, ResponseType } from "./wx-request/model";
/**
 * 生成默认请求库
 *
 * @export
 * @class DefaultRequest
 */
export default class DefaultRequest extends Request {
  constructor(config: RequestConfig, logger: ILogger) {
    super();
    this.logger = logger
      ? logger
      : {
        log(logLevel: LogLevel, message: string) {
          /* 屏蔽打印 */
        }
      };
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
  }
}

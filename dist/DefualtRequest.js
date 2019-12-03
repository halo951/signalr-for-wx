var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
import { Request } from "./wx-request/index";
import { RequestMethod, ResponseType } from "./wx-request/model";
/**
 * 生成默认请求库
 *
 * @export
 * @class DefaultRequest
 */
var DefaultRequest = /** @class */ (function (_super) {
    __extends(DefaultRequest, _super);
    function DefaultRequest(config, logger) {
        var _this = _super.call(this) || this;
        _this.logger = logger
            ? logger
            : {
                log: function (logLevel, message) {
                    /* 屏蔽打印 */
                }
            };
        // default config
        _this.setConfig(__assign({ about: false, forceEnableHttps: false, headers: {}, method: RequestMethod.GET, responseEncoding: ResponseType.JSON, timeout: 2 * 60 * 1000, transformRequest: [], transformResponse: [] }, config));
        return _this;
    }
    return DefaultRequest;
}(Request));
export default DefaultRequest;

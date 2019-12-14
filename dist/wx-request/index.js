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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
import { RequestMethod } from "./model/RequestMethod";
import { ResponseType } from "./model/ResponseType";
import { LogLevel } from "../ILogger";
import { TimeoutError, HttpError } from "../Errors";
import { NullLogger } from "../Loggers";
/**
 * 封装微信ajax请求工具
 * @author halo
 */
var Request = /** @class */ (function () {
    /**
     * Creates an instance of Request.
     * 实例化配置
     * @param {*} [config]
     * @memberof Request
     */
    function Request(config, logger) {
        if (config === void 0) { config = {}; }
        // 写入配置
        if (wx) {
            // Time: 继承 signalR logger. 日志统一维护
            this.logger = logger ? logger : new NullLogger();
        }
        else {
            throw new Error("当前运行环境不是微信运行环境");
        }
        // custom wx request promise library.
        this.setConfig(config);
    }
    /**
     * merge config
     * @param config
     */
    Request.prototype.setConfig = function (config) {
        if (config === void 0) { config = {}; }
        // 合并默认配置和
        this.config = __assign({ baseUrl: "http://", headers: { "Content-Type": "application/json" }, forceEnableHttps: false, method: RequestMethod.GET, responseType: ResponseType.JSON, responseEncoding: "utf8", timeout: 60 * 1000, transformRequest: [], transformResponse: [] }, config);
        // 请求头默认附加response 解析器
        if (!this.config.transformResponse) {
            this.config.transformResponse = [];
        }
        this.logger.log(LogLevel.Information, "set config success.");
    };
    /**
     * 请求参数序列化
     *
     * @param {RequestOptions} options
     * @memberof Request
     *
     * @description 只支持普通get请求,和content-type = json 的 其他请求(post,put,delete,patch)
     */
    Request.prototype.handleRequestOptions = function (options) {
        return __awaiter(this, void 0, void 0, function () {
            var _i, _a, fun;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        // 请求地址处理,对于非<scene>:// 请求,附加baseUrl
                        if (options.url && !/:\/\/.+?/.test(options.url)) {
                            options.url = ((options.config ? options.config.baseUrl : "") + "/" + options.url).replace(/([^:])(\/\/)/g, "$1/");
                        }
                        this.logger.log(LogLevel.Trace, "checked request url");
                        // https 处理
                        if (options.config && options.config.forceEnableHttps) {
                            options.url = options.url.replace(/http:/, "https:");
                            this.logger.log(LogLevel.Trace, "execute fix [request.config.forceEnableHttps] " + options.url);
                        }
                        // header 合并
                        options.headers = Object.assign({}, options.config ? options.config.headers : {}, options.headers);
                        this.logger.log(LogLevel.Trace, "merge headers ", options.headers);
                        // 移除微信封锁参数
                        delete options.headers["Referer"];
                        this.logger.log(LogLevel.Trace, "try delete headers Referer.");
                        // 替换请求内的ResponseType
                        options.responseType = options.responseType
                            ? options.responseType
                            : options.config
                                ? options.config.responseType
                                : ResponseType.TEXT;
                        this.logger.log(LogLevel.Trace, "checked responseType [" + options.responseType + "]");
                        if (!(options.config && options.config.transformRequest)) return [3 /*break*/, 4];
                        this.logger.log(LogLevel.Trace, "execute transform request list. -result\n", options.config);
                        _i = 0, _a = options.config.transformRequest;
                        _b.label = 1;
                    case 1:
                        if (!(_i < _a.length)) return [3 /*break*/, 4];
                        fun = _a[_i];
                        return [4 /*yield*/, fun(options)];
                    case 2:
                        _b.sent();
                        _b.label = 3;
                    case 3:
                        _i++;
                        return [3 /*break*/, 1];
                    case 4:
                        // debug print handled request options
                        this.logger.log(LogLevel.Debug, "handled request options \n", options);
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 验证响应结果,执行回调
     *
     * @param {*} resolve
     * @param {*} reject
     * @param {*} response
     * @memberof Request
     */
    Request.prototype.handleResponse = function (response) {
        return __awaiter(this, void 0, void 0, function () {
            var _i, _a, fun, result;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (!(response.options.config &&
                            response.options.config.responseType == "json" &&
                            response.options.config.transformResponse)) return [3 /*break*/, 4];
                        _i = 0, _a = response.options.config.transformResponse;
                        _b.label = 1;
                    case 1:
                        if (!(_i < _a.length)) return [3 /*break*/, 4];
                        fun = _a[_i];
                        return [4 /*yield*/, fun(response)];
                    case 2:
                        result = _b.sent();
                        // 这个异常处理步骤未验证.
                        if (result) {
                            this.logger.log(LogLevel.Trace, "execute transform request list. -result \n ", result);
                            return [2 /*return*/, result];
                        }
                        _b.label = 3;
                    case 3:
                        _i++;
                        return [3 /*break*/, 1];
                    case 4:
                        // debug print handled response context
                        this.logger.log(LogLevel.Debug, "handled response context \n", response);
                        return [2 /*return*/, Promise.resolve(response)];
                }
            });
        });
    };
    /**
     * 执行请求
     *
     * @param {RequestOptions} [options={
     *       url: this.config.baseUrl
     *     }]
     * @returns {Promise<any>}
     * @memberof Request
     */
    Request.prototype.executeRequest = function (options) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            _this.logger.log(LogLevel.Trace, "execute request -options \n", options);
            // 合并 baseConfig
            options.config = options.config ? __assign({}, _this.config, options.config) : __assign({}, _this.config);
            if (_this.checkAbout(options.config, reject))
                return;
            // 序列化请求参数
            _this.handleRequestOptions(options);
            if (_this.checkAbout(options.config, reject))
                return;
            // print fixed options
            _this.logger.log(LogLevel.Debug, "fixed options \n", options);
            // execute request
            _this.logger.log(LogLevel.Trace, "invoke wx.request");
            var task = wx.request({
                url: options.url,
                data: options.data,
                dataType: options.responseType,
                header: options.headers,
                method: options.method,
                responseType: (function () {
                    switch (options.responseType) {
                        case "json":
                        case "text":
                            return "text";
                        case "arraybuffer":
                            return "arraybuffer";
                    }
                })(),
                success: function (res) { return __awaiter(_this, void 0, void 0, function () {
                    var data, header, statusCode, errMsg, responseOptions;
                    var _this = this;
                    return __generator(this, function (_a) {
                        if (this.checkAbout(options.config, reject))
                            return [2 /*return*/];
                        this.logger.log(LogLevel.Debug, "origin response context \n", res);
                        data = res.data, header = res.header, statusCode = res.statusCode, errMsg = res.errMsg;
                        responseOptions = {
                            data: data,
                            header: header,
                            statusCode: statusCode,
                            options: options,
                            errMsg: errMsg
                        };
                        // 调用响应处理链(并返回结果)
                        this.handleResponse(responseOptions)
                            .then(function (res) {
                            // print debug
                            _this.logger.log(LogLevel.Debug, "handle response context is success. \n", res);
                            /**
                             * check and cache cookie (if has) |
                             * @description 这里因为 signalR的原因,内置了一个 cookies.js [library](https://github.com/jshttp/cookie/index.js)
                             * 略有改写,暂时将cookie 扔到内存中维护(毕竟就signalr使用,不考虑扔到 localStore 中占地方).
                             */
                            if (options.config.cookie)
                                options.config.cookie.set(options.url, header);
                            // callback
                            resolve(res);
                        })
                            .catch(function (res) {
                            // print log
                            _this.logger.log(LogLevel.Error, "handle response context is fail. \n ", res);
                            // ! 这里为了兼容 signalR的错误格式,抛出继承了HttpError异常.
                            var httpError = new HttpError(res.errMsg, res.statusCode);
                            // callback  - 合并后,返回,可以被认定为 继承 HttpError对象.
                            reject(__assign({}, res, httpError));
                        });
                        return [2 /*return*/];
                    });
                }); },
                fail: function (res) {
                    var responseOptions = null;
                    if (res && /request:fail socket time out timeout/.test(res.errMsg)) {
                        // ! 这里为了兼容 signalR的错误格式,抛出继承了TimeoutError异常.
                        responseOptions = __assign({ data: null, status: -1, errMsg: res.errMsg }, new TimeoutError(res.errMsg));
                    }
                    else {
                        // ! 这里为了兼容 signalR的错误格式,抛出继承了HttpError异常.
                        responseOptions = __assign({ data: null, status: -1, errMsg: res.errMsg }, new HttpError(res.errMsg, 500));
                    }
                    /**
                     *  @date 2019年12月11日 13:14:25
                     * ! 修复bug,wx.request fail 情况下, 未调用 response 处理链.
                     */
                    // 调用响应处理链(并返回结果)
                    _this.handleResponse(responseOptions)
                        .then(function (res) {
                        // print debug
                        _this.logger.log(LogLevel.Debug, "handle response context is success. \n", res);
                        /**
                         * check and cache cookie (if has) |
                         * @description 这里因为 signalR的原因,内置了一个 cookies.js [library](https://github.com/jshttp/cookie/index.js)
                         * 略有改写,暂时将cookie 扔到内存中维护(毕竟就signalr使用,不考虑扔到 localStore 中占地方).
                         */
                        if (options.config.cookie)
                            options.config.cookie.set(options.url, {});
                        // callback
                        resolve(res);
                    })
                        .catch(function (res) {
                        // print log
                        _this.logger.log(LogLevel.Error, "handle response context is fail. \n ", res);
                        // ! 这里为了兼容 signalR的错误格式,抛出继承了HttpError异常.
                        var httpError = new HttpError(res.errMsg, res.statusCode);
                        // callback  - 合并后,返回,可以被认定为 继承 HttpError对象.
                        reject(__assign({}, res, httpError));
                    });
                }
            });
            // 监听 headers 变化
            task.onHeadersReceived(function () {
                // 当检查到 about() 状态,中断请求
                if (_this.checkAbout(options.config, reject)) {
                    // 中断请求
                    task.abort();
                    return;
                }
            });
        });
    };
    /**
     * 检查中断
     *
     * @memberof Request
     */
    Request.prototype.checkAbout = function (options, reject) {
        if (options.config && options.config.about) {
            reject({
                data: null,
                header: options.headers,
                statusCode: 412,
                options: options,
                errMsg: "网络异常" // 直接自定义错误了.
            });
            return true;
        }
        else {
            return false;
        }
    };
    /**
     * GET 请求
     * @description 封装调用
     * @param url 请求地址
     * @param data 请求参数
     * @param options 请求配置
     */
    Request.prototype.get = function (url, data, options) {
        if (data === void 0) { data = {}; }
        // print execute step
        this.logger.log(LogLevel.Trace, "invoke request.get()");
        // merge config
        var requestOptions = __assign({}, (function () { return (options ? options : {}); })(), { method: RequestMethod.GET, url: url,
            data: data });
        // execute and response
        return this.executeRequest(requestOptions);
    };
    /**
     * POST 请求
     * @description 封装调用
     * @param url 请求地址
     * @param data 请求参数
     * @param options 请求配置
     */
    Request.prototype.post = function (url, data, options) {
        if (data === void 0) { data = {}; }
        // print execute step
        this.logger.log(LogLevel.Trace, "invoke request.post()");
        // merge config
        var requestOptions = __assign({}, (function () { return (options ? options : {}); })(), { method: RequestMethod.POST, url: url,
            data: data });
        // execute and response
        return this.executeRequest(requestOptions);
    };
    /**
     * PUT 请求
     * @description 封装调用
     * @param url 请求地址
     * @param data 请求参数
     * @param options 请求配置
     */
    Request.prototype.put = function (url, data, options) {
        if (data === void 0) { data = {}; }
        // print execute step
        this.logger.log(LogLevel.Trace, "invoke request.put()");
        // merge config
        var requestOptions = __assign({}, (function () { return (options ? options : {}); })(), { method: RequestMethod.PUT, url: url,
            data: data });
        // execute and response
        return this.executeRequest(requestOptions);
    };
    /**
     * DELETE 请求
     * @description 封装调用
     * @param url 请求地址
     * @param data 请求参数
     * @param options 请求配置
     */
    Request.prototype.delete = function (url, data, options) {
        if (data === void 0) { data = {}; }
        // print execute step
        this.logger.log(LogLevel.Trace, "invoke request.delete()");
        // merge config
        var requestOptions = __assign({}, (function () { return (options ? options : {}); })(), { method: RequestMethod.DELETE, url: url,
            data: data });
        // execute and response
        return this.executeRequest(requestOptions);
    };
    /**
     * 多请求同步执行
     * @param taskQueue
     */
    Request.prototype.all = function (taskQueue) {
        // print execute step
        this.logger.log(LogLevel.Trace, "invoke request.all()");
        // merge config
        return Promise.all(taskQueue);
    };
    /**
     * 用于兼容 @aspnet/signalR 的 获取 cookie 方法
     *
     * @description 这里用内存对象来维护一个 在线 cookies
     * @param {string} url
     * @returns
     * @memberof Request
     */
    Request.prototype.getCookieString = function (url) {
        if (this.config && this.config.cookie) {
            return this.config.cookie.origin(url);
        }
        else {
            return "";
        }
    };
    Request.prototype.cookie = function (url, key) {
        if (this.config && this.config.cookie) {
            return this.config.cookie.get(url, key);
        }
        else {
            return "";
        }
    };
    return Request;
}());
export { Request };

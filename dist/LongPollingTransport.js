// 版权所有（c）.NET基金会。保留所有权利。
// 在2.0版Apache许可下授权。有关许可证信息，请参见项目根目录中的License.txt。
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
import { AbortController } from "./AbortController";
import { HttpError, TimeoutError } from "./Errors";
import { LogLevel } from "./ILogger";
import { TransferFormat } from "./ITransport";
import { Arg, getDataDetail, sendMessage } from "./Utils";
import { ResponseType } from "./wx-request/model/ResponseType";
import { NullLogger } from './Loggers';
import DefaultRequest from "./DefualtRequest";
// Not exported from 'index', this type is internal.
/**
 * 长轮询
 * @private
 */
var LongPollingTransport = /** @class */ (function () {
    /**
     * 导出 request 工具
     * @param {Request} request
     * @param {((() => string | Promise<string>) | undefined)} accessTokenFactory access-token-factory
     * @param {ILogger} logger
     * @param {boolean} logMessageContent
     * @memberof LongPollingTransport
     */
    function LongPollingTransport(options) {
        this.accessTokenFactory = options.accessTokenFactory ? options.accessTokenFactory : undefined;
        this.logger = options.logger ? options.logger : new NullLogger();
        this.pollAbort = new AbortController();
        this.logMessageContent = options.logMessageContent ? options.logMessageContent : false;
        this.request = options.request ? options.request : new DefaultRequest({}, this.logger);
        this.running = false;
        this.onreceive = null;
        this.onclose = null;
    }
    Object.defineProperty(LongPollingTransport.prototype, "pollAborted", {
        // This is an internal type, not exported from 'index' so this is really just internal.
        get: function () {
            return this.pollAbort.aborted;
        },
        enumerable: true,
        configurable: true
    });
    /**
     * 连接 - 这里理解为请求
     *
     * @param {string} url
     * @param {TransferFormat} transferFormat
     * @returns {Promise<void>}
     * @memberof LongPollingTransport
     */
    LongPollingTransport.prototype.connect = function (options) {
        return __awaiter(this, void 0, void 0, function () {
            var pollOptions, token, response;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        /* 验证参数完整性,不完整抛出异常 */
                        Arg.isRequired(options, "options");
                        Arg.isRequired(options.transferFormat, "transferFormat");
                        Arg.isIn(options.transferFormat, TransferFormat, "transferFormat");
                        // update options
                        this.url = options.url;
                        // print log
                        this.logger.log(LogLevel.Trace, "(LongPolling transport) Connecting.");
                        pollOptions = {
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
                        return [4 /*yield*/, this.getAccessToken()];
                    case 1:
                        token = _a.sent();
                        this.updateHeaderToken(pollOptions, token);
                        // Make initial long polling request
                        // Server uses first long polling request to finish initializing connection and it returns without data
                        //发出初始长轮询请求
                        //服务器使用第一个长轮询请求完成连接初始化，它返回时不带数据
                        this.logger.log(LogLevel.Trace, "(LongPolling transport) polling: [url]" + this.url);
                        return [4 /*yield*/, this.request.get(this.url, {
                                _: Date.now()
                            }, pollOptions)];
                    case 2:
                        response = _a.sent();
                        if (response.statusCode !== 200) {
                            this.logger.log(LogLevel.Error, "(LongPolling transport) Unexpected response code: " + response.statusCode + ".");
                            // Mark running as false so that the poll immediately ends and runs the close logic
                            // ! 重写了 内置 的 创建 `HttpError` 方法
                            this.closeError = new HttpError(response.errMsg || "", response.statusCode);
                            this.running = false;
                        }
                        else {
                            this.running = true;
                        }
                        this.receiving = this.poll(this.url, pollOptions);
                        return [2 /*return*/, Promise.resolve({
                                errMsg: "connect success"
                            })];
                }
            });
        });
    };
    /**
     * 获取 access-token
     *
     * @private
     * @returns {(Promise<string | null>)}
     * @memberof LongPollingTransport
     */
    LongPollingTransport.prototype.getAccessToken = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this.accessTokenFactory) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.accessTokenFactory()];
                    case 1: return [2 /*return*/, _a.sent()];
                    case 2: return [2 /*return*/, null];
                }
            });
        });
    };
    /**
     * 更新 access-token
     *
     * @private
     * @param {RequestOption} request
     * @param {(string | null)} token
     * @returns
     * @memberof LongPollingTransport
     */
    LongPollingTransport.prototype.updateHeaderToken = function (request, token) {
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
            request.headers["Authorization"] = "Bearer " + token;
            return;
        }
        // tslint:disable-next-line:no-string-literal
        if (request.headers["Authorization"]) {
            // tslint:disable-next-line:no-string-literal
            delete request.headers["Authorization"];
        }
    };
    /**
     * 异步计数?
     *
     * @private
     * @param {string} url
     * @param {RequestOption} pollOptions
     * @returns {Promise<void>}
     * @memberof LongPollingTransport
     */
    LongPollingTransport.prototype.poll = function (url, pollOptions) {
        return __awaiter(this, void 0, void 0, function () {
            var token, pollUrl, response, e_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, , 8, 9]);
                        _a.label = 1;
                    case 1:
                        if (!this.running) return [3 /*break*/, 7];
                        return [4 /*yield*/, this.getAccessToken()];
                    case 2:
                        token = _a.sent();
                        this.updateHeaderToken(pollOptions, token);
                        _a.label = 3;
                    case 3:
                        _a.trys.push([3, 5, , 6]);
                        pollUrl = url + "&_=" + Date.now();
                        this.logger.log(LogLevel.Trace, "(LongPolling transport) polling: " + pollUrl + ".  - (fy:\u957F\u8F6E\u8BE2\u4F20\u8F93 - polling)");
                        return [4 /*yield*/, this.request.get(this.url, {
                                _: Date.now()
                            }, pollOptions)];
                    case 4:
                        response = _a.sent();
                        if (response.statusCode === 204) {
                            this.logger.log(LogLevel.Information, "(LongPolling transport) Poll terminated by server. - (fy:长轮询传输 - 由服务器终止轮询。)");
                            this.running = false;
                        }
                        else if (response.statusCode !== 200) {
                            this.logger.log(LogLevel.Error, "(LongPolling transport) Unexpected response code: " + response.statusCode + ".  - (fy:\u957F\u8F6E\u8BE2\u4F20\u8F93 - \u610F\u5916\u7684\u54CD\u5E94\u4EE3\u7801)");
                            // Unexpected status code
                            this.closeError = new HttpError(response.errMsg || "", response.statusCode);
                            this.running = false;
                        }
                        else {
                            // Process the response
                            if (response.data) {
                                this.logger.log(LogLevel.Trace, "(LongPolling transport) data received. " + getDataDetail(response.data, this.logMessageContent) + ".");
                                if (this.onreceive) {
                                    this.onreceive(response.data);
                                }
                            }
                            else {
                                // This is another way timeout manifest.
                                this.logger.log(LogLevel.Trace, "(LongPolling transport) Poll timed out, reissuing.");
                            }
                        }
                        return [3 /*break*/, 6];
                    case 5:
                        e_1 = _a.sent();
                        if (!this.running) {
                            // Log but disregard errors that occur after stopping - fy: 记录但忽略停止后发生的错误
                            this.logger.log(LogLevel.Trace, "(LongPolling transport) Poll errored after shutdown: " + e_1.message);
                        }
                        else {
                            if (e_1 instanceof TimeoutError) {
                                // Ignore timeouts and reissue the poll. - 忽略超时并重新发出投票
                                this.logger.log(LogLevel.Trace, "(LongPolling transport) Poll timed out, reissuing.  - (fy:长轮询传输 - 请求超时)");
                            }
                            else {
                                // Close the connection with the error as the result.
                                this.closeError = e_1;
                                this.running = false;
                            }
                        }
                        return [3 /*break*/, 6];
                    case 6: return [3 /*break*/, 1];
                    case 7: return [3 /*break*/, 9];
                    case 8:
                        this.logger.log(LogLevel.Trace, "(LongPolling transport) Polling complete.   - (fy:长轮询传输 - 请求完成)");
                        // We will reach here with pollAborted==false when the server returned a response causing the transport to stop.
                        // If pollAborted==true then client initiated the stop and the stop method will raise the close event after DELETE is sent.
                        //当服务器返回导致传输停止的响应时，我们将使用pollAborted==false到达这里。
                        //如果pollAborted==true，则客户端启动了stop，stop方法将在发送DELETE后引发close事件。
                        if (!this.pollAborted) {
                            this.raiseOnClose();
                        }
                        return [7 /*endfinally*/];
                    case 9: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 发送轮询包
     *
     * @param {*} data
     * @returns {Promise<void>}
     * @memberof LongPollingTransport
     */
    LongPollingTransport.prototype.send = function (data) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                if (!this.running) {
                    return [2 /*return*/, Promise.reject(new Error("Cannot send until the transport is connected"))];
                }
                return [2 /*return*/, sendMessage(this.logger, "LongPolling", this.request, this.url, this.accessTokenFactory, data, this.logMessageContent)];
            });
        });
    };
    /**
     * 停止
     *
     * @returns {Promise<void>}
     * @memberof LongPollingTransport
     */
    LongPollingTransport.prototype.stop = function () {
        return __awaiter(this, void 0, void 0, function () {
            var deleteOptions, token, e_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.logger.log(LogLevel.Trace, "(LongPolling transport) Stopping polling.");
                        // Tell receiving loop to stop, abort any current request, and then wait for it to finish
                        this.running = false;
                        this.pollAbort.abort();
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 5, 6, 7]);
                        return [4 /*yield*/, this.receiving];
                    case 2:
                        _a.sent(); // 这里 receiving 本身是一个 promise result, 用这个对象来监控请求未完成
                        // Send DELETE to clean up long polling on the server
                        // 发送DELETE以清除服务器上的长轮询
                        this.logger.log(LogLevel.Trace, "(LongPolling transport) sending DELETE request to " + this.url + ".");
                        deleteOptions = {
                            headers: {}
                        };
                        return [4 /*yield*/, this.getAccessToken()];
                    case 3:
                        token = _a.sent();
                        this.updateHeaderToken(deleteOptions, token);
                        return [4 /*yield*/, this.request.delete(this.url, {}, deleteOptions)];
                    case 4:
                        _a.sent();
                        this.logger.log(LogLevel.Trace, "(LongPolling transport) DELETE request sent.");
                        return [2 /*return*/, Promise.resolve({
                                errMsg: "stop success"
                            })];
                    case 5:
                        e_2 = _a.sent();
                        this.logger.log(LogLevel.Error, "(LongPolling transport) Stop error.", e_2);
                        return [2 /*return*/, Promise.reject({
                                errMsg: "stop fail"
                            })];
                    case 6:
                        this.logger.log(LogLevel.Trace, "(LongPolling transport) Stop finished.");
                        // Raise close event here instead of in polling
                        // It needs to happen after the DELETE request is sent
                        //在此处引发关闭事件，而不是在轮询中
                        //它需要在发送删除请求后发生
                        this.raiseOnClose();
                        return [7 /*endfinally*/];
                    case 7: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 调用关闭回调
     *
     * @private
     * @memberof LongPollingTransport
     */
    LongPollingTransport.prototype.raiseOnClose = function () {
        if (this.onclose) {
            var logMessage = "(LongPolling transport) Firing onclose event.";
            if (this.closeError) {
                logMessage += " Error: " + this.closeError;
            }
            this.logger.log(LogLevel.Trace, logMessage);
            this.onclose(this.closeError);
        }
    };
    return LongPollingTransport;
}());
export { LongPollingTransport };

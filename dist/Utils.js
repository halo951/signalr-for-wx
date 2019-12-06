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
import { LogLevel } from "./ILogger";
import { NullLogger } from "./Loggers";
import { ResponseType } from "./wx-request/model/ResponseType";
/**
 * 参数处理方法
 *  @private
 */
var Arg = /** @class */ (function () {
    function Arg() {
    }
    /**
     * 是否存在
     *
     * @static
     * @param {*} val
     * @param {string} name
     * @memberof Arg
     */
    Arg.isRequired = function (val, name) {
        if (val === null || val === undefined) {
            throw new Error("The '" + name + "' argument is required.");
        }
    };
    /**
     * 是否包含
     *
     * @static
     * @param {*} val
     * @param {*} values
     * @param {string} name
     * @memberof Arg
     */
    Arg.isIn = function (val, values, name) {
        // TypeScript enums have keys for **both** the name and the value of each enum member on the type itself.
        if (!(val in values)) {
            throw new Error("Unknown " + name + " value: " + val + ".");
        }
    };
    /**
     * 验证url是否被微信支持
     */
    Arg.validationUrlIsSupportByWechat = function (url) {
        if (!url) {
            throw new Error("Url is undefined.");
        }
        else if (!/^(ws|wws):\/\//.test(url)) {
            if (/^http/.test(url)) {
                return url.replace(/^http/, "wx");
            }
            throw new Error("error: instantiation [url](" + url + ") not supported by wechat miniprogram.");
        }
        else {
            return url;
        }
    };
    return Arg;
}());
export { Arg };
/**
 * 获取data details
 * @param data origin data
 * @param includeContent 是否导出上下文?
 */
export function getDataDetail(data, includeContent) {
    var detail = "";
    if (isArrayBuffer(data)) {
        detail = "Binary data of length " + data.byteLength;
        if (includeContent) {
            detail += ". Content: '" + formatArrayBuffer(data) + "'";
        }
    }
    else if (typeof data === "string") {
        detail = "String data of length " + data.length;
        if (includeContent) {
            detail += ". Content: '" + data + "'";
        }
    }
    return detail;
}
/**
 * 格式化 array buffer
 * @private
 */
export function formatArrayBuffer(data) {
    var view = new Uint8Array(data);
    // Uint8Array.map only supports returning another Uint8Array?
    var str = "";
    view.forEach(function (num) {
        var pad = num < 16 ? "0" : "";
        str += "0x" + pad + num.toString(16) + " ";
    });
    // Trim of trailing space.
    return str.substr(0, str.length - 1);
}
// Also in signalr-protocol-msgpack/Utils.ts
/**
 * 判断是不是 ArrayBuffer
 * @private
 */
export function isArrayBuffer(val) {
    return (val &&
        typeof ArrayBuffer !== "undefined" &&
        (val instanceof ArrayBuffer ||
            // Sometimes we get an ArrayBuffer that doesn't satisfy instanceof
            (val.constructor && val.constructor.name === "ArrayBuffer")));
}
/**
 * 发送消息
 * @param logger 日志工具
 * @param transportName
 * @param request  - 注: 原版代码为 httpClient,这里使用 wx-request.
 * @param url
 * @param accessTokenFactory
 * @param content
 * @param logMessageContent
 */
export function sendMessage(logger, transportName, request, url, accessTokenFactory, content, logMessageContent) {
    return __awaiter(this, void 0, void 0, function () {
        var _a, headers, token, responseType, response;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    if (!accessTokenFactory) return [3 /*break*/, 2];
                    return [4 /*yield*/, accessTokenFactory()];
                case 1:
                    token = _b.sent();
                    if (token) {
                        headers = (_a = {},
                            _a["Authorization"] = "Bearer " + token,
                            _a);
                    }
                    _b.label = 2;
                case 2:
                    logger.log(LogLevel.Trace, "(" + transportName + " transport) sending data. " + getDataDetail(content, logMessageContent) + ".");
                    responseType = isArrayBuffer(content) ? ResponseType.ARRAY_BUFFER : ResponseType.TEXT;
                    return [4 /*yield*/, request.post(url, content, {
                            headers: headers,
                            responseType: responseType
                        })];
                case 3:
                    response = _b.sent();
                    logger.log(LogLevel.Trace, "(" + transportName + " transport) request complete. Response status: " + response.statusCode + ".");
                    return [2 /*return*/];
            }
        });
    });
}
/**
 * 创建一个 logger
 * @private
 */
export function createLogger(logger) {
    if (logger === undefined) {
        return new ConsoleLogger(LogLevel.Information);
    }
    if (logger === null) {
        return NullLogger.instance;
    }
    if (logger.log) {
        return logger;
    }
    return new ConsoleLogger(logger);
}
/**
 * 订阅接口实现
 * @private
 */
var Subject = /** @class */ (function () {
    function Subject(cancelCallback) {
        this.observers = [];
        this.cancelCallback = cancelCallback;
    }
    Subject.prototype.next = function (item) {
        for (var _i = 0, _a = this.observers; _i < _a.length; _i++) {
            var observer = _a[_i];
            observer.next(item);
        }
    };
    Subject.prototype.error = function (err) {
        for (var _i = 0, _a = this.observers; _i < _a.length; _i++) {
            var observer = _a[_i];
            if (observer.error) {
                observer.error(err);
            }
        }
    };
    Subject.prototype.complete = function () {
        for (var _i = 0, _a = this.observers; _i < _a.length; _i++) {
            var observer = _a[_i];
            if (observer.complete) {
                observer.complete();
            }
        }
    };
    Subject.prototype.subscribe = function (observer) {
        this.observers.push(observer);
        return new SubjectSubscription(this, observer);
    };
    return Subject;
}());
export { Subject };
/**
 * 主题订阅??
 * 应该时定制 断开流 的 实现吧.
 * @private
 */
var SubjectSubscription = /** @class */ (function () {
    function SubjectSubscription(subject, observer) {
        this.subject = subject;
        this.observer = observer;
    }
    SubjectSubscription.prototype.dispose = function () {
        var index = this.subject.observers.indexOf(this.observer);
        if (index > -1) {
            this.subject.observers.splice(index, 1);
        }
        if (this.subject.observers.length === 0) {
            this.subject.cancelCallback().catch(function (_) { });
        }
    };
    return SubjectSubscription;
}());
export { SubjectSubscription };
/**
 * console logger 内置实现
 * @private
 */
var ConsoleLogger = /** @class */ (function () {
    /**
     * 构造方法 定义 最小输出日志等级
     * @param {LogLevel} minimumLogLevel
     * @memberof ConsoleLogger
     */
    function ConsoleLogger(minimumLogLevel) {
        this.minimumLogLevel = minimumLogLevel;
    }
    /**
     * 日志输出
     *
     * @param {LogLevel} logLevel
     * @param {string} message
     * @memberof ConsoleLogger
     */
    ConsoleLogger.prototype.log = function () {
        var msg = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            msg[_i] = arguments[_i];
        }
        var logLevel = LogLevel.Information;
        for (var _a = 0, _b = arguments; _a < _b.length; _a++) {
            var ll = _b[_a];
            if (Object.values(LogLevel).indexOf(ll) != -1) {
                logLevel = ll;
                break;
            }
        }
        if (logLevel >= this.minimumLogLevel) {
            switch (logLevel) {
                case LogLevel.Critical:
                case LogLevel.Error:
                    console.error.apply(console, ["[" + new Date().toISOString() + "] " + LogLevel[logLevel] + " =>"].concat(msg.slice(1, msg.length)));
                    break;
                case LogLevel.Warning:
                    console.warn.apply(console, ["[" + new Date().toISOString() + "] " + LogLevel[logLevel] + " =>"].concat(msg));
                    break;
                case LogLevel.Information:
                    console.info.apply(console, ["[" + new Date().toISOString() + "] " + LogLevel[logLevel] + " =>"].concat(msg));
                    break;
                default:
                    // console.debug only goes to attached debuggers in Node, so we use console.log for Trace and Debug
                    console.log.apply(console, ["[" + new Date().toISOString() + "] " + LogLevel[logLevel] + " =>"].concat(msg));
                    break;
            }
        }
    };
    return ConsoleLogger;
}());
export { ConsoleLogger };

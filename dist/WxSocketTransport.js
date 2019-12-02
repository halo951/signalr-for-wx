// Copyright (c) .NET Foundation. All rights reserved.
// Licensed under the Apache License, Version 2.0. See License.txt in the project root for license information.
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
import { LogLevel } from "./ILogger";
import { Arg, getDataDetail } from "./Utils";
import { WxSocketReadyState } from "./Polyfills";
import { isVersionSupport } from "./WechatVersionDiff";
/**
 * 微信 sosocket 数据传输
 * @description 整体重写了这部分websocket支持,逻辑这样看起来合理一些
 */
var WxSocketTransport = /** @class */ (function () {
    function WxSocketTransport(options) {
        this.readyState = WxSocketReadyState.CONNECTING;
        this.logger = options.logger;
        this.accessTokenFactory = options.accessTokenFactory;
        this.logMessageContent = options.logMessageContent;
        this.onreceive = null;
        this.onclose = null;
        this.allowReplaceSocket = options.allowReplaceSocket;
        this.timeout = options.timeout ? options.timeout : 60 * 1000;
        this.delayTime = options.delayTime ? options.delayTime : 100;
        if (options.enableMessageQueue) {
            this.enableMessageQueue = true;
            this.messageQueue = [];
        }
        else {
            this.enableMessageQueue = false;
        }
        if (options.reconnect) {
            this.reconnect = {
                enable: options.reconnect.enable == true ? true : false,
                max: options.reconnect.max ? options.reconnect.max : 3,
                val: 0
            };
        }
        else {
            this.reconnect = {
                enable: false,
                max: 3,
                val: 0
            };
        }
    }
    WxSocketTransport.prototype.connect = function (options) {
        return __awaiter(this, void 0, void 0, function () {
            var token;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        // vali is exists
                        Arg.isRequired(options, "options");
                        // vali url is support by wechat
                        Arg.validationUrlIsSupportByWechat(options.url);
                        this.connectOptions = options; // 连接参数缓存
                        this.logger.log(LogLevel.Trace, "(WebSockets transport) Connecting.");
                        if (!this.accessTokenFactory) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.accessTokenFactory()];
                    case 1:
                        token = _a.sent();
                        if (token) {
                            options.url += (options.url.indexOf("?") < 0 ? "?" : "&") + ("access_token=" + encodeURIComponent(token));
                        }
                        _a.label = 2;
                    case 2: return [2 /*return*/, new Promise(function (resolve, reject) {
                            // 忽略url修正,因为传入错误url的话,将直接抛出异常
                            // options.url = options.url.replace(/^http/, "ws");
                            // 这里执行的是连接操socket的逻辑
                            var socketTask;
                            // 1.7.0 及以上版本，最多可以同时存在 5 个 WebSocket 连接, 以下版本，一个小程序同时只能有一个 WebSocket 连接，如果当前已存在一个 WebSocket 连接，会自动关闭该连接，并重新创建一个 WebSocket 连接
                            var supportCount = isVersionSupport("1.7.0") ? 5 : 1;
                            if (supportCount <= WxSocketTransport.count && !_this.allowReplaceSocket) {
                                // 抛出异常, 并return
                                reject({
                                    errMsg: "Maximum connections|" + WxSocketTransport.count
                                });
                                return;
                            }
                            else if (WxSocketTransport.count == 5) {
                                // 抛出异常, 并return
                                reject({
                                    errMsg: "Maximum connections|" + WxSocketTransport.count
                                });
                                return;
                            }
                            if (!socketTask) {
                                socketTask = wx.connectSocket(__assign({ 
                                    // 传入 两个默认的 回调,当然也可以在 options 里面覆盖 使用自定义回调.
                                    success: function (res) { return resolve(res); }, fail: function (res) { return reject(res); } }, options));
                            }
                            // ! 因为小程序两种协议都支持,所以不需要指定特定的 binaryType
                            /** 连接成功处理 */
                            socketTask.onOpen(function (result) { return __awaiter(_this, void 0, void 0, function () {
                                var _i, _a, msg;
                                return __generator(this, function (_b) {
                                    switch (_b.label) {
                                        case 0:
                                            WxSocketTransport.count += 1;
                                            this.readyState = WxSocketReadyState.OPEN;
                                            this.logger.log(LogLevel.Debug, "wx.connectSocket success message:" + JSON.stringify(result, null, 2));
                                            this.logger.log(LogLevel.Information, "WebSocket connected to " + options.url + ".");
                                            this.socketTask = socketTask;
                                            // 等待回调执行完成后,再重新队列中消息
                                            return [4 /*yield*/, resolve()];
                                        case 1:
                                            // 等待回调执行完成后,再重新队列中消息
                                            _b.sent();
                                            if (!(this.enableMessageQueue && this.messageQueue.length > 0)) return [3 /*break*/, 5];
                                            _i = 0, _a = this.messageQueue;
                                            _b.label = 2;
                                        case 2:
                                            if (!(_i < _a.length)) return [3 /*break*/, 5];
                                            msg = _a[_i];
                                            return [4 /*yield*/, this.send(msg)];
                                        case 3:
                                            _b.sent();
                                            _b.label = 4;
                                        case 4:
                                            _i++;
                                            return [3 /*break*/, 2];
                                        case 5: return [2 /*return*/];
                                    }
                                });
                            }); });
                            /** 建立连接出错处理 */
                            socketTask.onError(function (res) {
                                _this.readyState = WxSocketReadyState.CLOSED;
                                if (_this.reconnect.enable && _this.reconnect.val < _this.reconnect.max) {
                                    _this.reconnect.val += 1;
                                    _this.connect(options)
                                        .then(function (res) {
                                        _this.reconnect.val = 0;
                                        resolve(res);
                                    })
                                        .catch(function (res) { return reject(res); });
                                }
                                else {
                                    reject(res);
                                }
                            });
                            /** 接收到消息处理 */
                            socketTask.onMessage(function (res) {
                                _this.logger.log(LogLevel.Trace, "(WebSockets transport) data received. " + getDataDetail(res.data, _this.logMessageContent) + ".");
                                if (_this.onreceive) {
                                    _this.onreceive(res.data);
                                }
                            });
                            socketTask.onClose(function (res) { return _this.close(res); });
                        })];
                }
            });
        });
    };
    /** 休眠 */
    WxSocketTransport.prototype.delay = function () {
        var _this = this;
        return new Promise(function (resolve) {
            // ! 由于小程序机制,所以需要手工清理timer
            var timer = setTimeout(function () {
                clearTimeout(timer);
                resolve();
            }, _this.delayTime);
        });
    };
    /** 发送 */
    WxSocketTransport.prototype.send = function (data) {
        return __awaiter(this, void 0, void 0, function () {
            var loop;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!(this.socketTask && this.readyState === WxSocketReadyState.OPEN)) return [3 /*break*/, 1];
                        this.logger.log(LogLevel.Trace, "(WebSockets transport) sending data. " + getDataDetail(data, this.logMessageContent) + ".");
                        this.socketTask.send(data);
                        return [2 /*return*/, Promise.resolve()];
                    case 1:
                        if (!this.enableMessageQueue) return [3 /*break*/, 5];
                        this.messageQueue.push(data);
                        loop = 0;
                        _a.label = 2;
                    case 2:
                        if (!(this.socketTask && this.readyState !== WxSocketReadyState.OPEN)) return [3 /*break*/, 4];
                        return [4 /*yield*/, this.delay()];
                    case 3:
                        _a.sent();
                        loop += this.delayTime;
                        if (loop >= this.timeout) {
                            // 超时设置
                            return [2 /*return*/, Promise.reject({
                                    errMsg: "WebSocket connect timeout."
                                })];
                        }
                        return [3 /*break*/, 2];
                    case 4: 
                    // 回调
                    return [2 /*return*/, Promise.resolve()];
                    case 5: return [2 /*return*/, Promise.reject({
                            errMsg: "WebSocket is not in the OPEN state"
                        })];
                }
            });
        });
    };
    /** 停止 */
    WxSocketTransport.prototype.stop = function () {
        var _this = this;
        return new Promise(function (resolve, reject) {
            if (_this.socketTask) {
                _this.socketTask.close({
                    code: 1000,
                    reason: "stop socket",
                    success: function (res) { return resolve(res); },
                    fail: function (res) { return reject(res); }
                });
            }
        });
    };
    /**
     * 连接断开处理
     * @param res
     */
    WxSocketTransport.prototype.close = function (res) {
        // webSocket will be null if the transport did not start successfully
        this.logger.log(LogLevel.Trace, "(WebSockets transport) socket closed.");
        WxSocketTransport.count = WxSocketTransport.count > 0 ? WxSocketTransport.count - 1 : 0;
        if (this.onclose) {
            if (res && res.code !== 1000) {
                // ! 异常断开加入,默认的重连逻辑,如果不想用的话,需要重新实现 WxSocketTransport
                if (this.reconnect.enable) {
                    // 尝试重连
                    this.connect(this.connectOptions);
                }
                else {
                    this.onclose(new Error("WebSocket closed with status code: " + res.code + " (" + res.reason + ")."));
                }
            }
            else {
                this.onclose();
            }
        }
    };
    /**
     * 静态变量 - 表示当前是否有正在连接中的socket
     */
    WxSocketTransport.count = 0;
    return WxSocketTransport;
}());
export { WxSocketTransport };

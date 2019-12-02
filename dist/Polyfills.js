/**
 * 小程序socket连接状态[枚举]
 */
export var WxSocketReadyState;
(function (WxSocketReadyState) {
    WxSocketReadyState[WxSocketReadyState["CONNECTING"] = 0] = "CONNECTING";
    WxSocketReadyState[WxSocketReadyState["OPEN"] = 1] = "OPEN";
    WxSocketReadyState[WxSocketReadyState["CLOSING"] = 2] = "CLOSING";
    WxSocketReadyState[WxSocketReadyState["CLOSED"] = 3] = "CLOSED";
})(WxSocketReadyState || (WxSocketReadyState = {}));

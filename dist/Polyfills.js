// 版权所有（c）.NET基金会。保留所有权利。
// 在2.0版Apache许可下授权。有关许可证信息，请参见项目根目录中的License.txt
// Not exported from index
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

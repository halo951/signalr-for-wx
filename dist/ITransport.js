// 版权所有（c）.NET基金会。保留所有权利。
// 在2.0版Apache许可下授权。有关许可证信息，请参见项目根目录中的License.txt。
//这在将来会被当作一个位标志，所以我们使用两个值的幂来保持它。
/**指定特定的HTTP传输类型。*/
export var HttpTransportType;
(function (HttpTransportType) {
    /**未指定传输首选项。*/
    HttpTransportType[HttpTransportType["None"] = 0] = "None";
    /**指定WebSocket传输。*/
    HttpTransportType[HttpTransportType["WebSockets"] = 1] = "WebSockets";
    /**指定服务器发送的事件传输。*/
    HttpTransportType[HttpTransportType["ServerSentEvents"] = 2] = "ServerSentEvents";
    /**指定长轮询传输。*/
    HttpTransportType[HttpTransportType["LongPolling"] = 4] = "LongPolling";
})(HttpTransportType || (HttpTransportType = {}));
/**指定连接的传输格式。*/
export var TransferFormat;
(function (TransferFormat) {
    /**指定仅通过连接传输文本数据。*/
    TransferFormat[TransferFormat["Text"] = 1] = "Text";
    /**指定将通过连接传输二进制数据。*/
    TransferFormat[TransferFormat["Binary"] = 2] = "Binary";
})(TransferFormat || (TransferFormat = {}));

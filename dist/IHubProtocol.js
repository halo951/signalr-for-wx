// 版权所有（c）.NET基金会。保留所有权利。
// 在2.0版Apache许可下授权。有关许可证信息，请参见项目根目录中的License.txt。
/* 定义消息的类型[枚举] */
export var MessageType;
(function (MessageType) {
    /**
     * - 指示消息是一个 `调用消息` 并实现 {@link @aspnet/signalr.InvocationMessage} 接口。
     */
    MessageType[MessageType["Invocation"] = 1] = "Invocation";
    /**
     * - 指示消息是一个 `流消息` 并实现 {@link @aspnet/signalr.StreamItemMessage} 接口。
     */
    MessageType[MessageType["StreamItem"] = 2] = "StreamItem";
    /**
     * - 指示消息是一个 `完成消息` 并实现 {@link @aspnet/signalr.CompletionMessage} 接口。
     */
    MessageType[MessageType["Completion"] = 3] = "Completion";
    /**
     * - 指示消息是一个 `流调用消息` 并实现 {@link @aspnet/signalr.StreamInvocationMessage} 接口。
     */
    MessageType[MessageType["StreamInvocation"] = 4] = "StreamInvocation";
    /**
     * - 指示消息是一个 `取消调用消息` 并实现 {@link @aspnet/signalr.CancelInvocationMessage} 接口。
     */
    MessageType[MessageType["CancelInvocation"] = 5] = "CancelInvocation";
    /**
     * - 指示消息是一个 `Ping消息` 并实现 {@link @aspnet/signalr.PingMessage} 接口。
     */
    MessageType[MessageType["Ping"] = 6] = "Ping";
    /**
     * - 指示消息是一个 `关闭消息` 并实现 {@link @aspnet/signalr.CloseMessage} 接口。
     */
    MessageType[MessageType["Close"] = 7] = "Close";
})(MessageType || (MessageType = {}));

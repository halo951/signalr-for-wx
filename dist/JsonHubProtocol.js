// 版权所有（c）.NET基金会。保留所有权利。
// 在2.0版Apache许可下授权。有关许可证信息，请参见项目根目录中的License.txt。
import { MessageType } from "./IHubProtocol";
import { LogLevel } from "./ILogger";
import { TransferFormat } from "./ITransport";
import { NullLogger } from "./Loggers";
import { TextMessageFormat } from "./TextMessageFormat";
var JSON_HUB_PROTOCOL_NAME = "json";
/** Implements the JSON Hub Protocol. */
var JsonHubProtocol = /** @class */ (function () {
    function JsonHubProtocol() {
        /** @inheritDoc */
        this.name = JSON_HUB_PROTOCOL_NAME;
        /** @inheritDoc */
        this.version = 1;
        /** @inheritDoc */
        this.transferFormat = TransferFormat.Text;
    }
    /**
     * Creates an array of {@link @aspnet/signalr.HubMessage} objects from the specified serialized representation.
     * 从指定的序列化表示创建{@link@aspnet/signaler.HubMessage}对象数组
     *
     * @param {string} input 包含序列化表示的字符串 A string containing the serialized representation.
     * @param {ILogger} logger
     */
    JsonHubProtocol.prototype.parseMessages = function (input, logger) {
        // 接口允许传入“ArrayBuffer”，但此实现不允许。所以让我们抛出一个有用的错误
        if (typeof input !== "string") {
            throw new Error("Invalid input for JSON hub protocol. Expected a string. (fy:包含一个无效的JSON协议输入,但是这里需要输入string 消息)");
        }
        // fixed
        if (!input) {
            return [];
        }
        // fixed
        if (logger === null) {
            logger = NullLogger.instance;
        }
        // string 类型消息格式化转换
        var messages = TextMessageFormat.parse(input);
        var hubMessages = [];
        for (var _i = 0, messages_1 = messages; _i < messages_1.length; _i++) {
            var message = messages_1[_i];
            // 转换消息
            var parsedMessage = JSON.parse(message);
            if (typeof parsedMessage.type !== "number") {
                throw new Error("Invalid payload. (fy: 无效的消息)");
            }
            switch (parsedMessage.type) {
                case MessageType.Invocation: // 调用命令
                    this.isInvocationMessage(parsedMessage);
                    break;
                case MessageType.StreamItem: // 流消息
                    this.isStreamItemMessage(parsedMessage);
                    break;
                case MessageType.Completion: // 完成消息
                    this.isCompletionMessage(parsedMessage);
                    break;
                case MessageType.Ping: // ping 命令
                    // Single value, no need to validate
                    break;
                case MessageType.Close: // 关闭命令
                    // All optional values, no need to validate
                    break;
                default: // 未定义命令,抛出异常
                    // Future protocol changes can add message types, old clients can ignore them
                    logger.log(LogLevel.Information, "Unknown message type '" + parsedMessage.type + "' ignored.");
                    continue;
            }
            hubMessages.push(parsedMessage);
        }
        return hubMessages;
    };
    /**
     * Writes the specified {@link @aspnet/signalr.HubMessage} to a string and returns it.
     * 将指定的{@link@aspnet/signalr.HubMessage}写入字符串并返回
     *
     * @param {HubMessage} message The message to write. 消息内容
     * @returns {string} 包含消息的序列化表示形式的字符串。
     */
    JsonHubProtocol.prototype.writeMessage = function (message) {
        return TextMessageFormat.write(JSON.stringify(message));
    };
    /**
     * 判断是否是一个正常的调用消息
     * @param message
     */
    JsonHubProtocol.prototype.isInvocationMessage = function (message) {
        this.assertNotEmptyString(message.target, "Invalid payload for Invocation message.");
        if (message.invocationId !== undefined) {
            this.assertNotEmptyString(message.invocationId, "Invalid payload for Invocation message. (fy:无效的 [调用] 消息)");
        }
    };
    /**
     * 判断是否是一个流消息子项
     * @param message
     */
    JsonHubProtocol.prototype.isStreamItemMessage = function (message) {
        this.assertNotEmptyString(message.invocationId, "Invalid payload for StreamItem message. (fy:无效的 [StreamItem] 消息)");
        if (message.item === undefined) {
            throw new Error("Invalid payload for StreamItem message. (fy:无效的 [StreamItem] 消息)");
        }
    };
    /**
     * 判断是否是一个完整的消息
     * @param message
     */
    JsonHubProtocol.prototype.isCompletionMessage = function (message) {
        if (message.result && message.error) {
            throw new Error("Invalid payload for Completion message (fy:消息不完整).");
        }
        if (!message.result && message.error) {
            this.assertNotEmptyString(message.error, "Invalid payload for Completion message (fy:消息不完整).");
        }
        this.assertNotEmptyString(message.invocationId, "Invalid payload for Completion message (fy:消息不完整).");
    };
    /**
     * 断言非空字符串
     * @param value
     * @param errorMessage
     */
    JsonHubProtocol.prototype.assertNotEmptyString = function (value, errorMessage) {
        if (typeof value !== "string" || value === "") {
            throw new Error(errorMessage);
        }
    };
    return JsonHubProtocol;
}());
export { JsonHubProtocol };

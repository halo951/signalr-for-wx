// 版权所有（c）.NET基金会。保留所有权利。
// 在2.0版Apache许可下授权。有关许可证信息，请参见项目根目录中的License.txt。

import { ILogger } from "./ILogger";
import { TransferFormat } from "./ITransport";

/* 定义消息的类型[枚举] */
export enum MessageType {
    /**
     * - 指示消息是一个 `调用消息` 并实现 {@link @aspnet/signalr.InvocationMessage} 接口。
     */
    Invocation = 1,
    /**
     * - 指示消息是一个 `流消息` 并实现 {@link @aspnet/signalr.StreamItemMessage} 接口。
     */
    StreamItem = 2,
    /**
     * - 指示消息是一个 `完成消息` 并实现 {@link @aspnet/signalr.CompletionMessage} 接口。
     */
    Completion = 3,
    /**
     * - 指示消息是一个 `流调用消息` 并实现 {@link @aspnet/signalr.StreamInvocationMessage} 接口。
     */
    StreamInvocation = 4,
    /**
     * - 指示消息是一个 `取消调用消息` 并实现 {@link @aspnet/signalr.CancelInvocationMessage} 接口。
     */
    CancelInvocation = 5,
    /**
     * - 指示消息是一个 `Ping消息` 并实现 {@link @aspnet/signalr.PingMessage} 接口。
     */
    Ping = 6,
    /**
     * - 指示消息是一个 `关闭消息` 并实现 {@link @aspnet/signalr.CloseMessage} 接口。
     */
    Close = 7
}

/* 定义字符串键和字符串值的字典，这些字符串值表示附加到中心消息的头。 */
export interface MessageHeaders {
    /** 
     * 获取或设置具有指定键的头
     */
    [key: string]: string;
}

/* 所有已知消息的类型[枚举] */
export type HubMessage =
    InvocationMessage |
    StreamInvocationMessage |
    StreamItemMessage |
    CompletionMessage |
    CancelInvocationMessage |
    PingMessage |
    CloseMessage;

/** 定义所有消息通用的属性[枚举引用]. */
export interface HubMessageBase {
    /**
     * 一个 {@link @aspnet/signalr.MessageType} 值，指示此消息的类型。
     */
    readonly type: MessageType;
}

/* 定义与特定调用相关的所有流消息的公共属性。 */
export interface HubInvocationMessage extends HubMessageBase {
    /**
     * origin: A {@link @aspnet/signalr.MessageHeaders} dictionary containing headers attached to the message.
     * 包含附加到邮件的邮件头的{@link@aspnet/signaler.MessageHeaders}字典。
     */
    readonly headers?: MessageHeaders;
    /** 与此消息相关的调用的ID.
     *
     * @origin
     * This is expected to be present for {@link @aspnet/signalr.StreamInvocationMessage} and {@link @aspnet/signalr.CompletionMessage}. It may
     * be 'undefined' for an {@link @aspnet/signalr.InvocationMessage} if the sender does not expect a response.
     * 
     * @fanyi
     * 这应该存在于{@link@aspnet/signaler.StreamInvocationMessage}和{@link@aspnet/signaler.CompletionMessage}。它可能
     * 对于{@link@aspnet/signaler.InvocationMessage}，如果发件人不需要响应，则为“未定义”。
     * 
     */
    readonly invocationId?: string;
}

/* 表示非流调用的消息[枚举引用]. */
export interface InvocationMessage extends HubInvocationMessage {
    /** @inheritDoc */
    readonly type: MessageType.Invocation;
    /** 目标方法名. */
    readonly target: string;
    /** 目标方法入参. */
    readonly arguments: any[];
}

/** 表示流调用的流消息. */
export interface StreamInvocationMessage extends HubInvocationMessage {
    /** @inheritDoc */
    readonly type: MessageType.StreamInvocation;

    /** 调用 ID. */
    readonly invocationId: string;
    /** 目标方法名. */
    readonly target: string;
    /** 目标方法入参. */
    readonly arguments: any[];
}

/** 表示作为结果流一部分生成的单个项的流消息. */
export interface StreamItemMessage extends HubInvocationMessage {
    /** @inheritDoc */
    readonly type: MessageType.StreamItem;

    /** 调用 ID. */
    readonly invocationId: string;

    /** 服务器生成项. */
    readonly item?: any;
}

/** 表示调用结果的流消息. */
export interface CompletionMessage extends HubInvocationMessage {
    /** @inheritDoc */
    readonly type: MessageType.Completion;
    /** 调用 ID. */
    readonly invocationId: string;
    /** 调用产生的错误（如果有）。
     *
     * 或者 {@link @aspnet/signalr.CompletionMessage.error} or {@link @aspnet/signalr.CompletionMessage.result} 必须定义，但不能同时定义
     */
    readonly error?: string;
    /** The result produced by the invocation, if any.
     *
     * 或者 {@link @aspnet/signalr.CompletionMessage.error} or {@link @aspnet/signalr.CompletionMessage.result} 必须定义，但不能同时定义
     */
    readonly result?: any;
}

/** 指示发件人仍处于活动状态的中心消息. */
export interface PingMessage extends HubMessageBase {
    /** @inheritDoc */
    readonly type: MessageType.Ping;
}

/** 指示发送方正在关闭连接的流消息.
 *
 * 如果 {@link @aspnet/signalr.CloseMessage.error} 是定义过的, 发送者关闭链接就是个错...
 */
export interface CloseMessage extends HubMessageBase {
    /** @inheritDoc */
    readonly type: MessageType.Close;
    /** 调用产生的错误（如果有）。
     *
     * If this property is undefined, the connection was closed normally and without error.
     * 如果这个属性是 `undefined`,那么这个链接是正常关闭的.
     */
    readonly error?: string;
}

/* 发送取消流调用的流消息 */
export interface CancelInvocationMessage extends HubInvocationMessage {
    /** @inheritDoc */
    readonly type: MessageType.CancelInvocation;
    /** 调用 ID. */
    readonly invocationId: string;
}

/** 一个抽象的 signalr 通信协议.  */
export interface IHubProtocol {
    /** 协议的名称。signaler使用它来解析客户端和服务器之间的协议. */
    readonly name: string;
    /** 版本号. */
    readonly version: number;
    /** 通过{@link @aspnet/signalr.TransferFormat}格式化协议内容 */
    readonly transferFormat: TransferFormat;

    /** 
     * Creates an array of {@link @aspnet/signalr.HubMessage} objects from the specified serialized representation.
     * 创建一个 用来表示 {@link @aspnet/signalr.HubMessage} 对象的序列化数组
     * 
     * If {@link @aspnet/signalr.IHubProtocol.transferFormat} is 'Text', the `input` parameter must be a string, otherwise it must be an ArrayBuffer.
     * 如果 {@link @aspnet/signalr.IHubProtocol.transferFormat} 是`Text`,那么 `input` 参数必须是字符串,否则它必须是一个 `ArrayBuffer`.
     * 
     * @param {string | ArrayBuffer} input | 输入 必须是一个字符串或者是一个序列化过的 ArrayBuffer.
     * @param {ILogger} logger 日志工具
     */
    parseMessages(input: string | ArrayBuffer, logger: ILogger): HubMessage[];

    /** 
     * Writes the specified {@link @aspnet/signalr.HubMessage} to a string or ArrayBuffer and returns it.
     * 将指定的 {@link @aspnet/signalr.HubMessage}写入字符串或ArrayBuffer并返回它。
     * 
     * If {@link @aspnet/signalr.IHubProtocol.transferFormat} is 'Text', the result of this method will be a string, otherwise it will be an ArrayBuffer.
     * 如果 {@link @aspnet/signalr.IHubProtocol.transferFormat} 是`Text`,那么 `input` 参数必须是字符串,否则它必须是一个 `ArrayBuffer`.
     *
     * @param {HubMessage} message 消息体.
     * @returns {string | ArrayBuffer} 包含消息的序列化表示形式的字符串或ArrayBuffer。
     */
    writeMessage(message: HubMessage): string | ArrayBuffer;
}

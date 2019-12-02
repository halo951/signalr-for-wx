/** The version of the SignalR client. */
export declare const VERSION: string;
export { AbortSignal } from "./AbortController";
export { MessageType, MessageHeaders, HubMessage, HubMessageBase, HubInvocationMessage, InvocationMessage, StreamInvocationMessage, StreamItemMessage, CompletionMessage, PingMessage, CloseMessage, CancelInvocationMessage, IHubProtocol } from "./IHubProtocol";
export { JsonHubProtocol } from "./JsonHubProtocol";
export { HubConnectionBuilder } from "./HubConnectionBuilder";
export { HubConnection, HubConnectionState } from "./HubConnection";
export { isVersionSupport } from "./WechatVersionDiff";
export { WxSocketTransport } from "./WxSocketTransport";
export { Request } from "./wx-request/index";
export { RequestConfig, RequestMethod, RequestOption, ResponseOptions, ResponseType } from "./wx-request/model";
export { AbortError, HttpError, TimeoutError } from "./Errors";
export { ILogger, LogLevel } from "./ILogger";
export { HttpTransportType, TransferFormat, ITransport } from "./ITransport";
export { IStreamSubscriber, IStreamResult, ISubscription } from "./Stream";
export { IHttpConnectionOptions } from "./IHttpConnectionOptions";

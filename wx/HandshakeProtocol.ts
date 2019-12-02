// 版权所有（c）.NET基金会。保留所有权利。
// 在2.0版Apache许可下授权。有关许可证信息，请参见项目根目录中的License.txt。

import { TextMessageFormat } from "./TextMessageFormat";
import { isArrayBuffer } from "./Utils";

/** 
 * 握手消息 - request
 * @private
 */
export interface HandshakeRequestMessage {
    readonly protocol: string;
    readonly version: number;
}

/** 
 * 握手消息 - response
 * @private
 */
export interface HandshakeResponseMessage {
    readonly error: string;
    readonly minorVersion: number;
}

/** 
 * 握手协议
 * @private
 */
export class HandshakeProtocol {
    // Handshake request is always JSON - 握手请求总是JSON
    public writeHandshakeRequest(handshakeRequest: HandshakeRequestMessage): string {
        // commond
        return TextMessageFormat.write(JSON.stringify(handshakeRequest));
    }
    /**
     * 解析握手协议 response
     *
     * @param {*} data
     * @returns {[any, HandshakeResponseMessage]}
     * @memberof HandshakeProtocol
     */
    public parseHandshakeResponse(data: any): [any, HandshakeResponseMessage] {
        let responseMessage: HandshakeResponseMessage;
        let messageData: string;
        let remainingData: any;
        // ! 删除了 @aspnet/signlaR 原有的 Buffer(仅适用 nodejs)判断
        if (isArrayBuffer(data)) {
            // Format is binary but still need to read JSON text from handshake response - fy: 格式是二进制的，但仍然需要从握手响应中读取JSON文本
            const binaryData = new Uint8Array(data);
            const separatorIndex = binaryData.indexOf(TextMessageFormat.RecordSeparatorCode);
            if (separatorIndex === -1) {
                throw new Error("Message is incomplete.");
            }

            // content before separator is handshake response - fy:分隔符前的内容是握手响应
            // optional content after is additional messages - fy:后面是附加消息的可选内容
            const responseLength = separatorIndex + 1;
            messageData = String.fromCharCode.apply(null, binaryData.slice(0, responseLength));
            remainingData = (binaryData.byteLength > responseLength) ? binaryData.slice(responseLength).buffer : null;
        } else {
            const textData: string = data;
            const separatorIndex = textData.indexOf(TextMessageFormat.RecordSeparator);
            if (separatorIndex === -1) {
                throw new Error("Message is incomplete.");
            }

            // content before separator is handshake response - fy:分隔符前的内容是握手响应
            // optional content after is additional messages - fy:后面是附加消息的可选内容
            const responseLength = separatorIndex + 1;
            messageData = textData.substring(0, responseLength);
            remainingData = (textData.length > responseLength) ? textData.substring(responseLength) : null;
        }

        // At this point we should have just the single handshake message - fy: 在这一点上，我们应该只有一个握手信息
        const messages = TextMessageFormat.parse(messageData);
        const response = JSON.parse(messages[0]);
        if (response.type) {
            throw new Error("Expected a handshake response from the server. -(fy: 需要来自服务器的握手响应)");
        }
        responseMessage = response;

        // multiple messages could have arrived with handshake - fy: 握手时可能会收到多条消息
        // return additional data to be parsed as usual, or null if all parsed - fy: 返回要像往常一样分析的其他数据，如果所有数据都已分析，则返回null
        return [remainingData, responseMessage];
    }
}


/**
 * 响应数据类型
 *
 * @interface ResponseType
 */
export enum ResponseType {
    /**
     * JSON 类型
     */
    JSON = "json",
    /**
     * 文本类型(跳过返回数据处理链,直接返回)
     */
    TEXT = "text",
    /**
     * 二进制数据
     */
    ARRAY_BUFFER = "arraybuffer"
}
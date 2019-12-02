// 版权所有（c）.NET基金会。保留所有权利。
// 在2.0版Apache许可下授权。有关许可证信息，请参见项目根目录中的License.txt。

// 未从索引导出
/**
 * 文本类型消息格式化
 * @private
 */
export class TextMessageFormat {
    /**
     * 记录分隔符 code
     *
     * @static
     * @memberof TextMessageFormat
     */
    public static RecordSeparatorCode = 0x1e;
    /**
     * 记录分隔符(string)
     *
     * @static
     * @memberof TextMessageFormat
     */
    public static RecordSeparator = String.fromCharCode(TextMessageFormat.RecordSeparatorCode);
    /**
     * 输出一个格式化过的消息
     * @param output 
     */
    public static write(output: string): string {
        return `${output}${TextMessageFormat.RecordSeparator}`;
    }
    /**
     * 解析
     * @param input 
     */
    public static parse(input: string): string[] {
        if (input[input.length - 1] !== TextMessageFormat.RecordSeparator) {
            throw new Error("Message is incomplete.");
        }
        const messages = input.split(TextMessageFormat.RecordSeparator);
        messages.pop();
        return messages;
    }
}

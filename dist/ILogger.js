// 版权所有（c）.NET基金会。保留所有权利。
// 在2.0版Apache许可下授权。有关许可证信息，请参见项目根目录中的License.txt。
//这些值被设计为与ASP.NET日志级别匹配，因为这是我们在这里模拟的模式。
/**
 * 指示日志消息的严重性。
 * 日志级别按严重性递增的顺序排列。所以“Debug”比“Trace”等更严重。
 *
 */
export var LogLevel;
(function (LogLevel) {
    /** 极低严重性诊断消息的日志级别. */
    LogLevel[LogLevel["Trace"] = 0] = "Trace";
    /** 调试错误. */
    LogLevel[LogLevel["Debug"] = 1] = "Debug";
    /** 消息. */
    LogLevel[LogLevel["Information"] = 2] = "Information";
    /** 警告. */
    LogLevel[LogLevel["Warning"] = 3] = "Warning";
    /** 错误. */
    LogLevel[LogLevel["Error"] = 4] = "Error";
    /** 严重错误. */
    LogLevel[LogLevel["Critical"] = 5] = "Critical";
    /** 最高日志级别。在配置日志记录以指示不应发出日志消息时使用. */
    LogLevel[LogLevel["None"] = 6] = "None";
})(LogLevel || (LogLevel = {}));

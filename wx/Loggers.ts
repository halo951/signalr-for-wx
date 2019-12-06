// 版权所有（c）.NET基金会。保留所有权利。
// 在2.0版Apache许可下授权。有关许可证信息，请参见项目根目录中的License.txt。


import { ILogger, LogLevel } from "./ILogger";

/** 未定义 logger 时使用的 空输出实现. */
export class NullLogger implements ILogger {
    /** The singleton instance of the {@link @aspnet/signalr.NullLogger}. */
    public static instance: ILogger = new NullLogger();

    constructor() { }
    log(logLevel: LogLevel, ...msg: any): void { }

}

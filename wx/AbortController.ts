// 版权所有（c）.NET基金会。保留所有权利。
// 在2.0版Apache许可下授权。有关许可证信息，请参见项目根目录中的License.txt。

//粗略填写 https://developer.mozilla.org/en-US/docs/Web/API/AbortController
//实际上，我们从来没有使用被polyfill填充的API，我们总是使用polyfill，因为
//它现在还是一个非常新的API。

/**
 *  
 *  @private 
 */
export class AbortController implements AbortSignal {
    private isAborted: boolean = false;
    public onabort: (() => void) | null = null;

    public abort() {
        if (!this.isAborted) {
            this.isAborted = true;
            if (this.onabort) {
                this.onabort();
            }
        }
    }

    get signal(): AbortSignal {
        return this;
    }

    get aborted(): boolean {
        return this.isAborted;
    }
}

/** 表示可以监视以确定请求是否已中止的信号. */
export interface AbortSignal {
    /** 指示请求是否已中止. */
    aborted: boolean;
    /** signalr 连接中断回调. */
    onabort: (() => void) | null;
}

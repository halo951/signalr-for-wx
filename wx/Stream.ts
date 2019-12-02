// 版权所有（c）.NET基金会。保留所有权利。
// 在2.0版Apache许可下授权。有关许可证信息，请参见项目根目录中的License.txt。


/**
 * 这是一个类似于observate的API，但是我们不希望用户混淆它，所以我们重命名了一些东西。
 * 如果有人愿意的话，他们可以很容易地将它改编成Rx接口。
 * 与C#不同，我们不能只实现一个"interface"并免费获得扩展方法。
 * 方法必须实际添加到对象中（JS！中没有扩展方法）。
 * 我们不想依赖核心库中的RxJS，
 * 因此我们复制所需的最小逻辑，然后用户可以轻松地将它们改编为适当的RxJS可观察值(if they want)。
 *
 */


/** 定义服务器流式传输结果的接收器的预期类型.
 *
 * @typeparam T 服务器发送的项目的类型.
 */
export interface IStreamSubscriber<T> {
    /**
     *  A boolean that will be set by the  when the stream is closed.
     *  定义一个布尔值用来判断 {@link @aspnet/signalr.IStreamResult} 流是否被关闭 
     */
    closed?: boolean;
    /** 
     * Called by the framework when a new item is available.
     * 当新项可用时由框架调用
     */
    next(value: T): void;
    /** 
     * Called by the framework when an error has occurred.
     *当发生错误时由框架调用
     * 
     * After this method is called, no additional methods on the {@link @aspnet/signalr.IStreamSubscriber} will be called.
     * 调用此方法后，{@link @aspnet/signaler.IStreamSubscriber} 上将不会调用其他方法。
     * 
     */
    error(err: any): void;
    /** 
     * Called by the framework when the end of the stream is reached.
     * 当到达流的结尾时由框架调用.
     *
     * After this method is called, no additional methods on the {@link @aspnet/signalr.IStreamSubscriber} will be called.
     * 调用此方法后，{@link @aspnet/signaler.IStreamSubscriber} 上将不会调用其他方法。
     * 
     */
    complete(): void;
}

/** 
 * Defines the result of a streaming hub method.
 * 定义处理结果(响应)流的方法
 * 
 * @typeparam T 服务器发送的项目的类型.
 */
export interface IStreamResult<T> {
    /** 
     * Attaches a {@link @aspnet/signalr.IStreamSubscriber}, which will be invoked when new items are available from the stream.
     * 附加一个{@link@aspnet/signaler.IStreamSubscriber}，当流中有新项可用时将调用它。
     *
     * @param {IStreamSubscriber<T>} observer The subscriber to attach.
     * @returns {ISubscription<T>} A subscription that can be disposed to terminate the stream and stop calling methods on the {@link @aspnet/signalr.IStreamSubscriber}.
     * 
     */
    subscribe(subscriber: IStreamSubscriber<T>): ISubscription<T>;
}

/** 
 * An interface that allows an {@link @aspnet/signalr.IStreamSubscriber} to be disconnected from a stream.
 * 允许{@link@aspnet/signaler.IStreamSubscriber}与流断开连接的接口。
 * 
 * @typeparam T 服务器发送的项目的类型.
 */
// @ts-ignore: We can't remove this, it's a breaking change, but it's not used. - fy:我们不能删除这个，这是一个突破性的变化，但它没有使用。
export interface ISubscription<T> {
    /** 
     * 
     * Disconnects the {@link @aspnet/signalr.IStreamSubscriber} associated with this subscription from the stream. 
     * 从流中断开与此订阅关联的 {@link @aspnet/signaler.IStreamSubscriber}
     * 
     */
    dispose(): void;
}

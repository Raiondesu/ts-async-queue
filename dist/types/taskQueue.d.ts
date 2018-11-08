/**
 * A function that returns promise and has no arguments
 */
export declare type Task<E = any> = () => Promise<E>;
/**
 * Manages a queue of async tasks
 *
 * @class TaskQueue
 */
export declare class TaskQueue {
    /**
     * Tasklist
     */
    protected tasks: Task[];
    /**
     * Creates an instance of TaskQueue.
     * @param {Task[]} [tasks=[]] Tasklist
     */
    constructor(
    /**
     * Tasklist
     */
    tasks?: Task[]);
    /**
     * The most recent running queue
     */
    protected lastQueue?: Promise<any[]>;
    /**
     * Results of a last queue execution
     */
    protected _lastResults?: any[];
    /**
     * Results of a last queue execution
     */
    readonly lastResults: any[] | undefined;
    /**
     * `true` if the queue is running
     */
    protected running: boolean;
    /**
     * `true` if the queue is running
     */
    readonly isRunning: boolean;
    /**
     * An index at which the queue was paused
     */
    protected pauseIndex: number;
    /**
     * Remove a task from queue by its index
     *
     * @returns a removed task if found
     */
    protected dequeueByIndex(index: number): Task<any> | undefined;
    /**
     * Remove a task from queue by its reference. If no task was given, removes the last task.
     * @param {T} [task] a reference to the task function to remove by
     * @returns a removed task if found
     */
    protected dequeueByTask<T extends Task>(task?: T): Task<any> | undefined;
    /**
     * Start executing the queue from a certain point.
     * Halts if `running` flag is off (pause has occured).
     *
     * If any error in any task is raised - pauses queue execution and throws the error upstack.
     *
     * @param {number} from a point to execute a queue from
     * @param {Array<any>} last saved results to add to
     * @returns a promise that resolves to task results array when the queue is finished
     */
    protected launchFrom(from: number, lastResults?: any[]): Promise<any[]>;
    /**
     * Adds one or more tasks to queue.
     */
    enqueue<T extends Task>(...tasks: T[]): void;
    /**
     * Removes task from the queue.
     * @returns a removed task if found
     */
    dequeue<T extends Task>(task?: T): Task | undefined;
    dequeue(index: number): Task | undefined;
    /**
     * Removes the last task from the queue.
     * @returns a removed task if found
     */
    pop(): Task<any> | undefined;
    /**
     * Get last added task without mutating the queue
     */
    peek(): Task<any>;
    /**
     * Last added task
     */
    readonly last: Task<any>;
    /**
     * Queue length
     */
    readonly length: number;
    /**
     * Completely clears the queue and stops executions.
     *
     * If the queue is currently running it is recommended to call `await pause()` first!
     */
    clear(): void;
    /**
     * Pauses the queue's execution flow after a nearest task is completed.
     *
     * @returns a promise that resolves as soon as the queue is paused
     */
    pause(): Promise<any[]> | undefined;
    /**
     * Resumes a previously paused queue.
     *
     * @returns a promise that resolves as soon as the queue is completed
     */
    resume(): Promise<any[]>;
    /**
     * Stops queue execution and clears results.
     *
     * @returns a promise that resolves to queue results (or `undefined` if the queue has already been stopeed) as soon as the queue completely stops executing
     */
    stop(): Promise<any[] | undefined>;
    /**
     * Starts task queue execution.
     *
     * Returns currenlty executed queue if execution already started
     *
     * @returns promise with task results as an array sorted by task execution order
     */
    start(): Promise<any[]>;
}

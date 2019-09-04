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
     */
    constructor();
    /**
     * Creates an instance of TaskQueue.
     * @param {Task[]} [tasks=[]] Tasklist
     */
    constructor(tasks: Task[]);
    /**
     * The most recent running queue
     */
    protected lastQueue?: Promise<any[]>;
    /**
     * Results of a last queue execution
     */
    protected _lastResults: any[];
    /**
     * Results of a last queue execution.
     *
     * Empty, if execution hasn't started yet.
     */
    readonly lastResults: any[];
    /**
     * `true` if the queue is running
     *
     * SHOULD NOT BE MODIFIED outside the class
     */
    protected running: boolean;
    /**
     * `true` if the queue is running
     */
    readonly isRunning: boolean;
    /**
     * An index at which the queue is currenlty running
     */
    protected index: number;
    /**
     * A task index at which the queue is currently running
     *
     * `-1` if the queue is not currently running
     */
    readonly currentTaskIndex: number;
    /**
     * A task which is currently running in the queue
     *
     * `undefined` if the queue is not currently running
     */
    readonly currentRunningTask: Task | undefined;
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
     * @param {number} from
     *    A point to execute a queue from.
     * @param {Array<any>} lastResults
     *    Saved results to add to.
     * @param {boolean} running
     *    Internal indication if the method should continue running.
     *    Passing `false` will result in the method not running.
     * @returns a promise that resolves to task results array when the queue is finished
     */
    protected launchFrom(from: number, lastResults?: any[], running?: boolean): Promise<any[]>;
    /**
     * Adds one or more tasks to queue.
     */
    enqueue(...tasks: Task[]): void;
    /**
     * Removes task from the queue.
     * @returns a removed task if found
     */
    dequeue(task?: Task): Task | undefined;
    dequeue(index: number): Task | undefined;
    /**
     * Removes the last task from the queue.
     * @returns a removed task if found
     */
    pop(): Task<any> | undefined;
    /**
     * Get last added task without mutating the queue
     */
    peek(): Task | undefined;
    /**
     * Last added task
     */
    readonly last: Task<any> | undefined;
    /**
     * Queue length
     */
    readonly length: number;
    /**
     * Completely clears the queue and stops executions.
     */
    clear(): void;
    /**
     * Pauses the queue's execution flow after a nearest task is completed.
     *
     * @returns a promise that resolves as soon as the queue is paused
     */
    pause(): Promise<any[]>;
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
    stop(): Promise<any[]>;
    /**
     * Starts task queue execution.
     *
     * Returns currenlty executed queue if execution already started
     *
     * @returns promise with task results as an array sorted by task execution order
     */
    start(): Promise<any[]>;
}

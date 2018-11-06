/**
 * A function that returns promise and has no arguments
 */
export declare type Task = () => Promise<any>;
/**
 * Manages a queue of async tasks
 *
 * @class TaskQueue
 */
export declare class TaskQueue {
    /**
     * Tasklist
     */
    private tasks;
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
     * A currently running queue
     */
    private currentQueue?;
    /**
     * `true` if the queue is running
     */
    private running;
    /**
     * An index at which the queue was paused
     */
    private pauseIndex;
    /**
     * Remove a task from queue by its index
     *
     * @returns a removed task if found
     */
    private dequeueByIndex;
    /**
     * Remove a task from queue by its reference. If no task was given, removes the last task.
     * @param {T} [task] a reference to the task function to remove by
     * @returns a removed task if found
     */
    private dequeueByTask;
    /**
     * Start executing the queue from a certain point.
     * Halts if `running` flag is off (pause has occured).
     *
     * If any error in any task is raised - pauses queue execution and throws the error upstack.
     *
     * @param {number} from a point to execute a queue from
     * @returns a promise that resolves to task results array when the queue is finished
     */
    private launchFrom;
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
     * Get last added task without mutating the queue
     */
    peek(): Task | undefined;
    /**
     * Last added task
     */
    readonly last: Task | undefined;
    /**
     * Queue length
     */
    readonly length: number;
    /**
     * Completely clears the queue.
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
     * Stops queue execution.
     *
     * @returns a promise that resolves as soon as the queue completely stops executing
     */
    stop(): Promise<void>;
    /**
     * Starts task queue execution.
     *
     * Returns currenlty executed queue if execution already started
     *
     * @returns promise with task results as an array sorted by task execution order
     */
    start(): Promise<any[]>;
}

/**
 * TODO:
 *
 * - Tasks complete syncronyously
 * - Ability to choose a specific queue for the task: labels/ids?
 * - Choose queue priority?
 */
export declare type Task = () => Promise<any>;
export declare class TaskQueue {
    private tasks;
    private runningQueue?;
    private running;
    private pauseIndex;
    private dequeueByIndex;
    private dequeueByTask;
    private launchFrom;
    constructor(tasks?: Task[]);
    enqueue<T extends Task>(...tasks: T[]): void;
    dequeue<T extends Task>(task?: T): any;
    dequeue(index: number): any;
    peek(): Task;
    readonly last: Task;
    readonly length: number;
    clear(): void;
    pause(): Promise<any[]> | undefined;
    resume(): void;
    stop(): void;
    start(): Promise<any[]>;
}
export declare class QueueError<T> extends Error {
    data?: T | undefined;
    constructor(message: string, data?: T | undefined);
    toString(): string;
}

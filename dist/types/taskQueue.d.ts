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

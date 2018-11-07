import { TaskQueue } from './taskQueue';
/**
 * An error raised during the queue execution
 */
export declare class QueueError<T> extends Error {
    readonly queue: TaskQueue;
    data?: T | undefined;
    constructor(message: string, queue: TaskQueue, data?: T | undefined);
    toString(): string;
}

export declare class QueueError<T> extends Error {
    data?: T | undefined;
    constructor(message: string, data?: T | undefined);
    toString(): string;
}

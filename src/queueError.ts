import { TaskQueue } from './taskQueue';

/**
 * An error raised during the queue execution
 */
export class QueueError<T> extends Error {
  constructor(
    message: string,
    public readonly queue: TaskQueue,
    public data?: T
  ) {
    super(message)/* istanbul ignore next: because stupid typescript */;
    Object.setPrototypeOf(this, QueueError.prototype);
    this.name = 'QueueError';
  }

  toString() {
    return this.name + ': ' + this.message;
  }
}

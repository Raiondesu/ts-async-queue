export class QueueError<T> extends Error {
  constructor(
    message: string,
    public data?: T
  ) {
    super(message)/* istanbul ignore next: because stupid typescript */;
    Object.setPrototypeOf(this, QueueError.prototype);
    this.name = 'ResponseException';
  }

  toString() {
    return this.name + ': ' + this.message;
  }
}

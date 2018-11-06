import { QueueError } from './queueError';

/**
 * A function that returns promise and has no arguments
 */
export type Task = () => Promise<any>;

/**
 * Manages a queue of async tasks
 *
 * @class TaskQueue
 */
export class TaskQueue {
  /**
   * Creates an instance of TaskQueue.
   * @param {Task[]} [tasks=[]] Tasklist
   */
  constructor(
    /**
     * Tasklist
     */
    protected tasks: Task[] = []
  ) {}
  /**
   * A currently running queue
   */
  protected lastQueue?: Promise<any[]>;

  /**
   * Results of a last queue execution
   */
  protected _lastResults?: any[];

  /**
   * Results of a last queue execution
   */
  public get lastResults() {
    return this._lastResults && this._lastResults.slice();
  }


  /**
   * `true` if the queue is running
   */
  protected running: boolean = false;


  /**
   * `true` if the queue is running
   */
  public get isRunning() {
    return this.running;
  }

  /**
   * An index at which the queue was paused
   */
  protected pauseIndex: number = -1;

  /**
   * Remove a task from queue by its index
   *
   * @returns a removed task if found
   */
  protected dequeueByIndex(index: number) {
    if (index === this.length - 1) {
      return this.tasks.pop();
    }

    if (index > -1 && this.tasks[index]) {
      const task = this.tasks[index];
      this.tasks.splice(index, 1);

      return task;
    }

    return undefined;
  }

  /**
   * Remove a task from queue by its reference. If no task was given, removes the last task.
   * @param {T} [task] a reference to the task function to remove by
   * @returns a removed task if found
   */
  protected dequeueByTask<T extends Task>(task?: T) {
    if (!task) {
      return this.tasks.pop();
    }

    const index = this.tasks.findIndex(t => t === task);

    return this.dequeueByIndex(index);
  }

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
  protected async launchFrom(from: number, lastResults: any[] = []) {
    this._lastResults = lastResults;
    const tasks = from > 0 ? this.tasks.slice(from) : this.tasks;

    this.running = true;
    this.pauseIndex = -1;

    let index = 0;
    for (const task of tasks) {
      if (!this.running) {
        this.pauseIndex = index;
        break;
      }

      try {
        this._lastResults.push(await task());
      } catch (e) {
        this.pauseIndex = index;
        this.running = false;
        throw new QueueError(`Queue paused at task #${index + 1} due to error in handler ${task}`, this, e);
      }

      index++;
    }

    this.running = false;

    return this._lastResults.slice();
  }

  /**
   * Adds one or more tasks to queue.
   */
  public enqueue<T extends Task>(...tasks: T[]) {
    this.tasks.push.apply(this.tasks, tasks);
  }

  /**
   * Removes task from the queue.
   * @returns a removed task if found
   */
  public dequeue<T extends Task>(task?: T): Task | undefined;
  public dequeue(index: number): Task | undefined;
  public dequeue(): Task | undefined {
    const arg = arguments[0];

    if (typeof arg === 'number') {
      return this.dequeueByIndex(arg);
    } else if (typeof arg === 'function' || !arg) {
      return this.dequeueByTask(arg);
    }

    throw new TypeError('Argument\'s type must either be number, function or undefined!');
  }

  /**
   * Removes the last task from the queue.
   * @returns a removed task if found
   */
  public pop() {
    return this.dequeue();
  }

  /**
   * Get last added task without mutating the queue
   */
  public peek() {
    return this.tasks[this.tasks.length - 1];
  }


  /**
   * Last added task
   */
  public get last() {
    return this.peek();
  }

  /**
   * Queue length
   */
  public get length() {
    return this.tasks.length;
  }

  /**
   * Completely clears the queue and stops executions.
   *
   * If the queue is currently running it is recommended to call `pause()` first!
   */
  public async clear() {
    this.pauseIndex = -1;
    this.lastQueue = undefined;
    this.tasks.splice(0);
  }

  /**
   * Pauses the queue's execution flow after a nearest task is completed.
   *
   * @returns a promise that resolves as soon as the queue is paused
   */
  public pause() {
    this.running = false;

    return this.lastQueue;
  }

  /**
   * Resumes a previously paused queue.
   *
   * @returns a promise that resolves as soon as the queue is completed
   */
  public resume() {
    return this.lastQueue = this.launchFrom(this.pauseIndex, this._lastResults);
  }

  /**
   * Stops queue execution and clears results.
   *
   * @returns a promise that resolves to queue results (or `undefined` if the queue has already been stopeed) as soon as the queue completely stops executing
   */
  public async stop() {
    await this.pause();
    this.pauseIndex = -1;
    this.lastQueue = undefined;
    const results = this.lastResults;

    if (this._lastResults) {
      this._lastResults = undefined;
    }

    return results;
  }

  /**
   * Starts task queue execution.
   *
   * Returns currenlty executed queue if execution already started
   *
   * @returns promise with task results as an array sorted by task execution order
   */
  public start() {
    if (this.lastQueue) {
      return this.lastQueue;
    }

    return this.lastQueue = this.launchFrom(0);
  }
}

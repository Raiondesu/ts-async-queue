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
  protected currentQueue?: Promise<any[]>;


  /**
   * `true` if the queue is running
   */
  protected running: boolean = false;

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
   * @returns a promise that resolves to task results array when the queue is finished
   */
  protected async launchFrom(from: number) {
    const results: any[] = [];
    const entries = this.tasks.slice(from).entries();

    for (const [index, task] of entries) {
      if (!this.running) {
        this.pauseIndex = index;
        break;
      }

      try {
        results.push(await task());
      } catch (e) {
        this.pause();
        throw new QueueError(`Queue paused at task #${index} due to error in handler ${task}`, e);
      }
    }

    return results;
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
    } else if (typeof arg === 'function') {
      return this.dequeueByTask(arg);
    }

    throw new TypeError('Argument must either be a number or a function!');
  }

  /**
   * Get last added task without mutating the queue
   */
  public peek() {
    return this.tasks.length > 0 ? this.tasks[this.tasks.length - 1] : undefined;
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
   * Completely clears the queue.
   */
  public clear() {
    this.tasks.splice(0);
  }

  /**
   * Pauses the queue's execution flow after a nearest task is completed.
   *
   * @returns a promise that resolves as soon as the queue is paused
   */
  public pause() {
    this.running = false;

    return this.currentQueue;
  }

  /**
   * Resumes a previously paused queue.
   *
   * @returns a promise that resolves as soon as the queue is completed
   */
  public resume() {
    return this.currentQueue = this.launchFrom(this.pauseIndex);
  }

  /**
   * Stops queue execution.
   *
   * @returns a promise that resolves as soon as the queue completely stops executing
   */
  public async stop() {
    await this.pause();
    this.pauseIndex = -1;
    this.currentQueue = undefined;

    return;
  }

  /**
   * Starts task queue execution.
   *
   * Returns currenlty executed queue if execution already started
   *
   * @returns promise with task results as an array sorted by task execution order
   */
  public start() {
    if (this.currentQueue) {
      return this.currentQueue;
    }

    return this.currentQueue = this.launchFrom(0);
  }
}

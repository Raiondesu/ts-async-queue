import { QueueError } from './queueError';

/**
 * A function that returns promise and has no arguments
 */
export type Task<E = any> = () => Promise<E>;

/**
 * Manages a queue of async tasks
 *
 * @class TaskQueue
 */
export class TaskQueue {
  /**
   * Creates an instance of TaskQueue.
   */
  constructor();
  /**
   * Creates an instance of TaskQueue.
   * @param {Task[]} [tasks=[]] Tasklist
   */
  constructor(tasks: Task[]);
  constructor(
    /**
     * Tasklist
     */
    protected tasks: Task[] = []
  ) {}

  /**
   * The most recent running queue
   */
  protected lastQueue?: Promise<any[]>;

  /**
   * Results of a last queue execution
   */
  protected _lastResults: any[] = [];

  /**
   * Results of a last queue execution.
   *
   * Empty, if execution hasn't started yet.
   */
  public get lastResults() {
    return this._lastResults.slice();
  }


  /**
   * `true` if the queue is running
   *
   * SHOULD NOT BE MODIFIED outside the class
   */
  protected running: boolean = false;


  /**
   * `true` if the queue is running
   */
  public get isRunning() {
    return this.running;
  }

  /**
   * An index at which the queue is currenlty running
   */
  protected index = -1;


  /**
   * A task index at which the queue is currently running
   *
   * `-1` if the queue is not currently running
   */
  public get currentTaskIndex() {
    return this.index;
  }

  /**
   * A task which is currently running in the queue
   *
   * `undefined` if the queue is not currently running
   */
  public get currentRunningTask(): Task | undefined {
    return this.tasks[this.currentTaskIndex];
  }

  /**
   * Remove a task from queue by its index
   *
   * @returns a removed task if found
   */
  protected dequeueByIndex(index: number) {
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
    return this.dequeueByIndex(
      task ? this.tasks.findIndex(t => t === task) : this.length - 1
    );
  }

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
  protected launchFrom(from: number, lastResults: any[] = [], running: boolean = true): Promise<any[]> {
    this._lastResults = lastResults;

    if (from < this.tasks.length) {
      this.index = from;

      if (running) {
        this.running = running;

        return this.tasks[from]().then(result => {
          lastResults.push(result);

          return this.launchFrom(from + 1, lastResults, this.running);
        }, e => {
          this.running = false;
          throw new QueueError(`Queue paused at task #${from + 1} due to error in handler ${this.tasks[this.index]}`, this, e);
        });
      }
    } else {
      this.running = false;
    }

    return Promise.resolve(this.lastResults);
  }

  /**
   * Adds one or more tasks to queue.
   */
  public enqueue(...tasks: Task[]) {
    this.tasks.push.apply(this.tasks, tasks);
  }

  /**
   * Removes task from the queue.
   * @returns a removed task if found
   */
  public dequeue(task?: Task): Task | undefined;
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
  public peek(): Task | undefined {
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
   */
  public clear() {
    this.index = -1;
    this.running = false;
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

    return this.lastQueue || Promise.resolve([]);
  }

  /**
   * Resumes a previously paused queue.
   *
   * @returns a promise that resolves as soon as the queue is completed
   */
  public resume() {
    return this.lastQueue = this.launchFrom(this.index, this._lastResults);
  }

  /**
   * Stops queue execution and clears results.
   *
   * @returns a promise that resolves to queue results (or `undefined` if the queue has already been stopeed) as soon as the queue completely stops executing
   */
  public stop() {
    return this.pause()
      .then(results => (
        this.clear(),
        results
      ));
  }

  /**
   * Starts task queue execution.
   *
   * Returns currenlty executed queue if execution already started
   *
   * @returns promise with task results as an array sorted by task execution order
   */
  public start() {
    return this.lastQueue = this.lastQueue || this.launchFrom(0);
  }
}

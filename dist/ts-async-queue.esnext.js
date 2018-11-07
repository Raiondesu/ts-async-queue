/**
 * An error raised during the queue execution
 */
class QueueError extends Error {
    constructor(message, queue, data) {
        super(message) /* istanbul ignore next: because stupid typescript */;
        this.queue = queue;
        this.data = data;
        Object.setPrototypeOf(this, QueueError.prototype);
        this.name = 'QueueError';
    }
    toString() {
        return this.name + ': ' + this.message;
    }
}

/**
 * Manages a queue of async tasks
 *
 * @class TaskQueue
 */
class TaskQueue {
    /**
     * Creates an instance of TaskQueue.
     * @param {Task[]} [tasks=[]] Tasklist
     */
    constructor(
    /**
     * Tasklist
     */
    tasks = []) {
        this.tasks = tasks;
        /**
         * `true` if the queue is running
         */
        this.running = false;
        /**
         * An index at which the queue was paused
         */
        this.pauseIndex = -1;
    }
    /**
     * Results of a last queue execution
     */
    get lastResults() {
        return this._lastResults && this._lastResults.slice();
    }
    /**
     * `true` if the queue is running
     */
    get isRunning() {
        return this.running;
    }
    /**
     * Remove a task from queue by its index
     *
     * @returns a removed task if found
     */
    dequeueByIndex(index) {
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
    dequeueByTask(task) {
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
    async launchFrom(from, lastResults = []) {
        this._lastResults = lastResults;
        const tasks = this.tasks.slice(from);
        this.running = true;
        this.pauseIndex = -1;
        for (let i = 0, task = tasks[i]; i < tasks.length; i++, task = tasks[i]) {
            if (!this.running) {
                this.pauseIndex = i;
                break;
            }
            try {
                this._lastResults.push(await task());
            }
            catch (e) {
                this.pauseIndex = i;
                this.running = false;
                throw new QueueError(`Queue paused at task #${i + 1} due to error in handler ${task}`, this, e);
            }
        }
        this.running = false;
        return this._lastResults.slice();
    }
    /**
     * Adds one or more tasks to queue.
     */
    enqueue(...tasks) {
        this.tasks.push.apply(this.tasks, tasks);
    }
    dequeue() {
        const arg = arguments[0];
        if (typeof arg === 'number') {
            return this.dequeueByIndex(arg);
        }
        else if (typeof arg === 'function' || !arg) {
            return this.dequeueByTask(arg);
        }
        throw new TypeError('Argument\'s type must either be number, function or undefined!');
    }
    /**
     * Removes the last task from the queue.
     * @returns a removed task if found
     */
    pop() {
        return this.dequeue();
    }
    /**
     * Get last added task without mutating the queue
     */
    peek() {
        return this.tasks[this.tasks.length - 1];
    }
    /**
     * Last added task
     */
    get last() {
        return this.peek();
    }
    /**
     * Queue length
     */
    get length() {
        return this.tasks.length;
    }
    /**
     * Completely clears the queue and stops executions.
     *
     * If the queue is currently running it is recommended to call `await pause()` first!
     */
    clear() {
        this.pauseIndex = -1;
        this.lastQueue = undefined;
        this.tasks.splice(0);
    }
    /**
     * Pauses the queue's execution flow after a nearest task is completed.
     *
     * @returns a promise that resolves as soon as the queue is paused
     */
    pause() {
        this.running = false;
        return this.lastQueue;
    }
    /**
     * Resumes a previously paused queue.
     *
     * @returns a promise that resolves as soon as the queue is completed
     */
    resume() {
        return this.lastQueue = this.launchFrom(this.pauseIndex, this._lastResults);
    }
    /**
     * Stops queue execution and clears results.
     *
     * @returns a promise that resolves to queue results (or `undefined` if the queue has already been stopeed) as soon as the queue completely stops executing
     */
    async stop() {
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
    start() {
        if (this.lastQueue) {
            return this.lastQueue;
        }
        return this.lastQueue = this.launchFrom(0);
    }
}

export { TaskQueue, QueueError };
//# sourceMappingURL=ts-async-queue.esnext.js.map

/*! *****************************************************************************
Copyright (c) Microsoft Corporation. All rights reserved.
Licensed under the Apache License, Version 2.0 (the "License"); you may not use
this file except in compliance with the License. You may obtain a copy of the
License at http://www.apache.org/licenses/LICENSE-2.0

THIS CODE IS PROVIDED ON AN *AS IS* BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
KIND, EITHER EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION ANY IMPLIED
WARRANTIES OR CONDITIONS OF TITLE, FITNESS FOR A PARTICULAR PURPOSE,
MERCHANTABLITY OR NON-INFRINGEMENT.

See the Apache Version 2.0 License for specific language governing permissions
and limitations under the License.
***************************************************************************** */

function __awaiter(thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
}

/**
 * An error raised during the queue execution
 */
class QueueError extends Error {
    constructor(message, data) {
        super(message) /* istanbul ignore next: because stupid typescript */;
        this.data = data;
        Object.setPrototypeOf(this, QueueError.prototype);
        this.name = 'ResponseException';
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
     * @returns a promise that resolves to task results array when the queue is finished
     */
    launchFrom(from) {
        return __awaiter(this, void 0, void 0, function* () {
            const results = [];
            const entries = this.tasks.slice(from).entries();
            for (const [index, task] of entries) {
                if (!this.running) {
                    this.pauseIndex = index;
                    break;
                }
                try {
                    results.push(yield task());
                }
                catch (e) {
                    this.pause();
                    throw new QueueError(`Queue paused at task #${index} due to error in handler ${task}`, e);
                }
            }
            return results;
        });
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
        else if (typeof arg === 'function') {
            return this.dequeueByTask(arg);
        }
        throw new TypeError('Argument must either be a number or a function!');
    }
    /**
     * Get last added task without mutating the queue
     */
    peek() {
        return this.tasks.length > 0 ? this.tasks[this.tasks.length - 1] : undefined;
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
     * Completely clears the queue.
     */
    clear() {
        this.tasks.splice(0);
    }
    /**
     * Pauses the queue's execution flow after a nearest task is completed.
     *
     * @returns a promise that resolves as soon as the queue is paused
     */
    pause() {
        this.running = false;
        return this.currentQueue;
    }
    /**
     * Resumes a previously paused queue.
     *
     * @returns a promise that resolves as soon as the queue is completed
     */
    resume() {
        return this.currentQueue = this.launchFrom(this.pauseIndex);
    }
    /**
     * Stops queue execution.
     *
     * @returns a promise that resolves as soon as the queue completely stops executing
     */
    stop() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.pause();
            this.pauseIndex = -1;
            this.currentQueue = undefined;
            return;
        });
    }
    /**
     * Starts task queue execution.
     *
     * Returns currenlty executed queue if execution already started
     *
     * @returns promise with task results as an array sorted by task execution order
     */
    start() {
        if (this.currentQueue) {
            return this.currentQueue;
        }
        return this.currentQueue = this.launchFrom(0);
    }
}

export { TaskQueue, QueueError };
//# sourceMappingURL=ts-async-queue.es.js.map

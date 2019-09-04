"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var queueError_1 = require("./queueError");
/**
 * Manages a queue of async tasks
 *
 * @class TaskQueue
 */
var TaskQueue = /** @class */ (function () {
    function TaskQueue(
    /**
     * Tasklist
     */
    tasks) {
        if (tasks === void 0) { tasks = []; }
        this.tasks = tasks;
        /**
         * Results of a last queue execution
         */
        this._lastResults = [];
        /**
         * `true` if the queue is running
         *
         * SHOULD NOT BE MODIFIED outside the class
         */
        this.running = false;
        /**
         * An index at which the queue is currenlty running
         */
        this.index = -1;
    }
    Object.defineProperty(TaskQueue.prototype, "lastResults", {
        /**
         * Results of a last queue execution.
         *
         * Empty, if execution hasn't started yet.
         */
        get: function () {
            return this._lastResults.slice();
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(TaskQueue.prototype, "isRunning", {
        /**
         * `true` if the queue is running
         */
        get: function () {
            return this.running;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(TaskQueue.prototype, "currentTaskIndex", {
        /**
         * A task index at which the queue is currently running
         *
         * `-1` if the queue is not currently running
         */
        get: function () {
            return this.index;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(TaskQueue.prototype, "currentRunningTask", {
        /**
         * A task which is currently running in the queue
         *
         * `undefined` if the queue is not currently running
         */
        get: function () {
            return this.tasks[this.currentTaskIndex];
        },
        enumerable: true,
        configurable: true
    });
    /**
     * Remove a task from queue by its index
     *
     * @returns a removed task if found
     */
    TaskQueue.prototype.dequeueByIndex = function (index) {
        if (index > -1 && this.tasks[index]) {
            var task = this.tasks[index];
            this.tasks.splice(index, 1);
            return task;
        }
        return undefined;
    };
    /**
     * Remove a task from queue by its reference. If no task was given, removes the last task.
     * @param {T} [task] a reference to the task function to remove by
     * @returns a removed task if found
     */
    TaskQueue.prototype.dequeueByTask = function (task) {
        return this.dequeueByIndex(task ? this.tasks.findIndex(function (t) { return t === task; }) : this.length - 1);
    };
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
    TaskQueue.prototype.launchFrom = function (from, lastResults, running) {
        var _this = this;
        if (lastResults === void 0) { lastResults = []; }
        if (running === void 0) { running = true; }
        this._lastResults = lastResults;
        if (from < this.tasks.length) {
            this.index = from;
            if (running) {
                this.running = running;
                return this.tasks[from]().then(function (result) {
                    lastResults.push(result);
                    return _this.launchFrom(from + 1, lastResults, _this.running);
                }, function (e) {
                    _this.running = false;
                    throw new queueError_1.QueueError("Queue paused at task #" + (from + 1) + " due to error in handler " + _this.tasks[_this.index], _this, e);
                });
            }
        }
        else {
            this.running = false;
        }
        return Promise.resolve(this.lastResults);
    };
    /**
     * Adds one or more tasks to queue.
     */
    TaskQueue.prototype.enqueue = function () {
        var tasks = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            tasks[_i] = arguments[_i];
        }
        this.tasks.push.apply(this.tasks, tasks);
    };
    TaskQueue.prototype.dequeue = function () {
        var arg = arguments[0];
        if (typeof arg === 'number') {
            return this.dequeueByIndex(arg);
        }
        else if (typeof arg === 'function' || !arg) {
            return this.dequeueByTask(arg);
        }
        throw new TypeError('Argument\'s type must either be number, function or undefined!');
    };
    /**
     * Removes the last task from the queue.
     * @returns a removed task if found
     */
    TaskQueue.prototype.pop = function () {
        return this.dequeue();
    };
    /**
     * Get last added task without mutating the queue
     */
    TaskQueue.prototype.peek = function () {
        return this.tasks[this.tasks.length - 1];
    };
    Object.defineProperty(TaskQueue.prototype, "last", {
        /**
         * Last added task
         */
        get: function () {
            return this.peek();
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(TaskQueue.prototype, "length", {
        /**
         * Queue length
         */
        get: function () {
            return this.tasks.length;
        },
        enumerable: true,
        configurable: true
    });
    /**
     * Completely clears the queue and stops executions.
     */
    TaskQueue.prototype.clear = function () {
        this.index = -1;
        this.running = false;
        this.lastQueue = undefined;
        this.tasks.splice(0);
    };
    /**
     * Pauses the queue's execution flow after a nearest task is completed.
     *
     * @returns a promise that resolves as soon as the queue is paused
     */
    TaskQueue.prototype.pause = function () {
        this.running = false;
        return this.lastQueue || Promise.resolve([]);
    };
    /**
     * Resumes a previously paused queue.
     *
     * @returns a promise that resolves as soon as the queue is completed
     */
    TaskQueue.prototype.resume = function () {
        return this.lastQueue = this.launchFrom(this.index, this._lastResults);
    };
    /**
     * Stops queue execution and clears results.
     *
     * @returns a promise that resolves to queue results (or `undefined` if the queue has already been stopeed) as soon as the queue completely stops executing
     */
    TaskQueue.prototype.stop = function () {
        var _this = this;
        return this.pause()
            .then(function (results) { return (_this.clear(),
            results); });
    };
    /**
     * Starts task queue execution.
     *
     * Returns currenlty executed queue if execution already started
     *
     * @returns promise with task results as an array sorted by task execution order
     */
    TaskQueue.prototype.start = function () {
        return this.lastQueue = this.lastQueue || this.launchFrom(0);
    };
    return TaskQueue;
}());
exports.TaskQueue = TaskQueue;
//# sourceMappingURL=taskQueue.js.map
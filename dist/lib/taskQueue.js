"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var queueError_1 = require("./queueError");
/**
 * Manages a queue of async tasks
 *
 * @class TaskQueue
 */
var TaskQueue = /** @class */ (function () {
    /**
     * Creates an instance of TaskQueue.
     * @param {Task[]} [tasks=[]] Tasklist
     */
    function TaskQueue(
    /**
     * Tasklist
     */
    tasks) {
        if (tasks === void 0) { tasks = []; }
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
    Object.defineProperty(TaskQueue.prototype, "lastResults", {
        /**
         * Results of a last queue execution
         */
        get: function () {
            return this._lastResults && this._lastResults.slice();
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
    /**
     * Remove a task from queue by its index
     *
     * @returns a removed task if found
     */
    TaskQueue.prototype.dequeueByIndex = function (index) {
        if (index === this.length - 1) {
            return this.tasks.pop();
        }
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
        if (!task) {
            return this.tasks.pop();
        }
        var index = this.tasks.findIndex(function (t) { return t === task; });
        return this.dequeueByIndex(index);
    };
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
    TaskQueue.prototype.launchFrom = function (from, lastResults) {
        if (lastResults === void 0) { lastResults = []; }
        return __awaiter(this, void 0, void 0, function () {
            var tasks, i, task, _a, _b, e_1;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        this._lastResults = lastResults;
                        tasks = this.tasks.slice(from);
                        this.running = true;
                        this.pauseIndex = -1;
                        i = 0, task = tasks[i];
                        _c.label = 1;
                    case 1:
                        if (!(i < tasks.length)) return [3 /*break*/, 6];
                        if (!this.running) {
                            this.pauseIndex = i;
                            return [3 /*break*/, 6];
                        }
                        _c.label = 2;
                    case 2:
                        _c.trys.push([2, 4, , 5]);
                        _b = (_a = this._lastResults).push;
                        return [4 /*yield*/, task()];
                    case 3:
                        _b.apply(_a, [_c.sent()]);
                        return [3 /*break*/, 5];
                    case 4:
                        e_1 = _c.sent();
                        this.pauseIndex = i;
                        this.running = false;
                        throw new queueError_1.QueueError("Queue paused at task #" + (i + 1) + " due to error in handler " + task, this, e_1);
                    case 5:
                        i++, task = tasks[i];
                        return [3 /*break*/, 1];
                    case 6:
                        this.running = false;
                        return [2 /*return*/, this._lastResults.slice()];
                }
            });
        });
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
     *
     * If the queue is currently running it is recommended to call `await pause()` first!
     */
    TaskQueue.prototype.clear = function () {
        this.pauseIndex = -1;
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
        return this.lastQueue;
    };
    /**
     * Resumes a previously paused queue.
     *
     * @returns a promise that resolves as soon as the queue is completed
     */
    TaskQueue.prototype.resume = function () {
        return this.lastQueue = this.launchFrom(this.pauseIndex, this._lastResults);
    };
    /**
     * Stops queue execution and clears results.
     *
     * @returns a promise that resolves to queue results (or `undefined` if the queue has already been stopeed) as soon as the queue completely stops executing
     */
    TaskQueue.prototype.stop = function () {
        return __awaiter(this, void 0, void 0, function () {
            var results;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.pause()];
                    case 1:
                        _a.sent();
                        this.pauseIndex = -1;
                        this.lastQueue = undefined;
                        results = this.lastResults;
                        if (this._lastResults) {
                            this._lastResults = undefined;
                        }
                        return [2 /*return*/, results];
                }
            });
        });
    };
    /**
     * Starts task queue execution.
     *
     * Returns currenlty executed queue if execution already started
     *
     * @returns promise with task results as an array sorted by task execution order
     */
    TaskQueue.prototype.start = function () {
        if (this.lastQueue) {
            return this.lastQueue;
        }
        return this.lastQueue = this.launchFrom(0);
    };
    return TaskQueue;
}());
exports.TaskQueue = TaskQueue;
//# sourceMappingURL=taskQueue.js.map
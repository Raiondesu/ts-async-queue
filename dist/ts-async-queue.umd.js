(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
    typeof define === 'function' && define.amd ? define(['exports'], factory) :
    (factory((global.TaskQueue = {})));
}(this, (function (exports) { 'use strict';

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
    /* global Reflect, Promise */

    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };

    function __extends(d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    }

    function __awaiter(thisArg, _arguments, P, generator) {
        return new (P || (P = Promise))(function (resolve, reject) {
            function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
            function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
            function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
            step((generator = generator.apply(thisArg, _arguments || [])).next());
        });
    }

    function __generator(thisArg, body) {
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
    }

    function __values(o) {
        var m = typeof Symbol === "function" && o[Symbol.iterator], i = 0;
        if (m) return m.call(o);
        return {
            next: function () {
                if (o && i >= o.length) o = void 0;
                return { value: o && o[i++], done: !o };
            }
        };
    }

    function __read(o, n) {
        var m = typeof Symbol === "function" && o[Symbol.iterator];
        if (!m) return o;
        var i = m.call(o), r, ar = [], e;
        try {
            while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
        }
        catch (error) { e = { error: error }; }
        finally {
            try {
                if (r && !r.done && (m = i["return"])) m.call(i);
            }
            finally { if (e) throw e.error; }
        }
        return ar;
    }

    /**
     * An error raised during the queue execution
     */
    var QueueError = /** @class */ (function (_super) {
        __extends(QueueError, _super);
        function QueueError(message, data) {
            var _this = _super.call(this, message) /* istanbul ignore next: because stupid typescript */ || this;
            _this.data = data;
            Object.setPrototypeOf(_this, QueueError.prototype);
            _this.name = 'ResponseException';
            return _this;
        }
        QueueError.prototype.toString = function () {
            return this.name + ': ' + this.message;
        };
        return QueueError;
    }(Error));

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
         * @returns a promise that resolves to task results array when the queue is finished
         */
        TaskQueue.prototype.launchFrom = function (from) {
            return __awaiter(this, void 0, void 0, function () {
                var e_1, _a, results, entries, entries_1, entries_1_1, _b, index, task, _c, _d, e_2, e_1_1;
                return __generator(this, function (_e) {
                    switch (_e.label) {
                        case 0:
                            results = [];
                            entries = this.tasks.slice(from).entries();
                            _e.label = 1;
                        case 1:
                            _e.trys.push([1, 8, 9, 10]);
                            entries_1 = __values(entries), entries_1_1 = entries_1.next();
                            _e.label = 2;
                        case 2:
                            if (!!entries_1_1.done) return [3 /*break*/, 7];
                            _b = __read(entries_1_1.value, 2), index = _b[0], task = _b[1];
                            if (!this.running) {
                                this.pauseIndex = index;
                                return [3 /*break*/, 7];
                            }
                            _e.label = 3;
                        case 3:
                            _e.trys.push([3, 5, , 6]);
                            _d = (_c = results).push;
                            return [4 /*yield*/, task()];
                        case 4:
                            _d.apply(_c, [_e.sent()]);
                            return [3 /*break*/, 6];
                        case 5:
                            e_2 = _e.sent();
                            this.pause();
                            throw new QueueError("Queue paused at task #" + index + " due to error in handler " + task, e_2);
                        case 6:
                            entries_1_1 = entries_1.next();
                            return [3 /*break*/, 2];
                        case 7: return [3 /*break*/, 10];
                        case 8:
                            e_1_1 = _e.sent();
                            e_1 = { error: e_1_1 };
                            return [3 /*break*/, 10];
                        case 9:
                            try {
                                if (entries_1_1 && !entries_1_1.done && (_a = entries_1.return)) _a.call(entries_1);
                            }
                            finally { if (e_1) throw e_1.error; }
                            return [7 /*endfinally*/];
                        case 10: return [2 /*return*/, results];
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
            else if (typeof arg === 'function') {
                return this.dequeueByTask(arg);
            }
            throw new TypeError('Argument must either be a number or a function!');
        };
        /**
         * Get last added task without mutating the queue
         */
        TaskQueue.prototype.peek = function () {
            return this.tasks.length > 0 ? this.tasks[this.tasks.length - 1] : undefined;
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
         * Completely clears the queue.
         */
        TaskQueue.prototype.clear = function () {
            this.tasks.splice(0);
        };
        /**
         * Pauses the queue's execution flow after a nearest task is completed.
         *
         * @returns a promise that resolves as soon as the queue is paused
         */
        TaskQueue.prototype.pause = function () {
            this.running = false;
            return this.currentQueue;
        };
        /**
         * Resumes a previously paused queue.
         *
         * @returns a promise that resolves as soon as the queue is completed
         */
        TaskQueue.prototype.resume = function () {
            return this.currentQueue = this.launchFrom(this.pauseIndex);
        };
        /**
         * Stops queue execution.
         *
         * @returns a promise that resolves as soon as the queue completely stops executing
         */
        TaskQueue.prototype.stop = function () {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.pause()];
                        case 1:
                            _a.sent();
                            this.pauseIndex = -1;
                            this.currentQueue = undefined;
                            return [2 /*return*/];
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
            if (this.currentQueue) {
                return this.currentQueue;
            }
            return this.currentQueue = this.launchFrom(0);
        };
        return TaskQueue;
    }());

    exports.TaskQueue = TaskQueue;
    exports.QueueError = QueueError;

    Object.defineProperty(exports, '__esModule', { value: true });

})));
//# sourceMappingURL=ts-async-queue.umd.js.map

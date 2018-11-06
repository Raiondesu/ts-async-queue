'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

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
 * TODO:
 *
 * - Tasks complete syncronyously
 * - Ability to choose a specific queue for the task: labels/ids?
 * - Choose queue priority?
 */
// TODO: add newly launched queues to the map
// type PriorityMap = {
//   [id: string]: TaskQueue;
// };
// const queues: PriorityMap = {};
var TaskQueue = /** @class */ (function () {
    function TaskQueue(tasks) {
        if (tasks === void 0) { tasks = []; }
        this.tasks = tasks;
        this.running = false;
        this.pauseIndex = -1;
    }
    TaskQueue.prototype.dequeueByIndex = function (index) {
        if (index === this.length - 1) {
            return this.tasks.pop();
        }
        if (index > -1) {
            var task = this.tasks[index];
            this.tasks.splice(index, 1);
            return task;
        }
        return undefined;
    };
    TaskQueue.prototype.dequeueByTask = function (task) {
        if (!task) {
            return this.tasks.pop();
        }
        var index = this.tasks.findIndex(function (t) { return t === task; });
        this.dequeueByIndex(index);
        return task;
    };
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
        else {
            return this.dequeueByTask(arg);
        }
    };
    TaskQueue.prototype.peek = function () {
        return this.tasks[this.tasks.length - 1];
    };
    Object.defineProperty(TaskQueue.prototype, "last", {
        get: function () {
            return this.peek();
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(TaskQueue.prototype, "length", {
        get: function () {
            return this.tasks.length;
        },
        enumerable: true,
        configurable: true
    });
    TaskQueue.prototype.clear = function () {
        this.tasks.splice(0);
    };
    TaskQueue.prototype.pause = function () {
        this.running = false;
        return this.runningQueue;
    };
    TaskQueue.prototype.resume = function () {
        this.runningQueue = this.launchFrom(this.pauseIndex);
    };
    TaskQueue.prototype.stop = function () {
        this.pause();
        this.pauseIndex = -1;
        this.runningQueue = undefined;
    };
    TaskQueue.prototype.start = function () {
        if (this.runningQueue) {
            return this.runningQueue;
        }
        return this.runningQueue = this.launchFrom(0);
    };
    return TaskQueue;
}());
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

exports.TaskQueue = TaskQueue;
exports.QueueError = QueueError;
//# sourceMappingURL=ts-async-queue.es5.js.map

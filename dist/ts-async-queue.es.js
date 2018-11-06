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
class TaskQueue {
    constructor(tasks = []) {
        this.tasks = tasks;
        this.running = false;
        this.pauseIndex = -1;
    }
    dequeueByIndex(index) {
        if (index === this.length - 1) {
            return this.tasks.pop();
        }
        if (index > -1) {
            const task = this.tasks[index];
            this.tasks.splice(index, 1);
            return task;
        }
        return undefined;
    }
    dequeueByTask(task) {
        if (!task) {
            return this.tasks.pop();
        }
        const index = this.tasks.findIndex(t => t === task);
        this.dequeueByIndex(index);
        return task;
    }
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
    enqueue(...tasks) {
        this.tasks.push.apply(this.tasks, tasks);
    }
    dequeue() {
        const arg = arguments[0];
        if (typeof arg === 'number') {
            return this.dequeueByIndex(arg);
        }
        else {
            return this.dequeueByTask(arg);
        }
    }
    peek() {
        return this.tasks[this.tasks.length - 1];
    }
    get last() {
        return this.peek();
    }
    get length() {
        return this.tasks.length;
    }
    clear() {
        this.tasks.splice(0);
    }
    pause() {
        this.running = false;
        return this.runningQueue;
    }
    resume() {
        this.runningQueue = this.launchFrom(this.pauseIndex);
    }
    stop() {
        this.pause();
        this.pauseIndex = -1;
        this.runningQueue = undefined;
    }
    start() {
        if (this.runningQueue) {
            return this.runningQueue;
        }
        return this.runningQueue = this.launchFrom(0);
    }
}
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

export { TaskQueue, QueueError };
//# sourceMappingURL=ts-async-queue.es.js.map

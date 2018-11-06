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
    async launchFrom(from) {
        const results = [];
        const entries = this.tasks.slice(from).entries();
        for (const [index, task] of entries) {
            if (!this.running) {
                this.pauseIndex = index;
                break;
            }
            try {
                results.push(await task());
            }
            catch (e) {
                this.pause();
                throw new QueueError(`Queue paused at task #${index} due to error in handler ${task}`, e);
            }
        }
        return results;
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

export { TaskQueue, QueueError };
//# sourceMappingURL=ts-async-queue.esnext.js.map

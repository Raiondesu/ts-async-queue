import { QueueError } from './queueError';

export type Task = () => Promise<any>;

export class TaskQueue {
  private runningQueue?: Promise<any[]>;
  private running: boolean = false;
  private pauseIndex: number = -1;

  private dequeueByIndex(index: number) {
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

  private dequeueByTask<T extends Task>(task?: T) {
    if (!task) {
      return this.tasks.pop();
    }

    const index = this.tasks.findIndex(t => t === task);

    this.dequeueByIndex(index);

    return task;
  }

  private async launchFrom(from: number) {
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

  constructor(private tasks: Task[] = []) {}

  public enqueue<T extends Task>(...tasks: T[]) {
    this.tasks.push.apply(this.tasks, tasks);
  }

  public dequeue<T extends Task>(task?: T);
  public dequeue(index: number);
  public dequeue() {
    const arg = arguments[0];

    if (typeof arg === 'number') {
      return this.dequeueByIndex(arg);
    } else {
      return this.dequeueByTask(arg);
    }
  }

  public peek() {
    return this.tasks[this.tasks.length - 1];
  }

  public get last() {
    return this.peek();
  }

  public get length() {
    return this.tasks.length;
  }

  public clear() {
    this.tasks.splice(0);
  }

  public pause() {
    this.running = false;

    return this.runningQueue;
  }

  public resume() {
    this.runningQueue = this.launchFrom(this.pauseIndex);
  }

  public stop() {
    this.pause();
    this.pauseIndex = -1;
    this.runningQueue = undefined;
  }

  public start() {
    if (this.runningQueue) {
      return this.runningQueue;
    }

    return this.runningQueue = this.launchFrom(0);
  }
}

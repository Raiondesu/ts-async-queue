import { Task, QueueError } from '../src';
import { TestQueue as TaskQueue } from './testQueue';

describe('TaskQueue', () => {
  const minlength: number = 2;
  let queue: TaskQueue;

  beforeEach(() => {
    queue = new TaskQueue([
      async () => new Promise((r, _) => setTimeout(() => r(1), 500)),
      async () => new Promise((r, _) => setTimeout(() => r(2), 500)),
    ]);

    expect(queue.length).toBe(minlength);
  });

  afterEach(() => queue = undefined);

  it('initializes with empty array by default', () => {
    expect(new TaskQueue().tasks.length).toBe(0);
  });

  it('saves an array of tasks on initialization', () => {
    expect(new TaskQueue([
      async () => 1,
      async () => 1
    ]).tasks.length).toBe(2);
  });

  it('enqueues', () => {
    queue.enqueue(
      async () => 3 // 1
    );

    expect(queue.length).toBe(minlength + 1);

    queue.enqueue(
      async () => 4,// 2
      async () => 5,// 3
    );

    expect(queue.length).toBe(minlength + 3);
  });

  it('peeks into empty queue', () => {
    expect(new TaskQueue().peek()).toBeUndefined();
  });

  it('dequeues last task and peeks', () => {
    const task = async () => 3;

    queue.enqueue(task);

    expect(queue.last).toBe(task);
    expect(queue.last).toBe(queue.peek());
    expect(queue.dequeue()).toBe(task);
  });

  it('dequeues by reference and doesn\'t dequeue by value', () => {
    const task = async () => 3;

    queue.enqueue(task);

    expect(queue.last).toBe(task);
    expect(queue.dequeue(task)).toBe(task);
    expect(queue.length).toBe(minlength);

    queue.enqueue(async () => 3);
    expect(queue.dequeue(async () => 3)).toBeUndefined();
    expect(queue.length).toBe(minlength + 1);
  });

  it('dequeues by index', () => {
    const task = async () => 3;
    const index = queue.length;

    queue.enqueue(task);

    expect(queue.last).toBe(task);
    expect(typeof index).toBe('number');
    expect(queue.dequeue(index)).toBe(task);
    expect(queue.length).toBe(minlength);
    expect(queue.dequeue(0)).toBeTruthy();
    expect(queue.length).toBe(1);

    // Doesn't dequeue if index is "unknown"
    expect(queue.dequeue(-1)).toBeUndefined();

    // Doesn't dequeue if index is outside of bounds
    expect(queue.dequeue(100)).toBeUndefined();

    expect(queue.length).toBe(1);
  });

  it('doesn\'t dequeue invalid args', () => {
    try {
      queue.dequeue('will not work' as any);

      expect(true).not.toBe(true);
    } catch (e) {
      expect(e).toBeInstanceOf(TypeError);
    }
  });

  it('runs and finishes the queue correctly', async () => {
    expect(queue.running).toBe(false);
    expect(queue.lastQueue).toBeUndefined();

    const thread = queue.start();
    expect(queue.running).toBe(true);

    expect(thread).toBe(queue.lastQueue);
    expect(thread).toBe(queue.start());

    const results = await thread;
    expect(Array.isArray(results)).toBe(true);

    expect(results.length).toEqual(queue.length);

    const values = await Promise.all(queue.tasks.map(t => t()));
    expect(values.every((v, i) => v === results[i]));
  });

  const throwsQueueError = async () => {
    queue.enqueue(async () => { throw 'works'; });

    try {
      await queue.start();
    } catch (e) {
      expect(e).toBeInstanceOf(QueueError);

      expect(queue.running).toBe(false);
      expect(queue.pauseIndex).toBe(minlength);

      expect(e.queue.lastResults).toEqual([1, 2]);
    }

    expect(queue.running).toBe(false);
  };

  it('throws QueueError on runtime queue errors and pauses execution', throwsQueueError);

  it('resumes execution from the exact same place after error', async () => {
    await throwsQueueError();

    queue.pop();
    queue.enqueue(
      async () => 3,
      async () => 4,
    );

    const results = await queue.resume();

    expect(results).toEqual([1, 2, 3, 4]);
  });

  it('pauses and resumes execution without errors', async () => {
    queue.start();

    await queue.pause();

    expect(queue.lastQueue).toBeTruthy();
    expect(queue.running).toBe(false);
    expect(queue.pauseIndex).toBe(1);
    expect(queue.lastResults).toEqual([1]);

    queue.enqueue(
      async () => 3,
      async () => 4,
    );

    expect(await queue.resume()).toEqual([1, 2, 3, 4]);
  });

  it('stops the queue and gives results', async () => {
    // Full queue
    queue.start();

    const results = await queue.stop();

    expect(results).toEqual([1]);
    expect(queue.running).toBe(false);
    expect(queue.lastQueue).toBeUndefined();

    // Empty queue
    queue = new TaskQueue();
    queue.start();
    expect(await queue.stop()).toEqual([]);

    // Returnes undefined for already stopped queue
    expect(await queue.stop()).toEqual(undefined);
  });

  it('clears the queue and stops execution', async () => {
    queue = new TaskQueue([
      async () => 1
    ]);

    queue.start();

    expect(queue.isRunning).toBe(true);

    await queue.clear();

    expect(queue.isRunning).toBe(false);
    expect(queue.pauseIndex).toBe(-1);
    expect(queue.lastResults).toEqual([1]);
  });
});

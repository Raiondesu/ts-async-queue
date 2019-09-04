import { TaskQueue, Task } from '../src/taskQueue';

/**
 * Exposes some vital properties for testing
 */
export class TestQueue extends TaskQueue {
  public tasks: Task[];
  public lastQueue: Promise<any[]>;
}

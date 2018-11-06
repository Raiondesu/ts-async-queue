import { TaskQueue, Task } from '../src';

/**
 * Exposes some vital properties for testing
 */
export class TestQueue extends TaskQueue {
  public tasks: Task[];
  public lastQueue: Promise<any>;
  public running: boolean = false;
  public pauseIndex: number = -1;
}

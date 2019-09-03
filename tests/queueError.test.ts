import { QueueError, TaskQueue } from '../src';

describe('QueueError', () => {
  it('errors', () => {
    expect(new QueueError('', new TaskQueue)).toBeInstanceOf(QueueError);
    expect(new QueueError('', new TaskQueue).message).toBe('');
    expect(new QueueError('', new TaskQueue).data).toBe(undefined);

    const message = 'test error';
    const data = { data: 'test' };

    try {
      throw new QueueError(message, new TaskQueue(), data);
    } catch (e) {
      expect(e).toBeInstanceOf(QueueError);
      expect(e.message).toBe(message);
      expect(e.data).toMatchObject(data);
      expect(e.failedTaskIndex).toBe(-1);
      expect(e.failedTask).toBe(undefined);
    }
  });


  it('converts itself to string', () => {
    const message = 'test error';
    const data = { data: 'test' };

    try {
      throw new QueueError(message, new TaskQueue(), data);
    } catch (e) {
      expect(String(e).startsWith(`QueueError: test error`)).toBe(true);
    }
  });

  it('contains a queue reference', () => {
    const queue = new TaskQueue();

    expect(new QueueError('', queue).queue).toBe(queue);
  });
});

# ts-async-queue

[![Build Status](https://img.shields.io/travis/com/raiondesu/ts-async-queue/master.svg?logo=travis&style=flat-square)](https://travis-ci.com/Raiondesu/ts-async-queue) [![Coverage status](https://img.shields.io/coveralls/github/Raiondesu/ts-async-queue/master.svg?style=flat-square)](https://coveralls.io/github/Raiondesu/ts-async-queue?branch=master) [![npm](https://img.shields.io/npm/v/ts-async-queue.svg?style=flat-square)](https://www.npmjs.com/package/ts-async-queue) 
[![npm bundle size (minified)](https://img.shields.io/bundlephobia/minzip/ts-async-queue.svg?style=flat-square)]() [![dependencies (minified)](https://img.shields.io/badge/dependencies-none-yellow.svg?style=flat-square)]()

> A simple async-await task queue written in TypeScript

`npm i -S ts-async-queue`

* [Installation options](#installation-options)
* [API](#library-exports)

## What is it?

This is just a simple library for fail-safe async task execution, written in TypeScript. It utilizes OOP principles and TypeScript for painless management of complex task queues and easy extendability.

Unlike many similar libraries for working with async queues, this one behaves more like a "task-player" with `start`, `pause`, `resume` and `stop` functions. If you need execution concurrency or complex priority management - look elsewhere. Here you can simply enqueue, dequeue, start, stop, pause and resume in just 2KB of minified code. So if you need simplicity and small package - this is your choice.

## Installation options

`ts-async-queue` comes with a couple of installation options:

format-name | exports    | description
------------|------------|-------------------
es5         | named      | Contains an es5-compatible version of `ts-async-queue`
es          | named      | ES6+-compatible version
esnext      | named      | ES7+ version with non-transpiled async-awaits
iife        | `tsQueue` object | Creates a global variable `tsQueue` containing the exports. window-only.
umd         | `tsQueue` object | Same as `iife`, but also works for node.

The `dist` folder contains multiple files with names in a following format:
`/dist/ts-async-queue.{format-name}.js`, where `{format-name}` is a format name from the table.

### Named imports
```js
// ES5/CommonJS
const { TaskQueue, QueueError } = require('ts-async-queue');

// If the first one does not work in your environment:
const { TaskQueue, QueueError } = require('ts-async-queue/dist/ts-async-queue.es5');

// ES6+/TypeScript
import { TaskQueue, QueueError } from 'ts-async-queue';
import { TaskQueue, QueueError } from 'ts-async-queue/dist/ts-async-queue.es'; // ES6-only
import { TaskQueue, QueueError } from 'ts-async-queue/dist/ts-async-queue.esnext'; // ES7+ only
```

### Script imports
```html
<!-- IIFE -->
<script src="https://unpkg.com/ts-async-queue"></script>

<!-- For specific versions of the library -->
<script src="https://unpkg.com/ts-async-queue/dist/ts-async-queue.{export-version}.js"></script>
```

## Library exports

`ts-async-queue` has 2 named exports: `TaskQueue` and `QueueError`:

```js
const { TaskQueue, QueueError } = require('ts-async-queue');
```

```ts
import { TaskQueue, QueueError } from 'ts-async-queue';
```

## `TaskQueue`

> Manages a queue of async tasks

See [type declaration](https://github.com/Raiondesu/ts-async-queue/blob/master/dist/types/taskQueue.d.ts) for more details

**Initilize queue and manage tasks**:
```js
// Task is a simple function that recieves 0 arguments and returns a promise:
const task1 = () => Promise.resolve('task1');
const task2 = () => Promise.resolve('task2');
const task3 = () => Promise.resolve('task3');

// Initialize an empty task queue:
const queue = new TaskQueue();

// and enqueue tasks of your choice (one or more):
queue.enqueue(task1, task2, task3); // -> queue contains [task1, task2, task3]

// or dequeue them

// by index
queue.dequeue(1); // -> returns task2; queue contains [task1, task3]

// by task reference
queue.dequeue(task1); // -> returns task1; queue contains [task3]

// or simply pop the last one
queue.dequeue(); // dequeues the last task in; queue is empty now.
queue.pop(); // same as previous

// Or initialize a task queue with default tasks:
const queueWithElements = new TaskQueue([
  task1,
  task2,
  task3
]);

// Clear all tasks at once
queueWithElements.clear(); // -> queue is empty now ([]).
```

### `queue.start()`
> Starts task queue execution.
> Returns currenlty executed queue if execution already started.

```js
const queue = new TaskQueue([
  task1,
  task2,
  task3
]);


/** Start the queue with
 * TaskQueue.start():
 */

// You can start a queue by calling the `start` function that returns a promise:
const endOfQueueExecution = queue.start();

// endOfQueueExecution is resolved as soon as the queue has finished executing all tasks,
// it always resolves to the array of task results in order of their execution:
endOfQueueExecution.then(results => {
  // If you only need only the last result, just do
  const result = results[results.length - 1];

  console.log(result); // -> task3
  console.log(results); // -> ['task1', 'task2', 'task3']
});

// If you don't care about results, you can also simply await the `start()`:
await queue.start(); // does the exact same procedure as the previous time
// .. do here whatever you want to do after the tasks stop executing

// If one execution is not enough, you can always restart:
queue.start();
```

### `queue.stop()`
> Stops queue execution and clears results.

```js
/** Stop the queue with
 * TaskQueue.stop():
 */

// You can stop the queue execution at any task:
const stopped = queue.stop();

// The `stopped` promise resolves as soon as the queue stops executing:
stopped.then(results => {
  // Here, `results` contains the results of whatever tasks managed to finish their execution

  // If we try to stop the queue again, it will return `undefined`:
  queue.stop()
    .then(res => console.log(res)); // logs -> undefined
});
```

### `queue.pause()`
> Pauses the queue's execution flow after a nearest task is completed.
> Returns a promise that resolves as soon as the queue is paused

```js
queue.start();

/** Pause the queue with
 * TaskQueue.pause():
 */

// Pause resolves to results of tasks executed before the execution has been paused
const results = await queue.pause()
const amountOfTasksExecuted = results.length;
```

### `queue.resume()`
> Resumes a previously paused queue.
> Returns a promise that resolves as soon as the queue is completed

```js
/** Resume the queue with
 * TaskQueue.resume():
 */

const results = await queue.resume();

console.log(results); // -> ['task1', 'task2', 'task3']
```

### Instance properties

name | type | description
-----|------|--------------------------------------
`isRunning` | `boolean` | `true` if the queue is currently executing
`length` | `number` | Amount of tasks in the queue
`last` | `Task` | The last task added to the queue
`peek()` | `Task` | A method alias for `last`
`lastResults` | `Array` | An array of results captured from the last queue execution

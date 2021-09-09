---
title: Async Functions
sidebar_position: 3
---
## Promises
Since actions are just normal member functions they can be asynchronous:
```typescript
class CounterState {
  value = 0;
  async delayedIncrement () {
    await new Promise(resolve => setTimeout(resolve, 1000));
    this.value++
  }
}
```
## Sagas
When you have more complex asynchronous behavior or situations where promises are inadequate you can use generators. [Redux-Saga](https://redux-saga.js.org/) has a rich tool-kit for organizing asynchronous behaviours using generators. Proxily integrates with Redux-Sagas without having to use Redux as a store.  

While Redux-sagas you "listening" for actions. With Proxily you schedule sagas with [**scheduleTask**](../API/async.md#scheduletask).

Start with a generator that has a yield for each asynchronous step of the task: 
```typescript
function *worker({interval} : {interval : number}) {
      yield delay(interval);
      // Do something
}
```
Then you schedule an instance of that task:
```
  scheduleTask(worker, {interval: 150}, takeEvery);
```
Any parameters needed by the task are passed through as an object.

When you schedule the task, you chose one of the take helpers such as takeEvery, takeLeading, debounce, throttle to indicate how the scheduling should deal with concurrent invocation of the task.  See the [**scheduleTask**](../API/async.md#scheduletask) for more details.

Generator tasks may also be class members:```typescript
class Container {
    *task({interval} : {interval : number}) {
        yield delay(interval);
        // Do something
    }
    invokeTask () {
        scheduleTask(this.task, 
            {interval: 1000}, takeLeading); //make sequential
    }
}
```
const container = observable(new Container());
container.invokeTask();
```

If using an effect that takes a time parameter like throttle or debounce you can pass it in:
```typescript
scheduleTask(this.task, {interval: 1000}, debounce, 500);
```
You can cancel a task if you don't want it to run for the duration of your application.  You must pass the same take helper since this is used to locate the task:
```typescript
 cancelTask(this.task, takeLeading);
```

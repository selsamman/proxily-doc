---
title: Asynchronous
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
In some instances you have more complex asynchronous behavior or situations where promises are inadequate. Redux-saga has a rich tool-kit for organizing asynchronous behavious using generators.  Proxily integrates with redux-sagas to bring these benefits to Proxily without using redux as a store.  

While redux-sagas is based on "listening" for actions, with Proxily you start with a generator function that can have multiple yields for each asynchronous step of the task.  This represents a type of task that can be scheduled
```typescript
  function *worker({interval, type} : {interval : number, type : string}) {
      yield delay(interval);
      // Do something
  }
```
You then schedule an instance of that task
```
  scheduleTask(worker, {interval: 150, type: 'A'}, takeEvery);
```
The parameters are passed as an object and our received in the task function.

When you schedule it you chose one of the take helpers such as takeEvery, takeLeading, debounce, throttle to indicate how the scheduling should deal with concurrent invocation of the task.  See the [**scheduleTask**](../API/async.md#scheduletask) for details.

Sagas are object and class friendly because the sagas, which are member functions, are automatically bound by Proxily to their target object.
```typescript
class Container {
    *task({interval} : {interval : number}) {
        yield delay(interval);
    }
    invokeTask () {
        scheduleTask(this.task, {interval: 1000}, takeLeading); //sequentialize
    }
}
const container = makeObservable(new Container());
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
And if you want a more exotic use of sagas just pass in your own take effect.  Here is the example for takeEvery
```typescript
const takeLeadingCustom = (patternOrChannel:any, saga:any, ...args:any) => fork(function*() {
    while (true) {
        const action : any = yield take(patternOrChannel);
        yield call(saga, ...args.concat(action));
        console.log("foo");
    }
})
...
scheduleTask(this.task, {interval: 1000}, takeLeadingCustom);

```

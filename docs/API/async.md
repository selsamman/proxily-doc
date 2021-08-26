---
title: Sagas API
sidebar_position: 3
---
## scheduleTask

Schedule a task using redux-sagas and it's channel interface
```typescript
scheduleTask<T> (task : (parameter: T)=>void, parameter? : T, taker?: any, ...takerArgs : any) : void 
```
| Item  | Description |
|-|-|
|task| a generator function |
|parameter| An object with parameters your generator may consume |
|taker| A scheduling generator usually from redux-sagas - see below |

Thee standard takers can be imported from "@redux-saga/core/effects"

* **takeEvery** - Allow concurrent execution of the task as it scheduled
* **takeLeading** - Ignore requests to schedule the task while first instance of the task is in process
* **takeLatest** - Cancel any running task instance of the task when a new instance is scheduled
* **debounce** - Wait x milliseconds before running ignoring any others scheduled in that interval
  **scheduleTask** just uses redux-saga functions to schedule a task

Scheduling tasks uses redux-sagas under the covers.  It consists of:
* Calling runSaga on a dispatching saga, provided by Proxily for your task
* The dispatching saga then yields on the take helper passing it your generator task.
* The dispatching sage then yields waiting to be cancelled.
* There is one dispatching saga for each generator function and effect combination.
* The dispatching saga will run until it is cancelled by calling **cancelTask**
* The dispatching saga takes from a channel rather than taking an action pattern.
* The dispatching saga uses Channels and EventEmitters to feed the take helper

You can also provide a custom taker for more complex interactions:
```typescript
const takeLeadingCustom = (patternOrChannel:any, saga:any, ...args:any) => 
    fork(function*() {
        while (true) {
            const action : any = yield take(patternOrChannel);
            yield call(saga, ...args.concat(action));
            console.log("dispatched");
    }
})
...
scheduleTask(this.task, {interval: 1000}, takeLeadingCustom);

```

## cancelTask ##
You can cancel a task if you don't want it to run for the duration of your application.  You must pass the same take helper since this is used to locate the task:
```typescript
 cancelTask (task : any, taker?: any) : void
```
The parameters must be the same first two parameters you passed to **scheduleTask**.

###Important Notes on Usage:
Proxily does not have redux-saga as a dependency.  Therefore, you must:
* Add redux-saga to your project

  ``` yarn add redux-saga```

* Import scheduleTask and cancelTask from proxily/lib/cjs/sagas.

  ```import {scheduleTask, cancelTask} from proxily/lib/cjs/sagas";```

* With react-native you may also need to install events

  ```yarn install events```
``

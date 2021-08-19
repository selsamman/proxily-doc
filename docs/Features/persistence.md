---
title: Persistence
sidebar_position: 4
---
Proxily will integrate with any storage object that supports getItem and setItem.  Specifically this includes localStorage and sessionStorage.  To integrate with storage use **persist** to read from storage, merge with an initial state, set up a proxy and observe any changes to the proxy and write back to storage
```typescript
const stateProxy = persist(state, {classes: [Class1, Class2]});
```
The first parameter to persist is the initial state which is any structure supported by Proxily including plane objects or class based hierarchies.  The second parameter is the configuration which may include these properties:
* **storageEngine** - Any storage engine that supports getItem and setItem. Defaults to localStorage.
* **classes** - An array of classes used in the structure just as for deserialize
* **migrate** - A function which is passed the persisted state and the initial state and should return the new state.  It might, for example, enhance the persisted state to bring it up-to-date with the current application requirements and then merge it using the default merge routine exported from Proxily

The default migration logic will merge initial and persistent states giving preference to the persistent state.  It will merge multiple levels up to but not including properties of built-in objects or Arrays.
```typescript
import {migrate, persist} from 'proxily';
const classes = [TodoList, TodoListItem];
const persistedObservableState = persist(state, {classes , migrate: myMigrate});
function myMigrate (persist, initial) {
    delete persist.description; // unused property
    return migrate(persist, initial);
}
```
Note:  persist will also make the state returned observable so there is no need to additionally call makeObservable.

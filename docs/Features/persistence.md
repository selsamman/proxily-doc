---
title: Persist & Serialize
sidebar_position: 2
---
### Persist
Proxily will integrate with localStorage, sessionStorage or any storage library that getItem and setItem .  This includes localStorage, sessionStorage and React Native's AsyncStorage.  Use **persist** to integrate your state with storage: 
```typescript
import {migrate, persist} from 'proxily';

const persistedObservableState = persist(state);
```

**persist** makes the returned state observable, so you don't need to call observable.  
You must provide the unmangled names of all classes in your state by calling serializable when you declare your class:
```
import {serializable} from 'proxily';

class ToDoListItem {
    text = "";
    done = false;
}

serializable({ToDoListItem});
```

Persist has a number of [options](../API/serial_persist#persist) such as which storage engine to use and how you want to merge your state.  You can provide a function to merge in the saved state with your initial state providing for upgrades to the state shape.

```typescript
const persistedObservableState = persist(state, {migrate: myMigrate});
    
function myMigrate (persist, initial) {
    delete persist.description; // unused property
    return migrate(persist, initial);
}
```
The benefit of using classes rather than POJOs for your state is that you don't need to provide migration logic simply because you add a new property to your state.  The initial value of that property will be set when the class is instantiated.

Under the covers proxily uses **js-freeze-dry** for serialization.  You can [read more](https://github.com/selsamman/js-freeze-dry) about it.

**There are some [restrictions](#restrictions) on what can be in your state in order to persist or serialize it**

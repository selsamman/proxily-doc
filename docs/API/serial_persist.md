---
sidebar_position: 2
title: Persist & Serialize API
---
## Persist ##
**persist** will integrate state with localStorage, sessionStorage or any storage system that supports getItem and setItem

```typescript
export interface PersistConfig {
    key?: string,
    storageEngine?: StorageEngine,
    classes? : Array<any>;
    classHandlers? : ClassHandlers;
    migrate?: (persistIn : any, initialIn : any) => any;
}

persist<T>(initialState: T, config : PersistConfig) : T
```
**persist** will:
* restore any saved state from storage
* make the returned state observable
* save your state to storage each time it is mutated (at most once per tick)

The first parameter to **persist** is the initial state which is any structure supported by Proxily including plane objects or class based hierarchies.  The second parameter is the configuration options described bellow:

| Option | Description |
|-|-|
| storageEngine | Any storage engine that supports getItem and setItem. Defaults to localStorage |
| classes | An array of classes used in your state.  This allows class-based state to be reconstituted properly |
| migrate | A function which is passed the persisted state and the initial state.  It should return the merged state.  |

The default migration logic will merge initial and persistent states giving preference to the persistent state.  It will merge multiple levels up to but not including properties of built-in objects or Arrays. 

Note that if you use classes you don't need to worry about adding new properties to state as the initial value of the new property will be present when the Class is reconstituted.
## Serialize
```typescript
serialize(rootObj : any) : string
```
Serializes any observable object returning a string that can be deserialized.  While the string can be parsed with JSON.parse it will parse into an internal format that has types and id's and so really is only useful for processing by deserialize.  See the [restrictions](../Features/persistence#restrictions) on the data that can be processed in this fashion.
## Deserialize
```typescript
type ClassHandlers = {[index: string] : (obj: any)=>any};

deserialize(json : string, classes? : Array<any>, classHandlers? : ClassHandlers)
```
Restores an object from a string returned from **serialize**.  If classes were used in the deserialized data, the classes must be passed in so serialize can create the objects based on them.  
Tracks usage of any properties of objects made observable through **makeObservable**.  If any properties referenced during the course of the render are changed the component will be re-rendered.  It will also re-render the component if any child properties of a referenced property are modified.  This is to conform with the immutable conventions for re-rendering when state changes.  Properties that referenced directly in the render code or in any synchronous functions called by the render code are tracked.

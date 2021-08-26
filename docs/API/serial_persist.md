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

The first parameter to persist is the initial state which is any structure supported by Proxily including plane objects or class based hierarchies.  The second parameter is the configuration options described bellow:

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
Restores an object from a string returned from **serialize**.  If classes were used in the data deserialized then the names fo the classes must be passed in so serialize can create the objects based on them.  
Tracks usage of any properties of objects made observable through **makeObservable**.  If any properties referenced during the course of the render are changed the component will be re-rendered.  It will also re-render the component if any child properties of a referenced property are modified.  This is to conform with the immutable conventions for re-rendering when state changes.  Properties that referenced directly in the render code or in any synchronous functions called by the render code are tracked.

**useObservables** must only be used in a React functional component and must conform to the rules of hooks in terms of always being called in the same order relative to other hooks that may be used by the component.  

## nonObservable
**nonObservable** excludes object properties from being proxied.  This is useful when embedding objects that don't hold state from being interfered with.  Some built-in objects, for example, will not operate properly if they are proxied.  Two forms of nonObservble are:

```typescript
@nonObservable()
```
As a decorator proceeding a property
```
nonObservableProps (obj : any, propOrProps : string | Array<string>)
```
As a function call to nominate either properties of an object or properties of a class as not being observable

| Item  | Description |
|-|-|
|obj| An object or a class |
|propsOrProps| An array of property names or a single property name|

In both cases the property will not be made observable.  This is important when objects that don't directly represent state are included in an object that will be made observable.  For example XMLHttpRequest, Promises, component references or anything else that is not observable state.
## observe ##
**observe** allows changes to state to be monitored outside a component.   For example, **persist** uses this internally to detect state changes and save them to local storage.
```typescript
observe<T>(targetIn: T, 
            onChange : (target : string, prop : string) => void,  
            observer? : (target : T) => void,
            observationOptions? : ObserveOptions) 
            : ObservationContext

interface ObserveOptions {
    async: boolean
}
```

| Item  | Description |
|-|-|
|targetIn| An observable object |
|onChange| A function that will be called when state in targetIn or it's descendents change|
|observer| A function that is called to reference any properties that are to be observed.  If omitted all changes will be observed|
|observationOptions| passing {async: true} means that only one onChange will be fired per tick regardless of how many state changes there are.  Otherwise, onChange is fired immediately after the state.
## ObservableProvider
```typescript
ObservableProvider = ({context, value, dependencies, transaction, children} : {
    context : any, 
    value : Function | any, 
    dependencies : Array<any>, 
    transaction?: Transaction, 
    children: any})
```
A component that can be used to create observable objects directly in JSX and place it into a context.

| Options  | Description |
|-|-|
| context | A context created by React.createContext |
| value | A callback function that will return an object to be made observable or the object itself |
| dependencies | An array of values that will be use to memoized the create of a new object based when the values change |
| transaction | An optional transaction if the observable object is to be part of a transaction |
| children | Child components are automatically passed in by using the component in JSX |

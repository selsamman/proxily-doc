---
sidebar_position: 2
title: Serialize & Persist
---
## Serialize
```typescript
serialize(rootObj : any) : string
```
Serializes any observable object returning a string that can be deserialized.  While the string can be parsed with JSON.parse it will parse into an internal format that has types and id's and so really is only useful for processing by deserialize.  See the [restrictions](Features/serialization.md) on the data that can be processed in this fashion.
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

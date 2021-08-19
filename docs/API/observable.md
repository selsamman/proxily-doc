---
sidebar_position: 1
title: Observable API
---
## makeObservable ##
```typescript
makeObservable<T>(targetIn: T, transaction? : Transaction) : T
```

**makeObservable** Makes a state object able to detect changes react to them using either [**useObservables**](#useobservable) or [**observe**](#observe).  It also enables all other proxily functionality that applies to observable objects such as memoization, function binding, reporting top level calls as actions to redux-devtools.  

| Item  | Description |
|-|-|
|targetIn| Any object representing state |
|transaction| An optional transaction|
|returns| A proxy for the targetIn of the same type |

The proxy automatically extends its effect by creating other proxies for objects as they are referenced and replacing the references with a references for a proxy to the object.  This means that an entire tree of state need only be made observable at the root.  Generally makeObservable is used centrally to produce long-lived objects for a store.  In some cases shorter lived observable components may be needed within a component in which case **useLocalObservable** is used.

The proxy performs these functions on objects:
* Binds methods to the object so they can be used without an object reference
* Handles the memoization of any methods annotated as being memoized.
* Track references to properties in conjunction with **useObservables** or **observe** to enable reactions such as re-rendering when tracked properties are mutated.
* Considers the top level method call to be an "action" for devtools purposes

Note: makeObservable may be used to take an already observable object and make a new copy of it that is part of a transaction

## useObservables ##
```typescript
useObservables() : void
```
Tracks usage of any properties of objects made observable through **makeObservable**.  If any properties referenced during the course of the render are changed the component will be re-rendered.  It will also re-render the component if any child properties of a referenced property are modified.  This is to conform with the immutable conventions for re-rendering when state changes.  Properties that referenced directly in the render code or in any synchronous functions called by the render code are tracked.

**useObservables** must only be used in a React functional component and must conform to the rules of hooks in terms of always being called in the same order relative to other hooks that may be used by the component.  


## observe ##
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
Used outside a component to observe state changes.  For example, **persist** uses this internally to detect state changes and save them to local storage

| Item  | Description |
|-|-|
|targetIn| An observable object |
|onChange| A function that will be called when state in targetIn or it's descendents change|
|observer| A function that is called to reference any properties that are to be observed.  If omitted all changes will be observed|
|observationOptions| passing {async: true} means that only one onChange will be fired per tick regardless of how many state changes there are.  Otherwise, onChange is fired immediately after the state.

## memoize ##
Observable objects may have memoized getters or functions through **memoize**.  A memoized function will only be recalculated when any of the state that it consumes changes or when the arguments change.

It can be used as a decorator proceeding a member function
```typescript
@memoize()
```
or as a function that accepts a class or object, and it's member function name(s)
```
memoize (obj : any, propOrProps : string | Array<string>)
```
**memoize** can only be used functions that are properties of an observable object and cannot be used to make standalone functions memoized.  There are other libraries suitable for standalone functions.

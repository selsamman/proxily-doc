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
useObservables(options? : ObserverOptions) : void
```
Tracks usage of any properties of objects made observable through **makeObservable**.  If any properties referenced during the course of the render are changed the component will be re-rendered.  It will also re-render the component if any child properties of a referenced property are modified.  This is to conform with the immutable conventions for re-rendering when state changes.  Properties that referenced directly in the render code or in any synchronous functions called by the render code are tracked.

**useObservables** must only be used in a React functional component and must conform to the rules of hooks in terms of always being called in the same order relative to other hooks that may be used by the component.  

See [observer](#observe) for more details on the ObserverOptions.  The one that is appropriate for consideration in components is **notifyParents**.  It defaults to false meaning that your component will not re-render because it is observing a parent property and one it's child properties is mutated.  If you set it to true ```useObservables({notifyParents: true})``` then a reaction paradigm similar to Redux is followed whereby components referencing parent properties are re-rendered even if a chhild orhose properties is mutated.  This could be useful in edge cases where you have child components that are not Proxily-aware and you want to rerender child components any time a property or descendent property is mutated.

## useObservableProp ##
```
useObservableProp<S>(value: S) : [S, (value: S) => void]
```
Returns an array where the 1st element is a property value and the second a function used to set the property value.  The property is the last one referenced.  By passing a reference to a property in the argument this established the property in the argument as the last reference.

Used like this
```javascript
  const [value, setValue] = useObservableProp(counter.value)
```
**useObservables** must be called before calling **useObservableProp**.

***setValue*** will be considered an action for tooling such as redux-devtools.

## observe ##
```typescript
observe<T>(targetIn: T, 
            onChange : (target : string, prop : string) => void,  
            observer? : (target : T) => void,
            observationOptions? : ObserveOptions) 
            : ObservationContext

interface ObserverOptionsAll {
    batch: boolean,
    delay: number | undefined,
    notifyParents : boolean
}
```
Used outside a component to observe state changes.  For example, **persist** uses this internally to detect state changes and save them to local storage

| Item  | Description |
|-|-|
|targetIn| An observable object |
|onChange| A function that will be called when state in targetIn or it's descendents change|
|observer| A function that is called to reference any properties that are to be observed.  If omitted all changes will be observed|
|observationOptions| see below |

| Option | Description |
|-|-|
| batch | defaults to true so that updates are batched as [described here](../Features/observables#batching-of-reactions). To disable batching set to false |
| delay | defaults to undefined which means that reactions are synchronous.  Set to a time delay if you wish reactions to be debounced to a given time interval in milliseconds |
| notifyParents | defaults to false meaning that if a state is mutated, only observers of that property will be notified.  If set to true, observers of parents of the state are also notified as is the case for the immutable paradigm |

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

## bindObservables ##
```
bindObservables<P> (ClassBasedComponent : React.ComponentType<P>) : (args : P) => any
```
Accepts a React class based component as a parameter and creates a function-based high order component that call **useObservables** and render the class based component.  Conceptually the function looks like this:
```
function (props : any) {
    useObservables();
    return (
        <ClassBasedComponent {...props}/>
    )
}
```

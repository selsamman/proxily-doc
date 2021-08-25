---
title: Observables
sidebar_position: 1
---
Observing state changes and reacting to them is the core of how Proxily manages state.  The process involves two pieces:

* **Observable** objects created by [**makeObservable**](../API/observable#makeobservable) are actually an ES6 proxy that can monitor both references to and mutations of state properties so it handles both tracking of the properties you consume and changes to state.  The nature of observable objects is that they cascade automatically such that all objects referenced become observable as you reference them.
* **Observers** are created for each component when you use [**useObservables**](../API/observable#useObservable).  The observer is notified about both references and mutations of all observable objects.  When a property is mutated that the observer has observed being used a reaction occurs which with **useObservables** means the component is re-rendered

Obsevers may also be created outside of components using [**observe**](../API/observable#observe) so that other parts of your application can leverage this feature.  For example you could implement an observer that keeps a "last modified" date current or that transmits partial form updates to  server.  Internally **persist** uses observers to know when your state changes and must be saved to local storage.

## Observable Objects

Observable objects may contain:

* Strings, numbers
* References to other objects (POJOs or classes)
* Sets, Maps and Arrays (Arrays are treated as actual arrays)
* Normal functions, generators and async functions
* Generators
* Built in objects provided that you make them [**nonObservable**](../API/utility#nonobservable)
* Cyclic references

The main functions of the observable object include
* Notifying observers of references and mutations
* Creating new observable objects and replacing references to other objects with them as you make references
* Handling the memoization of getters and other functions you declare as memoized.
* Binding member functions to the target so than be used without an object reference

## Property Accessor Helper
To get the value of a property you need only reference it.  It is considered a bad practice, however, to mutate the state directly in your component.  Properties should really only be mutated in actions.  The [**useObservable**](../API/observable#useobservables) property helper creates returns a array with a getter as the first element and a setter as the second, much like setState.  You reference the property in the argument to establish the property being referred to.

```javascript
const counter = makeObservable({
  value: 0
});

function App() {
  useObservables();
  const [value, setValue] = useObservableProp(counter.value)
  return (
    <div>
      <span>Count: {value}</span>
      <button onClick={() => setValue(value + 1)}>Increment</button>
    </div>
  );

}
```
Be sure to pass the actual property reference (and not just the value) to **useObservableProp** as technically it will refer to the last referenced property. Be sure to also include **useObservables** before calling **useObservableProp**.

***setValue*** will be considered an action for tooling such as redux-devtools.

## Memoization ##

Memoization reduces costly recalculations of computed values based on your state by saving the result and only re-running the calculation when dependent state is changed.  Both getters (akin to selectors) and functions with arguments are supported:  You need only annotate an object function with **memoizeObject** and **memoizeClass**.
```typescript
const state = {
    counters: [counter1, counter2],
    sortedCounters: function () {
        return this.counters.slice(0).sort((a,b) => a.value - b.value);
    }
};
memoize(state, 'sortedCounters'); 
```
or to memoize a method within a class:
```typescript
class State {
    constructor () {
        this.counters = [new CounterClass(), new CounterClass()];
    }
    counters : Array<CounterClass> = [];
    sortedCounters () {
        return this.counters.slice(0).sort((a,b) => a.value - b.value);
    }
};
memoize(State, 'sortedCounters');
```
or with Typescript decorators (with "experimentalDecorators": true in your tsconfig file)
```typescript
class State {
    constructor () {
        this.counters = [new CounterClass(), new CounterClass()];
    }
    counters : Array<CounterClass> = [];
    
    @memoize()
    sortedCounters () {
        return this.counters.slice(0).sort((a,b) => a.value - b.value);
    }
};
```

## Batching of Reactions ##

React contains a mechanism to avoid excessive renders in response to state changes.  Basically it schedules state updates which cause renders after user-initiated events complete.  If your onClick handler updates state many times in that code it will result in only one render.

In asynchronous situations this is not the case (prior to React 18) since there is no event that React knows about that can be used determine create a boundary around a sequence of state updates.  React 18 will batch and schedule all state updates so for the case of rendering this will no longer be an issue.

With Proxily all state mutations are synchronous and never batched.  The way that redundant renders are eliminated is to defer the reaction to the state change (e.g. the render itself) and batch them.    Renders, however, are not the only possible reaction to state change.  Proxily also supports reactions to changes in state through the **observe** call.  This is used internally in the **persist** call to update local storage with state changes.

These are the rules for batching reactions to state changes:

* A reaction only occurs when the top level call to a method in an observable component completes such that a reaction will never occur while a series of potentially related state updates complete.
* This batching of nested reactions only applies to synchronous methods.  Asynchronous methods return a promise in response to an await or return after scheduling a callback.  The promise fulfillment or callback is no longer nested within the outer asynchronous function.  Therefore, multiple state updates occurring after await, in a promise fulfillment or in a callback do not cause reactions to be batched.
* To ensure batching of reactions in asynchronous calls you simply need to wrap them in a method call or use **groupUpdate**

## Class Components ##
If you have class based components you can wrap them in a high order component that calls **useObservables** and passes through properties to the class.  Proxily provides a handy function [**bindObservables**](../API/observable#bindobservables) that does this for you:
```typescript jsx
  class CounterState { // Your state
        private _value = 0;
        get value () {
            return this._value
        }
        increment () {this._value++}
  }
    
  const state = makeObservable({  // Your Observable state
        counter: new CounterState()
  });
    
  // Class Based Component
  class CounterClass extends React.Component<{counter : CounterState}> {
        render () {
            const {value, increment} = this.props.counter;
            return (
                <div>
                    <span>Count: {value}</span>
                    <button onClick={increment}>Increment</button>2
                </div>
            );
        }
    }

  // Wrap class-based component to make properties observable
  const Counter = bindObservables(CounterClass);
    
  function App () {
        return (
            <Counter counter={state.counter}/>
        );
  }
```


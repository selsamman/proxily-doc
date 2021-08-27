---
title: Observables
sidebar_position: 1
---
Observing state changes and reacting to them is the core of how Proxily manages state.  The process involves two pieces:

* **Observable** objects, created by [**makeObservable**](../API/observable#makeobservable), are ES6 proxies that monitor both references to and mutations of state properties of the original object. The proxy effect cascades automatically as you reference properties that contain other objects, such that all objects you reference from an observable object also become observable.
* **Observers** are created for each component that uses [**useObservables**](../API/observable#useobservables).  The observer is notified about both references to and mutations of all observable properties.  When a property is mutated and that same property has been referenced a reaction occurs.  In the case of **useObservables** that reaction is to re-render the component.

Observers may also be created outside of components using [**observe**](../API/observable#observe) so that other parts of your application can leverage this feature.  For example, you could implement an observer that keeps a "last modified" date current or that transmits partial form updates to  server.  Internally [**persist**](persistence) uses observers to know when your state must be saved to local storage.

## Observable Objects

Observable objects may contain:

* Strings, numbers
* References to other objects (POJOs or classes)
* Sets, Maps and Arrays
* Normal functions, generators and async functions
* Built in objects provided that you make them [**nonObservable**](../API/observable#nonobservable)
* Cyclic references

In addition to providing the mutation detection observable objects also:

* Handling the memoization of getters and other functions you declare as [memoized](#memoization).
* [Binding member functions](#function-binding) to the target so than be used without an object reference

## Setter Actions

To get the value of a property in a component you need only reference it.  While you could mutate the property directly in the component this is considered an anti-pattern.  Instead, one should always use an action to mutate data.  [**useObservableProp**](../API/observable#useobservableprop) will automatically create such an action for any property reference. It returns an array with a getter as the first element and a setter as the second, much like Reacts useState.  

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
> The argument must be an actually references the property rather than just the value.

## Function Binding ##
Proxily automatically binds functions to their target object to ensure that "this." will always point to the correct object.

```
const {increment} = counter;
increment(); 
```
is equivalent to.
```
counter.increment()
```
This makes classes far more intuitive to consume since you don't have to know about the implementation of functions. 

## Memoization ##

Memoization reduces costly recalculations of computed values based on your state by saving the result and only re-running the calculation when dependent state is changed.  Both getters and functions with arguments are supported:  
```typescript
const state = {
    counters: [counter1, counter2],
    sortedCounters: function () {
        return this.counters.slice(0).sort( (a,b) =>
            a.value - b.value);
    }
};
memoize(state, 'sortedCounters'); 
```
You need only annotate an object function with **memoize** or annotate a class method:
or to memoize a method within a class:
```typescript
class State {
    constructor () {
        this.counters = [new CounterClass(), new CounterClass()];
    }
    counters : Array<CounterClass> = [];
    sortedCounters () {
        return this.counters.slice(0).sort( (a,b) => 
            a.value - b.value);
    }
};
memoize(State, 'sortedCounters');
```
With Typescript decorators ("experimentalDecorators": true in your tsconfig file) you can use **memoize** as a decorator:
```typescript
class State {
    constructor () {
        this.counters = [new CounterClass(), new CounterClass()];
    }
    counters : Array<CounterClass> = [];
    
    @memoize()
    sortedCounters () {
        return this.counters.slice(0).sort( (a,b) => 
            a.value - b.value);
    }
};
```

## Batching of Reactions ##

React avoids excessive renders in response to state changes by batching the changes together. If your onClick handler updates state many times it will result in only one render.  This applies to state only to state changes in event handlers.  In React 18 batching applies to all state changes.

With Proxily all state mutations are synchronous and never batched.  Instead, the re-renders, themselves are batched. The way that redundant renders are eliminated is to defer the reaction to the state change (e.g. the render itself) and batch them:

* A reaction only occurs when the top level call to a method in an observable component completes avoiding incomplete state updates.
* Since asynchronous methods return a promise in response to the first await, all reactions to state changes cannot be batched. Either make state changes in asynchronous functions part a deeper method call or group them with [**groupUpdate**](../API/observable#groupupdates)

## Class Components ##
If you have class based components you can wrap them in a high order component (HOC) that calls **useObservables** and passes through properties to the class.  Proxily provides a handy function [**bindObservables**](../API/observable#bindobservables) that does this for you:
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


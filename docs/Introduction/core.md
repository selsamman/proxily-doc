---
sidebar_position: 2
title: Core Concepts
id: core
---

## Observables
Proxily is based on tracking your references to state that you have made observable.  You define your state and create an observable version of it with [**makeObservable**](../API/observable#makeobservable).  Then in your component indicate that you will use observables with [**useObservables**](../API/observable#useObservable)
```javascript
class CounterState {
    value = 0;  
    increment () {this.value++}
}

const state = makeObservable({
    counter: new CounterState()
});

function Counter({counter} : {counter : CounterState}) {
    useObservables();
    const {value, increment} = counter;
    return (
        <div>
            <span>Count: {value}</span>
            <button onClick={increment}>Increment</button>
        </div>
    );
}

function App () {
    return (
        <Counter counter={state.counter}/>
    );
}
```
While the core of Proxily is mostly unopinionated as to how you structure your state, most of this documentation uses classes. Classes are an effective way to keep concerns together.  Both the state and the logic that effects that state are bound together.  Classes have never been that popular in React because most state management systems do not support them very well.

Proxily does a few small favors for you that makes working with classes much easier.  For example, notice how the ***increment*** member function can be called without referencing it as ***counter.increment()***.  That is because Proxily automatically binds all member functions to the object that references them.

Also classes give you first class Typescript support, so you end up with a robust guard-rail system to ensure type safety.  With Typescript's powerful inference capability most of these benefits come with minimal need for explicit typing.  Your IDE will provide useful suggestions and design-time type information that obviates the need for run-time checking.
## Stores, Actions, Selectors
Most state management libraries have their own proprietary structures for defining a store which may consist of state, selectors to derive information from the state and actions to mutate state.  These are referred to as "opinionated" libraries.  Proxily opts to use standard Javascript language features to define these elements:  
* **Stores** - Proxily takes a decentralized approach to stores. A store is simply the root of an object graph, representing your state that you have made observable. You pass observable objects to your components as parameters, place them in a context provider or simply import them directly.
* **Selectors** - A selector is simply a Javascript [getter](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/get).  You may optionally [memoize](../Features/memoization) getters for better performance on expensive calculations (e.g. sorts and filters).  
* **Actions** - Any function can serve the role of an action. Top level calls are considered to be actions for tools such as redux-devtools and for the batching reactions in a way that avoids reacting to partially updated state.

There are some constraints on observable classes for the benefits of serialization.  They must be constructable without passing parameters to the constructor. Do not include objects that cannot be serialized.



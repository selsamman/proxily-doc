---
sidebar_position: 2
title: Core Concepts
id: core
---

## Observables
Proxily tracks references to state while your component renders.  It re-renders your component anytime the referenced properties change.  You make state "observable" with [**observable**](../API/observable.md#observable) and ask Proxily to track property references my makeing your component an [**observer**](../API/observable#observer).
```javascript
class CounterState {  // Your State
    value = 0;  
    increment () {this.value++}
}

const state = observable({ 
    counter: new CounterState()
});

const Counter = observer(function Counter({counter} : {counter : CounterState}) {
    const {value, increment} = counter;
    return (
        <div>
            <span>Count: {value}</span>
            <button onClick={increment}>Increment</button>
        </div>
    );
});

function App () {
    return (
        <Counter counter={state.counter}/>
    );
}
```
**observable** and **observer** are really all you need for basic state management with Proxily.  If you want to see a more complete example, look at the [classic redux-style Todo app](https://github.com/selsamman/proxily_react_todo_classic).  Otherwise, continue on.


## Stores, Actions, Selectors
State managers often combine everything into a store. In Proxily we break things out into:

* **Stores** - A store is an object that you have made observable (usually the root object in your state).  You can also create stores local to a single component or group of components. 

* **Actions** - Actions are just functions that are members of an observable object.  They may be synchronous or asynchronous and may also spin off tasks via Redux-saga. 

* **Selectors** - A selector is [getter](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/get) method on an observable object.  You can [memoize](../Features/observables#memoization) it for better performance on expensive calculations (e.g. sorts and filters).

Proxily doesn't have a fixed opinion on how you set these up, though picking a pattern and sticking with it is advised.

## Why Classes?
Most of our examples use classes. While you are free to define your state as a plain Javascript object and define actions and selectors separately there are some features that require that functions be bound to your state (e.g. objects).  This includes features unique to Proxily that provide multiple temporal views of your state for transactions and concurrent rendering (React 18).  Javascript objects (prototypal inheritance) would accomplish this but requires manual serialization and persistence. 

Therefore, the easiest way to get the full benefits of Proxily is to use classes and enjoy these benefits that they provide:

* State and the code to modify that state are bound together, so it is clear which code is mutating which state.  This can be enforced using private properties.

* Classes are the most direct way to define types in Typescript.  They combine describing and typing state with assigning initial values, taking advantage of inference in many cases.

* Defining initial values within the class ensures objects are initialized correctly.

* There is one single interface for both consuming and modifying any object in your state so there is no need to import a separate interface with actions and selectors.

* You don't need to pass instance identifiers in your actions.

* Class names are attached to your data making it possible to [log](../Features/tools#logging) both the class and method when state is mutated.

Classes, like any feature, can certainly be misused - for example overuse of inheritance.  If you keep it simple, however, they offer a highly effective way to organize your state and logic. 

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
Most of our examples use classes. While you can define your state as a plain objects and define actions and selectors separately, features such as selectors and transactions require that functions be bound to your state as objects. Classes are the easiest way to accomplish this and provide these benefits:

* State and the code to modify that state are bound together so you know which code mutates state.  This can be enforced using private properties.

* Classes combine typing with defining initial values so objects are always initialized correctly.  This makes persisting state automatic.

* There is one single interface for both consuming and modifying state without the need to pass instance identifiers to actions.

* Class names are attached to your data making it possible to [log](../Features/tools#logging) both the class and method when state is mutated.

Classes can certainly be misused - for example overuse of inheritance.  If you keep it simple they offer a highly effective way to organize your state and logic. 

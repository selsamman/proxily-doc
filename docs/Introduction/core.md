---
sidebar_position: 2
title: Core Concepts
id: core
---

## Observables
Proxily tracks references to state while your component renders.  It then ensures that your component is re-rendered anytime the referenced state properties change.  You make your state "observable" with [**makeObservable**](../API/observable.md#makeobservable) and then ask Proxily to track references with [**useObservables**](../API/observable#useobservables).
```javascript
class CounterState {  // Your State
    value = 0;  
    increment () {this.value++}
}

const state = makeObservable({  // Make it observable
    counter: new CounterState()
});

function Counter({counter} : {counter : CounterState}) {
    useObservables(); // Track references
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
These two calls, **makeObservable** and **useObservables** are really all you need for basic state management with React.  If you want to see a more complete exampled, head over to the [classic redux-style Todo app](https://github.com/selsamman/proxily_react_todo_classic).  Otherwise, continue on.


## Stores, Actions, Selectors
Proxily uses standard Javascript language features to define the traditional elements of state management:  

* **Stores** - A store in Proxily is simply an object that you have made observable and is usually the root object in your state.  It may contain cyclic references, and you may have multiple observable root objects.  You can create global stores or local stores that are only needed for a single component or small group of components. You can pass around the root of the store or any part of the store to your components as properties, contexts or simply import it.

* **Actions** - Actions are usually responses to users interacting with your component. Any function that is a member of an observable object can be an action.  Proxily tracks the nesting of calls such that the top level function you call is considered to be the action for purposes of tooling and batching of reactions. You may also spin off asynchronous actions that use promises or that schedule tasks using Redux-saga. 

* **Selectors** - A selector is simply a Javascript [getter](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/get) method on an observable object.  You may optionally [memoize](../Features/observables#memoization) the selector for better performance on expensive calculations (e.g. sorts and filters).

While the proxily doesn't have a fixed opinion on how you set these up, you should pick a pattern and stick to it so that you have a consistent approach to managing state throughout your application.  The two main options are using POJOs for state, with separate actions and selectors or classes which combine them all together.

### POJOs

With traditional state management systems such as Redux you create your state using "plane old javascript objects" (POJOs), define reducers to generate a new state, and actions which are dispatched to invoke the reducers.  In Proxily you don't need reducers as your actions modify state directly.  You can, however, keep your state as POJOs and define your actions and selectors separately thus keeping a more traditional taxonomy:

``` typescript jsx
    const store = persist({
        counter: {
            value: 0
        }
    }, {});
    const actions = makeObservable({
        increment () {
            store.counter.value++
        }
    })
    const selectors = makeObservable({
        get value () {
            return store.counter.value;
        }
    })
    function App() {
        useObservables();
        const {value} = selectors;
        const {increment} = actions;
        return (
            <div>
                <span>Count: {value}</span>
                <button onClick={increment}>Increment</button>
            </div>
        );
    }
```
Notice that we added **persist** here to save and restore the state to local storage.  In addition to saving and restoring your state to local or session storage, **persist** also makes the object observable.
### Classes
Classes, as we saw at the start of the chapter, offer a more compact way of expressing the problem domain. They do, however, have some challanges:

* They are harder to serialize
* Member functions must always be invoked as an object reference to set "this" correctly

Proxily solves both issues. 

For serialization and persistence to work just provide list of the classes:
```typescript
    const state = persist({
        counter: new CounterState()
    }, {classes: [CounterState]});
```
As to not requiring an object reference for member functions, you may have wondered how our class-based example got away with destructuring ***increment*** from ***counter***
```typescript
const {value, increment} = counter;
```
and then using it without an object reference (e.g. counter.increment())
```typescript jsx
<button onClick={increment}>Increment</button>
```
Proxily binds all members of an observable object to the target. This takes away one of the key pain-points of using classes.


### Your App, Your Choice

The choice of using POJOs or classes for your state is yours to make and Proxily works equally well with both.  Classes do, however, provide some tangible benefits:

* State and the code to modify that state are bound together, so it is clear which code is mutating which state.  This can be enforced using private properties.

* Classes are the most direct way to define types in Typescript.  They combine describing and typing state with assigning initial values, taking advantage of inference in many cases. 

* Defining initial values within the class ensures objects are initialized correctly.

* There is one single interface for both consuming and modifying any object in your state so there is no need to import a separate interface with actions and selectors. 

* You don't need to pass instance identifiers in your actions. 

* Class names are attached to your data making it possible to [log](../Features/tools#logging) both the class and method when state is mutated.

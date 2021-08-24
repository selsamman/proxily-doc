---
sidebar_position: 2
title: Core Concepts
id: core
---

## Observables
Proxily tracks references to state while your component renders.  It then ensures that your component is re-rendered anytime the referenced state properties change.  You make your state "observable" with [**makeObservable**](../API/observable#makeobservable) and then ask Proxily to track references with [**useObservables**](../API/observable#useObservable).
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

* **Actions** - Actions are usually responses to users interacting with your component. Any function that is a member of an observable object can be an action.  Proxily tracks the nesting of calls such that the top level function you call is considered to be the action for purposes of tooling and batching of reactions. You may also spin off asynchronous actions that use promises or that schedule tasks using redux-sagas. 

* **Selectors** - A selector is simply a Javascript [getter](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/get) method on an observable object.  You may optionally [memoize](../Features/observables#memoization) the selector for better performance on expensive calculations (e.g. sorts and filters).

While the proxily doesn't have a fixed opinion on how you set these up, you should pick a pattern and stick to it so that you have a consistent approach to managing state throughout your application.  The two main options are using POJOs for state, with separate actions and selectors or classes which combine them all together.

### POJOs

With traditional state management systems such as Redux you create your state using "plane old javascript objects" (POJOs), define reducers to generate a new state, and actions which are dispatched to invoke the reducers.  In Proxily you don't need reducers as your actions simply modify state directly.  You can, however, keep your state as POJOs and define your actions and selectors separately thus keeping a more traditional taxonomy:

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
Classes, as we saw at the start of the chapter, offer a more compact way of expressing the problem domain. They are not popular in React, simply because no framework, thus far, has made them easy to work with.  In Redux, they are a non-starter and in other frameworks such as mobx they are welcomed but still come with some limitations:
* You can't easily persist them since the framework does not know how to reconstitute them.
* Referencing member functions always requires an object reference to make "this" function correctly.

Proxily takes care of both issues.  Hopefully you spent some time wondering how the class-based example at the start could actually work?  

After all we just destructured ***increment*** from ***counter***
```typescript
const {value, increment} = counter;
```
and then used it without an object in the  reference (e.g. counter.increment())
```typescript jsx
<button onClick={increment}>Increment</button>
```
You would expect this to fail and might decide, as many have, that classes are just evil and should be avoided.  It won't fail, however.  That is because **Proxily binds all members of an observable object to the target**. This takes away one of the key pain-points of using classes.

The other issue, serializing and deserializing object graphs with classes, is also tackled by Proxily. Just provide a list of the classes you use:
```typescript
    const state = persist({
        counter: new CounterState()
    }, {classes: [CounterState]});
```
When serializing, Proxily will record the name of the class from the constructor and use that name to find the class you provided to reconstitute the object when serializing.

### Your App, Your Choice

The choice of using POJOs or classes for your state is yours to make and Proxily works equally well with both.  Given that Proxily makes classes more seamless you are free to reap the tangible benefits they provide:

* State and the code to modify that state are bound together, so it is clear which code is mutating your state.  This can be enforced using private properties.

* Classes are the most compact way to define types in Typescript because you are defining both the types and the initial state values together.  Classes are more of a standard feature than using Typescript interfaces which would otherwise be needed to accurately type your state.

* Because initial values are defined with the class you are assured that all new state objects have the correct initial state no matter how deeply they are nested.

* There is one single interface for both consuming and modifying any object in your state so there is no need to import a separate interface with actions and selectors. 

* You don't usually need to pass in instance identifiers as parameters to your actions, making for tidier JSX  ```onClick={toggleTodo}``` vs ```onClick={()=>toggleTodo(toDo)}```. In deeply nested structures with multiple levels of arrays you may have to pass in multiple levels of identifiers. 

* Class names travels with the data making it possible to [log](../Features/tools#logging) both the class and method when state is mutated. Same for redux-devtools integration.

Needless to say, used improperly, classes can be a burden.  Unless you are an experienced OO programmer you may want to leave inheritance out of the picture and just uses classes as convenient containers for organizing your state and the code that modifies your state.

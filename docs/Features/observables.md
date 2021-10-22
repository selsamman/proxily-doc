---
title: Observables
sidebar_position: 1
---
Observing state changes and reacting to them is the core of how Proxily manages state.  The process involves two pieces:

* **Observable** objects, wrapped by [**observable**](../API/observable#observable). That monitor both references to and mutations of state properties of the original object. The monitoring effect cascades automatically as you reference properties that contain other objects, such that all objects you reference from an observable object also become observable.
  ```typescript
  const state = observable({value1: "foo", value2: "bar"});
  ```
* **Observers** are notified about both references and mutations of observable objects and their properties.  This enables them to track the specific properties referenced and react a referenced property is mutated.

  * Components become observers when wrapped in **observer**.
    ```typescript jsx
    function Value1 () {  // Render if value1 changes
        return (<div>{state.value1}</div>);
    }
    export default observer(Value1)
    ``` 
  
  * Observers may be setup outside a component using [**observe**](../API/observable#observe). 
    ```typescript jsx
    observe(
        state, // Object to be observe
        () => console.log('Value1 changed'),  // Reaction 
        (state) => state.value1 // Only if value1 changes
    );
    ``` 

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
const counter = observable({
  value: 0
});

function App() {

  const [value, setValue] = useObservableProp(counter.value)
  
  return (
    <div>
      <span>
          Count: {value}
      </span>
      <button onClick={() => setValue(value + 1)}>
          Increment
      </button>
    </div>
  );

}

export default observable(App);
```
> **useObservableProp** must be passed an actually reference to the property rather than just the value.   ```useObservableProp(counterValue)``` won't work.

## Function Binding ##
Proxily automatically binds functions to their target object to ensure that "this." will always point to the correct object.

```
const {increment} = counter;
increment(); 
```
can be used in addition to
```
counter.increment()
```
This makes classes far more intuitive to consume. 

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
## Immutable as Needed
There are times when you may need the equivalent of immutable data.  This is when the recipient of an object expects that the reference to the object will change when any of the properties of the object change.  Examples include:
* useEffect dependencies
* useCallback dependencies
* useMemo dependencies
* 3rd Components that react to property changes
* Class-based components

***useAsImmutable*** will provide a reference to an object that will change when the object's properties change.  This is the same behaviour as with immutable state and what React expects in order to detect changes.  

Consider passing an array as a dependency to ***useEffect***.  Wrap the array reference in ***useAsImmutable*** will cause effect run everytime one of the array elements change:
```typescript
const news = observable({  
    topics: ["politics", "tech", "cooking"],
    results: {}
});

function MyComponent {

    // topics will change when it's elements change
    const topics = useAsImmutable(news.topics);  
    
    useEffect( () => {
        axios.get('/getStories?topics=' + topics.join(','))
             .then((r) => news.results = r.toJSON());
    }, [topics]);  
    // Render news.results
}
export default observable(MyComponent);
```
## Class Components ##
If you have class based components you can wrap them in a high order functional component (HOC) that passes the properties using ***useAsImmutable***.  Proxily provides a handy function [**bindObservables**](../API/observable#bindobservables) that does this for you:
```typescript jsx
class CounterState { // Your state
    private _value = 0;
    get value() {
        return this._value
    }

    increment() {
        this._value++
    }
}

const state = observable({  // Your Observable state
    counter: new CounterState()
});

// Class Based Component
class CounterClass extends React.Component<{ counter: CounterState }> {
    render() {
        const {value, increment} = this.props.counter;
        return (
            <div>
                <span>Count: {value}</span>
                <button onClick={increment}>Increment</button>
            </div>
        );
    }
}

// Wrap class-based component to make properties observable
const Counter = bindObservables(CounterClass);

function App() {
    return (
        <Counter counter={state.counter}/>
    );
}
```


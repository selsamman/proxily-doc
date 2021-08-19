---
title: Memoization
sidebar_position: 1
---
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

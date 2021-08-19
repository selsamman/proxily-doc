---
sidebar_position: 1
title: Usage
id: intro
---
## Global State Management for React

Proxily is a library for managing state in a non-prescriptive way. It re-renders components as state changes. While Proxily does not use immutable state it provides many of the same benefits. There is no need to annotate or describe the state shape as Proxily will discover it as it navigates through the state hierarchy. Core features include:

* Serialization and deserialization including complex state (cyclic data and classes)
* Persist state to localStorage, sessionStorage or other storage systems
* Asynchronous semantics through redux-sagas
* Time travel (undo, redo) in applications and with redux-devtools
* Transactions that allow asynchronous changes to be committed or rolled back
* Rich support for Typescript, classes and objects including automatic function binding
## Install Proxily
```javascript
yarn install proxily
```
or
```
npm install proxily
```
## Import and Use

```typescript
import {makeObservable, useObservables} from 'proxily';

const counter = makeObservable({value: 0});

function App() {
    useObservables();
    return (
        <div>
            <span>Count: {counter.value}</span>
            <button onClick={()=>counter.value++}>
                Increment
            </button>
        </div>
    );
}
```
## Compatability
Because of it's use of ES6 Proxies, Proxily does not support Internet Explorer and requires 0.69 or higher of React-Native.  Proxily is written in Typescript and targets ES6. Therefore, it is advisable to target ES6 in your applications and enjoy the smaller code size.
## Dependencies
Aside from react and react-dom Proxily has no dependencies.  If you make use of redux-sagas integration then you must add redux-saga to your project and additionally events in react-native.

---
sidebar_position: 5
title: Tool Integration
---
These are features of proxily that are important but less often used
## nonObservable
Sometimes you need for Proxily to leave certain properties alone and not create a proxy for them since they don't directly contain state and may function improperly if a proxy is created for them.

Two forms of **nonObservable** are allow for this:

As a decorator proceeding a property
```typescript
@nonObservable()
```

As a function that accepts a class or object, and it's property name(s)
```
nonObservable (obj : any, propOrProps : string | Array<string>)
```
As a function call to nominate either properties of an object or properties of a class as not being observable

| Item  | Description |
|-|-|
|obj| An object or a class |
|propsOrProps| An array of property names or a single property name|

In both cases the property will not be made observable.  This is important when objects that don't directly represent state are included in an object that will be made observable. 
## ObservableProvider
Sometimes you may want to create a new observable object and put it into a context.  This would be useful when iterating in JSX and requiring a new observable object such as a controller on each iteration.
```typescript
ObservableProvider = ({context, value, dependencies, transaction, children} : {
    context : any, 
    value : Function | any, 
    dependencies : Array<any>, 
    transaction?: Transaction, 
    children: any})
```
A component that can be used to create observable objects directly in JSX and place it into a context.

| Options  | Description |
|-|-|
| context | A context created by React.createContext |
| value | A callback function that will return an object to be made observable or the object itself |
| dependencies | An array of values that will be use to memoized the create of a new object based when the values change |
| transaction | An optional transaction if the observable object is to be part of a transaction |
| children | Child components are automatically passed in by using the component in JSX |
## groupUpdates 
Reactions to updates are normally batched such that they occur once per high-level function call.  In async functions this is not the case and so you can force the reactions to be batched by placing them in a **groupUptates** callback
```typescript
groupUpdates = (callback : Function))
```
Example:
```typescript
async doSomething () {
    this.prop1 = 100;
    await (new Promise((res : any) =>setTimeout(()=>res(), 1000)));
    groupUpdates( () => {
        this.prop2 = 200;
        this.prop3 = 300;
    })
}
```


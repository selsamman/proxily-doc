---
sidebar_position: 1
title: Observable API
---
## observable ##
```typescript
observable<T>(targetIn: T, transaction? : Transaction) : T
```

**observable** returns a proxy for a state object that will:
* Track references to properties when used [**useObservables**](#useobservables).
* React to property changes.  Components that call [**useObservables**](#useobservables) are re-rendered when properties those components reference are mutated.  
* Performs tracking and reacting outside of React components using [**observe**](#observe)
* Binds methods to the object, so they can be used without an object reference
* Handles the memoization of any methods annotated as being memoized.
* Extends this behaviour to referenced object by replacing them proxies.

| Item  | Description |
|-|-|
|targetIn| Any object representing state |
|transaction| An optional transaction|
|returns| A proxy for the targetIn of the same type |

**observable** is generally used outside of components at the start of the application to create long-lived observable objects that represent your store.  Observable objects may also be created for shorter live objects, tied to a component using [**useLocalObservable**](#uselocalobservable)

## observer ##
Wraps a component, making it an [**observer**] so it can react to any changes in referenced properties by rendering. 
```
function observer<P>(Component : FunctionComponent<P>, 
         options? : ObserverOptions) : NamedExoticComponent<P>
```
See [**observe**](#observer) for a description of options though they are rarely needed. 

As with other wrappers such as **React.memo** several syntax options are available.
```typescript
function Value1 () { s
    return (<div>{state.value1}</div>);
}
export default observer(Value1)
```
or for exporting named properties:
```typescript
export const Value1 = observer(function Value1 () { 
    return (<div>{state.value1}</div>);
});
```
finally this can be used but it won't preserve the name of the component for debugging:
```
export const Value1 = observer(() => { 
    return (<div>{state.value1}</div>);
});
```

Tracks usage of any observable objects and re-renders the component when any of those properties are mutated.  **useObservables** must only be used in a React functional component.  For class based components use [**bindObservables**](#bindobservables).  Outside of components use [**observe**](#observe).

See [observer](#observe) for more details on the **ObserverOptions**.  One relevant option,  **notifyParents** can be set to true to force re-rendering even when children of tracked properties are mutated. Can be useful if you have child components that don't know about Proxily but still need to be re-rendered when data changes.

## useObservableProp ##
```
useObservableProp<S>(value: S) : [S, (value: S) => void]
```
Returns an array where the 1st element is a property value and the second a function used to set the property value.  The property is the last one referenced.  By passing a reference to a property in the argument this established the property in the argument as the last reference.

Used like this:
```javascript
  const [value, setValue] = useObservableProp(counter.value)
```
Can only be used in a component wrapped as an [**observer**](#observer).

***setValue*** will be considered an action for tooling such as redux-devtools.

## memoize ##
Observable objects may have memoized getters or functions through **memoize**.  A memoized function will only be recalculated when any of the state that it consumes changes or when the arguments change.

It can be used as a decorator proceeding a member function
```typescript
@memoize()
```
or as a function that accepts a class or object, and it's member function name(s)
```
memoize (obj : any, propOrProps : string | Array<string>)
```
or as a function that accepts a class or an object plus a callback function that returns the property or method to be memoized:
```
memoize (obj: {new(...args: any[]): C} | C , cb :  (cls : C) => any)) 
```
**memoize** can only be used in functions that are properties of an observable object and cannot be used to make standalone functions memoized.  There are other libraries suitable for standalone memoization.

## nonObservable

Sometimes you need for Proxily to leave certain properties alone and not create a proxy for them since they don't directly contain state and may function improperly if a proxy is created for them.

Two forms of **nonObservable** are allowed for this:

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


## useLocalObservable ##
Creates an observable object tied to a component life-cycle
```
useLocalObservable<T>(callback : () => T, transaction? : Transaction) : T
```
Creates an observable object when the component mounts.  Generally this is for shorter lived observable objects.  The call back is only invoked once per component life-cycle and returns and object that will be made observable.  Used like this:
```
const sampleListController = useLocalObservable(() => new ListController(sampleToDoList))
```

## ObservableProvider

A component that creates an observable object and places it in a context of your choice.  Useful when iterating in JSX and requiring a new observable object on each iteration.
```typescript
ObservableProvider = ({context, value, dependencies, transaction, children} : {
    context : any, 
    value : Function | any, 
    dependencies : Array<any>, 
    transaction?: Transaction, 
    children: any})
```

| Options  | Description |
|-|-|
| context | A context created by React.createContext |
| value | A callback function that will return an object to be made observable or the object itself |
| dependencies | An array of values that will be used to memoized the creation of a new object based when the values change |
| transaction | An optional transaction if the observable object is to be part of a transaction |
| children | Child components are automatically passed in by using the component in JSX |

Here is an example that creates a new observable object for each todoListItem:
```
<ObservableProvider key={index} context={ListItemContext} dependencies={[item]}
                    value={() => new ListItemController(listController, item)}>
    <ListItem key={index}/>
</ObservableProvider>
```
In the component you reference the observable like this
```
    const listItem = useContext(ListItemContext)
```
ListItemContext must be created with React.createContext

## observe ##
```typescript
observe<T>(targetIn: T, 
            onChange : (target : string, prop : string) => void,  
            observer? : (target : T) => void,
            observationOptions? : ObserveOptions) 
            : ObservationContext

interface ObserverOptionsAll {
    batch: boolean,
    delay: number | undefined,
    notifyParents : boolean
}
```
Used outside a component to observe state changes.  For example, **persist** uses this internally to detect state changes and save them to local storage

| Item  | Description |
|-|-|
|targetIn| An observable object |
|onChange| A function that will be called when state in targetIn, or it's descendents change|
|observer| A function that is called to reference any properties that are to be observed.  If omitted all changes will be observed|
|observationOptions| see below |

| Option | Description |
|-|-|
| batch | defaults to true so that updates are batched as [described here](../Features/observables#batching-of-reactions). To disable batching set to false |
| delay | defaults to undefined which means that reactions are synchronous.  Set to a time delay if you wish reactions to be debounced to a given time interval in milliseconds |
| notifyParents | defaults to false meaning that if a state is mutated, only observers of that property will be notified.  If set to true, observers of parents of the state are also notified as is the case for the immutable paradigm |

## groupUpdates

Reactions to updates are normally batched such that they occur once per high-level function call.  In async functions this is not the case and so you can force the reactions to be batched by placing them in a **groupUpdates** callback
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

---
sidebar_position: 6
title: Utility API
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
Proxily provides this helper to do it for you.

| Options  | Description |
|-|-|
| context | A context created by React.createContext |
| value | A callback function that will return an object to be made observable or the object itself |
| dependencies | An array of values that will be use to memoized the create of a new object based when the values change |
| transaction | An optional transaction if the observable object is to be part of a transaction |
| children | Child components are automatically passed in by using the component in JSX |

In this example you only want to provide a new observable option for each instance of a todoList item
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
## TransactionProvider 
Sometimes you may want to create a new transaction and put it into a context:
```
TransactionProvider ({transaction, options, children} :
{transaction? : Transaction, options? : TransactionOptions, children: any})
```
Proxily provides this helper to do that for you.
```typescript jsx
import {TransactionProvider} from 'proxily';
function App () {
    return (
        <TransactionProvider>
            <UpdateCustomer customer={customer} />
        </TransactionProvider>
    )
}
```
Then reference the transaction with useContext rather than creating it in the component
```typescript
import {TransactionContext} from 'proxily';
...
const updateAddressTxn = useContext(TransactionContext);
```
You don't need to create the context as it can be imported from proxily

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


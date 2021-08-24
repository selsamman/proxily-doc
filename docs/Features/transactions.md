---
title: Transactions
sidebar_position: 4
---
### Use Cases
Forking the state is not a common feature of state management libraries.  To understand the benefits, here are a few common use cases:

* ***Asynchronous updates*** - Often updates from the server take several calls to complete and data is delivered in pieces.  Rather than putting intermediate data in the store which can impact integrity most applications will store up the results and then update the state when all calls have succeeded. Forking the state allows the state to be updated as each call to the server is completed.  If the operation as a whole fails, the saga controlling the server interaction and the partial updates can both be cancelled.

* ***Complex User Interactions*** - Sometimes a user interface requires a series of steps to complete.  Rather than updating the state at each step which is the simplest solution, components often store intermediate state locally until the steps are complete. With state forking the application doesn't need to worry about this and can use the normal process for updating the pieces of the state as the user goes along, knowing that the updates won't be visible until the end. Examples might include:
    * Modal dialogs that implement a cancel / OK button
    * Creating a new chat message which must have a recipient, subject and text to be complete
    * Filling out a form where there are required fields

* ***Undo/Redo*** - Some user interfaces require an undo/redo button. Other usually implement this through snapshots and patches which potentially impacts the entire store. Proxily can limit the scope of the undo/redo to a single set of actions using transactions.  Undoing an operation would not, for example, undo any other changes to the store made as result of unrelated synchronous operations that happened to occur during the course of user interaction.
### Creating a Transaction

To use a transaction in a component follow these steps:
* Place **useObservables** as usual at the start of your render
* Create the transaction with **useTransaction**
* Call **useTransactable** to get a transactable copy of the data you wish to participate in the transaction. Proxily will automatically make subordinate objects transactable as you reference them from the copy.
* Call **commit()** or **rollback()** on the transaction when the user interaction is complete and you wish the changes in your copies of the data to be reflect back to the original
```typescript jsx
function UpdateCustomer ({customer} : {customer : Customer}) {
    useObservables();
    const updateAddressTxn = useTransaction();
    customer = useTransactable(customer, updateAddressTxn);
    const {name, phone, setName, setPhone} = customer;
    return (
        <>
            <input type="text" value={name} 
                   onChange={(e) => setName(e.target.value)} />
            <input type="text" value={phone} 
                   onChange={(e) => setPhone(e.target.value)} />
            <button onClick={() => updateAddressTxn.commit()} >Commit</button>
            <button onClick={() => updateAddressTxn.rollback()} >Rollback</button>
        </>
    )
}

```
Sometimes a transaction may span multiple components.  In that case you can either create the transaction using **useTransaction** in the highest level component and pass it down via parameters or use **\<TransactionProvider\>**
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
With **\<TransactionProvider\>** you can then reference the transaction in your transaction with useContext rather than creating it in the component
```typescript
import {TransactionContext} from 'proxily';
...
const updateAddressTxn = useContext(TransactionContext);
```

### Transaction Object

The transaction objected produced by new Transaction has a number of functions and properties available to it.
* ***updateSequence*** - An update sequence number representing the current state.  This value can be used to remember a point in time, and then you can roll back the state to that point in time using ***rollTo***.
* ***rollTo(updateSequence : number)*** - Roll back or forward the transaction to a specific point.
* ***rollback()*** - Roll back the transaction by discarding all changes since the creation or the last rollback.
* ***commit()*** - Commit the changes in the transaction, so they are visible outside the transaction.
* ***undo()*** - Go back to the previous sequence number that represents the state at the start of a call to the outermost function.
* ***redo()*** - Go forward to the next sequence number that represents the state at the start of a call to the outermost function.
* ***canUndo*** - returns true if the undo function can be executed
* ***canRedo*** - returns true if the redo function can be executed

### How time positioning in transactions works ###

Time position (undo/redo/rollTo) is implemented by internally creating an array of function pairs that can undo/redo each update.  The current position in that array (normally the last entry) is the ***updateSequence** property in the Transaction object.  When you position backwards (undo() or rollback() to a lower number), Proxily executes the functions one at a time until you reach the desired sequence number.  At that point one of two things can happen:
* You reposition again
* You preform a state update

In the later case the current position becomes the last entry in this array by deleting all later entries.  Thus, if you **undo** or **rollTo** and make further state changes you can never go further forward in time.

A **rollback** does not use the array of undo/redo functions.  Instead, it simply updates all the of the target objects to the state of main store.

### Requesting incremental time positioning

Since implementing the internal undo/redo list has a performance impact on memory it is not turned on by default.  To enable it you create a transaction with TimePositioning as an option:
```
const txn = useTransaction({timePositioning: true});
```
### Default Transaction
There is a default transaction that is always present.  Normally it is created when you make your first observable object.  If you wish to include time positioning throughout your application you can pre-create the default transaction before any **makeObservable** or **persist** calls
```typescript
Transaction.createDefaultTransaction({timePositioning: true})
```
And you can reference the default transaction like this:
```typescript
Transaction.defaultTransaction.undo();
```
### Update Anomalies ###

When you commit you override any changes made outside the transaction that are made during the timespan between creating the transaction and committing.  This applies, however, only to data (objects) that you reference in the transaction.  Therefore, we recommend that you ensure that overlapping parts of the state are not simultaneously updated inside and outside the transaction.

Proxily applies a very simple forking mechanism to transactions.
* Proxily makes a copy of each object (using **Object.create** and **Object.assign**) as you reference it.  This includes built-ins such as Array, Map, Set and Date.  This copy becomes your new proxy during the course of the transaction.
* When you commit it copies the data back to the original
* When you roll back it copies the data from the original to the transaction copy

While this works in most circumstances there are some anomalies to be aware of:
* Under some circumstances changes stemming from the commit will be moot.  For example if you update the address of a customer that you deleted outside the transaction, the customer will remain deleted even if you commit the changes to update its address.
* Since Proxily copes the entirety of an Array, Map, Set and Date objects, any element updated in a transaction will overwrite any other changes in that object made outside the transaction.
* Changes made outside the transaction are isolated from the transaction as long they occur after the data has been referenced in the transaction.  This general works well since one usually creates the transaction in the course of the first render.
# Redux-DevTools

Proxily supports redux-devtools. We recommend only using in development mode and not in production since it stores all previous states in memory which can be more expensive than it would be with Redux.  To use it call **configureReduxDevTools** at the start of your app and **initReduxDevTools** after your state has been initialized.
```javascript
configureReduxDevTools();
const toDoList = makeObservable(new ToDoList();
initReduxDevTools();
```
There are some things to note about using redux-devtools:
* You can have multiple roots for your state that will appear in the tool
* Each time you call makeObservable (or use ObservableContextProvider) you are creating a root
* When you time travel all roots will be updated to the state they were in when a particular action was fired
* Because in Proxily you can create observable objects on the fly and discard them when no longer needed, time travelling backwards or forwards cannot re-create the objects for you.
* If you wish to have the same "single source of truth" for time-travel in redux-devtools as you have in Redux then you need create a single makeObservable object at the top of your app just as you would do with redux.

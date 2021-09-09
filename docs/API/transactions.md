---
sidebar_position: 4
title: Transaction API
---
A transaction is a context for state.  There is a default transaction that is automatically created.  Additional transactions may be created to create a copy of the state so that state may be mutated independently and then committed back to the default transaction. There are several ways to create a transaction:

* [**useTransaction**](#usetransaction) within a component
* [**new Transaction**](#transaction)  in code outside a component
* [**TransactionProvider**](#transactionprovider) create a transaction using jsx and place it in a context

## Transaction 
```typescript
new Transaction(options? : Partial<TransactionOptions>)

interface TransactionOptions {
    timePositioning: boolean
}
```

The transaction object has these properties and methods:

| Property / Method  | Description |
|-|-|
|undo()|Go back to the last state prior to the last top level method call|
|redo()|After undo(), redo() can go forward to the state after the next top level method call|
updateSequence : number| a number assigned to each state update that can be saved and then used in a **rollTo** called to time travel to that state|
|rollTo(sequence : number)| Time travel to a particular state |
|canUndo : boolean|**true** if there is a prior state than can be travelled to via undo()|
|canRedo : boolean|**ture** if there is a next state that can be travelled to via redo()|
|commit()|Commit state changes in the transaction back to main state|
|rollback()|Restore state from the main state|
|cleanup()| Cleanup any resources used by the transaction. Recommended when creating a transaction manually via **new Transaction**  |

Additionally, there is a static method for applying options (timeTravel) to your original state
```
Transaction.createDefaultTransaction(options? : Partial<TransactionOptions>)
```
If called prior to making any observables can be used to set options for the default transaction(primarily timePositioning) which allows undo/redo to be used for the main state.

> Commit and Rollback work at the object level.  This means that were you to make changes to the same object outside the transaction and inside the transaction, the object in the transaction will take precedence when you commit.  This includes Arrays, Sets and Maps which are replaced as a whole.

> Commit only creates the copy of the state as you reference objects and so it is best to reference all the data you need immediately after creating the transaction.


## useTransaction 
**useTransaction** can creates a transaction for use in a component.
```typescript
useTransaction(options? : Partial<TransactionOptions>)
```
The transaction can then be used in calls to **useTransactable**
## useTransactable

```typescript
useTransactable<A>(targetIn: A, transaction : Transaction) : A
```

Creates a copy of a part of the state tree that can be mutated independently as part of a transaction.

| Item  | Description |
|-|-|
|targetIn| An observable object|
|transaction| A transaction created by **new Transaction**, **useTransaction** or **TransactionProvider** |

## observable ##

[**observable**](observable#observable) also accepts a transaction and is used as the equivalent of useTransactable outside a functional component.


## TransactionProvider
A component that creates a new transaction and puts it into a TransactionContext:
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
Then reference the transaction with useContext
```typescript
import {TransactionContext} from 'proxily';
...
const updateAddressTxn = useContext(TransactionContext);
```
You don't need to create the context as it can be imported from proxily

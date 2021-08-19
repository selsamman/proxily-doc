---
sidebar_position: 3
title: Transactions
---
A transaction is a context for state.  There is a default transaction that is automatically created.  Additional transactions may be created to create a copy of the state so that state may be mutated independently and then committed back to the default transaction. There are several ways to create a transaction:


| | Component  | Methods |
|-|-|
| creation | TransactionProvider | new Transaction |
| usage | useTransactable | makeTransactable |


* **new Transaction**  in code outside a component
* **useTransaction** with a component
* **TransactionProvider** create a transaction using jsx and place it in a context

## new Transaction 
```typescript
new Transaction(options? : Partial<TransactionOptions>)

interface TransactionOptions {
    timePositioning: boolean
}
```

The transaction object has these properties and methods:

| Property / Method  | Description |
|-|-|
|cleanup()| Cleanup any resources used by the transaction. Recommended when creating a transaction manually via **new Transaction**  |
|updateSequence : number| a number assigned to each state update that can be saved and then useed in a **rollTo** called to time travel to that state|
|rollTo(sequence : number)| Time travel to a particular state |
|undo()|Go back to the last state prior to the last top level method call|
|redo()|After having gone backward, redo() can go forward to the state after the next top level method call|
|canUndo : boolean|True if there is a prior state than can be travelled to via undo()|
|canRedo : boolean|True if there is a next state that can be travelled to via redo()|
|commit()|Commit any changes in state related to the transaction back to main state associated with the default transaction|
|rollback()|Restore state associated with this transaction from the main state associated with the default transaction|

Additionally there is a static method
```
Transaction.createDefaultTransaction(options? : Partial<TransactionOptions>)
```
If called prior to making any observables can be used to set options for the default transaction(primarily timePositioning) which allows undo/redo to be used for main state.
## useTransaction 
**useTransaction** can be used in a functional component to create a transaction
```typescript
useTransaction(options? : Partial<TransactionOptions>)
```
It has the benefit that it will automatically cleanup the transaction when the component dismounts.  The transaction can then be used in calls to **useTransactable**
## useTransactable

```typescript
useTransactable<A>(targetIn: A, transaction : Transaction) : A
```

Creates a copy of a part of the state tree that can be mutated independently as part of a transaction.

| Item  | Description |
|-|-|
|targetIn| An observable object|
|transaction| A transaction created by **new Transaction**, **useTransaction** or **TransactionProvider** |

## makeObservable ##

[**makeObservable**](observable#makeobservable) also accepts a transaction and is used as the equivalent of useTransactable outside of a functional component.

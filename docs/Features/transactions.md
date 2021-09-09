---
title: Transactions
sidebar_position: 4
---
Transactions are a mechanisms to make a copy of your state that is independent of the original state.  It may be mutated independently and then the results merged back into the original state or undone.  Along the way you can undo and redo changes to state.  

While there are other solutions to achieving rollback and undo, they generally affect the state as whole.  For example, you could take snapshots of state and restore them. The benefit of Transactions is that rollback or undo only effects the part of the state that you mutate.  Other parts of your state are unaffected by the rollback or undo. This means you can, for example, have asynchronous parts of your application continue to update other parts of your state during a transaction life span.

## Use Cases

* ***Asynchronous updates*** - Often it takes several calls to a server to get a consistent update. To avoid having inconsistent state until the end one often has to store intermediate data outside the state management system.  A transaction lets you update state as you go along and commit or rollback upon completion or error.  

* ***Complex User Interactions*** - Sometimes a user interface requires a series of steps to complete.  Transactions let you update the state as usual rather than having to store results in an intermediate state. They can be committed when the user completes the steps or cancelled. 

* ***Undo/Redo*** - Transactions let you isolate undo/redo to one area of your application such that undo won't inadvertently undo other state changes.

## Creating a Transaction

To use a transaction in a component follow these steps:
* Component should be wrapped as an [**observer**](../API/observable#observer)
* Create the transaction with [**useTransaction**](../API/transactions#usetransaction)
* Call [**useTransactable**](../API/transactions#usetransactable) to get a transactable copy of the data you wish to make independent changes to. Proxily will automatically make subordinate objects transactable as you reference them from the transactable copy.
* Call [**commit()**](../API/transactions#transaction) or [**rollback()**](../API/transactions#transaction) on the transaction when the user interaction is complete, and you wish the changes in your copy of the data to be copied back to the original state.
```typescript jsx
function UpdateCustomer ({customer} : {customer : Customer}) {
    const updateAddressTxn = useTransaction();
    customer = useTransactable(customer, updateAddressTxn);
    const {name, phone, setName, setPhone} = customer;
    return (
        <>
            <input type="text" value={name} 
                   onChange={(e) => setName(e.target.value)} />
            <input type="text" value={phone} 
                   onChange={(e) => setPhone(e.target.value)} />
            <button onClick={() => updateAddressTxn.commit()} >
              Commit
            </button>
            <button onClick={() => updateAddressTxn.rollback()} >
              Rollback
            </button>
        </>
    )
}
export default observer(UpdateCustomer);
```

## Undo 

The time positioning feature in Proxily supports:
* **undo** - undo changes from the last action (top level method call)
* **redo** - redo the last undo
* **rollTo** - process multiple undo/redo calls to arrive at specific point in time

**commit** and **rollback** are independent of **undo** / **redo** and can both be used in the same transaction.

To enable undo/redo set it as an option in your transaction
```
const updateAddressTxn = useTransaction({timePositioning: true});
```
You can then add undo/redo buttons
```
<button disabled={!transaction.canUndo} 
        onClick={() => updateAddressTxn.undo()}> Undo </button>

<button disabled={!transaction.canRedo} 
        onClick={() => updateAddressTxn.redo()}> Redo </button>
```
If you want to enable undo/redo across your entire application you do it like this at the very start of the application.
```typescript
Transaction.createDefaultTransaction({timePositioning: true})
```
> Note that this does not give you the benefits of isolation.  If any other actions are called by asynchronous code they will also be undone.

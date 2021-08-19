---
sidebar_position: 4
title: Tool Integration
---
## configureReduxDevTools 
```typescript
 configureReduxDevTools(options? : any)
```
Configures redux devtools.  Note we don't recommend enabling dev tools in production because of memory consumption and the cost of creating a separate copy of state on each action.  The options are described in the [devtools documentation](https://github.com/zalmoxisus/redux-devtools-extension/blob/master/docs/API/Arguments.md).  Of these options only the following should be used:
* **name** in case you have multiple instances you wish to identify separately
* **latency** to avoid storing a state when actions are fired at close time intervals
* **maxAge** to set the maximum number actions stored
* **features** - to set particular features

This must be called prior to creating observable options

## initReduxDevTools
```typescript
initReduxDevTools()
```
Called to set the @@INIT state.  Normally would be called after setting up an initial state or after the call to persist

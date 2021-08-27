---
sidebar_position: 5
title: Tools API
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

## setLogLevel ##

```typescript
interface LogLevels {
    propertyChange : boolean
    render: boolean;
    propertyTracking : boolean
}

setLogLevel(levels : Partial<LogLevels>)
```

Sets the logging level globally for the application:
* **render** logs the rendering of each functional component along with the number of renders thus far.  Note that with **React.StrictMode**, now enabled by default in **Create React App**, you will see the render number go up in increments of two because an extra render occurs in development mode to weed out errors in side effects. '''ListItem render (2)'''

* **propertyTracking** logs each property that a component renders react-start ```
  ListItem Observer tracking ListController.selectedItem, StyleController.todoListStyle, TodoListStyle.listFontColor, TodoListStyle.fontSize, ToDoListItem.title, ToDoListItem.completed```

* **propertyChange** logs each time a property is mutated '''ToDoListItem.title = Hi'''

Note that the class name (e.g. **TodoListItem**) is only logged when you use classes.  Otherwise, it would show as ```Object.title = Hi```
## setLog

```
setLog(logFN : (data : string) => void)
```

Sets the logging function that will actually do the logging to one you provide.  This allows output to go to other locations.  You can also filter log entries.  For example:
```
setLog((l) => {
    if (l.match(/TodoListItem/))
        console.log(l);
});
```
## resetLogging
```
function resetLogging()
```
Resets the log levels and the logging function

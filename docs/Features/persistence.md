---
title: Persist & Serialize
sidebar_position: 2
---
### Persist
Proxily will integrate with localStorage, sessionStorage or any storage library that getItem and setItem .  This includes localStorage, sessionStorage and React Native's AsyncStorage.  Use **persist** to integrate your state with storage: 
```typescript
import {migrate, persist} from 'proxily';

const persistedObservableState = persist(state, 
    {classes: [TodoList, TodoListItem]});
```
**persist** makes the returned state observable, so you don't need to call makeObservable.  When using classes you need to provide a list of them so that your state can be properly reconstituted. 

Persist has a number of [options](../API/serial_persist#persist) such as which storage engine to use and how you want to merge your state.  You can provide a function to merge in the saved state with your initial state providing for upgrades to the state shape.

```typescript
const persistedObservableState = persist(state,
    {classes: [TodoList, TodoListItem], migrate: myMigrate});
    
function myMigrate (persist, initial) {
    delete persist.description; // unused property
    return migrate(persist, initial);
}
```
The benefit of using classes rather than POJOs for your state is that you don't need to provide migration logic simply because you add a new property to your state.  The initial value of that property will be set when the class is instantiated.

An easy way to get the list of classes is to re-export them in an index file in your store directory:

```typescript
export {ToDoList} from "./ToDoList";
export {ToDoListItem} from "./ToDoListItem";
export {TodoListStyle} from "./TodoListStyle";
```
And then get the values from that index file
```typescript
const classes = Object.values(require('./store'));
```
**There are [restrictions](#restrictions) on what can be in your state in order to persist or serialize it**
### Serialization
Serialization lets you take snapshots of your state.  It is also used internally by **persist** when you want to save and restore your state to local or session storage.  Proxily supports the serialization of complex objects, including cyclic references and classes.

Proxily **serialize** converts the object graph to JSON, discovering any objects discovered in the process and noting their constructor in the JSON.  When you call **deserialize**, Proxily does the opposite and re-instantiates the object graph.  It can cover cases where the same object instance is referenced in multiple places and cyclic patterns. Here is an example structure that includes multiple references to the same object
```typescript
class Box {
    x = 0;
    y = 0;
    constructor(x : number, y : number) {
        this.x = x;
        this.y = y;
    }
}

class Arrow {
    from;
    to;
    constructor(from : Box, to : Box) {
        this.from = from;
        this.to = to;
    }
}

class Drawing {
    boxes : Array<Box> = [];
    arrows : Array<Arrow> = [];
}
```
Assume it is initialized like this:
```typescript
    const drawing = new Drawing()
    const box1 = new Box(20, 40)
    const box2 = new Box(70, 70)
    const arrow1 = new Arrow(box1, box2)
    drawing.boxes.push(box1, box2)
    drawing.arrows.push(arrow1);
```
To serialize it:
```typescript
const json = serialize(drawing);
```
And to deserialize it:
```typescript
const newDrawing = deserialize(json, [Box, Arrow, Drawing]);
```
Note that to deserialize you need to provide an array of the Classes so that deserialize can re-instantiate objects from those classes.

### Restrictions

There are some constraints on the structure:
You can serialize anything that JSON.stringify / JSON.parse support plus:
* Dates
* Sets
* Maps
* Classes - deserialize will instantiate the class with an empty constructor and then copy over the properties.  Therefore, the class **must be creatable with an empty constructor**.

If you want to manually control the creation of objects or have classes that require specific parameters in the constructor you can pass a hash of class names and an associated function to instantiate the object.  It  will be passed the serialized data from the object and is expected to return the instantiated object.  A hash of custom revivers is the third (optional) parameter.

**deserialize** cannot reconstitute objects containing functions unless they are part of classes.  Also objects that contain internal objects (e.g. DOM element references, XMLHTTPRequest, Promises) of course will not be reconstituted properly.

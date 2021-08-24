---
title: Persistence & Serialization
sidebar_position: 2
---
### Persist
Proxily will integrate with any storage object that supports getItem and setItem.  Specifically this includes localStorage and sessionStorage.  To integrate with storage use **persist** to read from storage, merge with an initial state, set up a proxy and observe any changes to the proxy and write back to storage
```typescript
const stateProxy = persist(state, {classes: [Class1, Class2]});
```
The first parameter to persist is the initial state which is any structure supported by Proxily including plane objects or class based hierarchies.  The second parameter is the configuration which may include these properties:
* **storageEngine** - Any storage engine that supports getItem and setItem. Defaults to localStorage.
* **classes** - An array of classes used in the structure so they can be reconsititued properly
* **migrate** - A function which is passed the persisted state and the initial state and should return the new state.  It might, for example, enhance the persisted state to bring it up-to-date with the current application requirements and then merge it using the default merge routine exported from Proxily

The default migration logic will merge initial and persistent states giving preference to the persistent state.  It will merge multiple levels up to but not including properties of built-in objects or Arrays.
```typescript
import {migrate, persist} from 'proxily';
const classes = [TodoList, TodoListItem];
const persistedObservableState = persist(state, {classes , migrate: myMigrate});
function myMigrate (persist, initial) {
    delete persist.description; // unused property
    return migrate(persist, initial);
}
```
Note:  persist will also make the state returned observable so there is no need to additionally call makeObservable.

### Serialization
Serialization lets you take snapshots of your state.  It is also used internally by **persist** when you want to save and restore your state to local or session storage.  Proxily supports the serialization of complex objects including classes.

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

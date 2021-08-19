---
title: Serialization
sidebar_position: 3
---
Serialization let's you take snapshots of your state.  It is also used internally by **persist** when you want to save and restore your state to local or session storage.  Proxily supports the serialization of complex objects including classes.

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

There are some constraints on the structure:
You can serialize anything that JSON.stringify / JSON.parse support plus:
* Dates
* Sets
* Maps
* Classes - deserialize will instantiate the class with an empty constructor and then copy over the properties.  Therefore, the class must be creatable with an empty constructor.

If you want to manually control the creation of objects or have classes that require specific parameters in the constructor you can pass a hash of class names and an associated function to instantiate the object.  It  will be passed the serialized data from the object and is expected to return the instantiated object.  A hash of custom revivers is the third (optional) parameter.

**serialize** cannot process objects containing functions unless they use classes as there is no way to know how to reconstitute them.

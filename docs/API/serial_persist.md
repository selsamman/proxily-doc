---
sidebar_position: 2
title: Persist & Serialize API
---
## Persist ##
**persist** will integrate state with localStorage, sessionStorage or any storage system that supports getItem and setItem.  **js-freeze-dry** is used to do the serialization.

```typescript
export interface PersistConfig {
    key?: string,
    storageEngine?: StorageEngine,
    classes? : {[index: string] : any};
    serializers? : {[index: string] : (obj: any, type? : any)=>any};
    deserializers? : {[index: string] : (obj: any, type? : any)=>any};
    migrate?: (persistIn : any, initialIn : any) => any;
}

persist<T>(initialState: T, config : PersistConfig) : T
```
**persist** will:
* restore any saved state from storage
* make the returned state observable
* save your state to storage each time it is mutated (at most once per tick)

The first parameter to **persist** is the initial state which is any structure supported by Proxily including plane objects or class based hierarchies.  The second parameter is the configuration options described bellow:

| Option        | Description                                                                                                                                                                                                                                                                                                           |
|---------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| storageEngine | Any storage engine that supports getItem and setItem. Defaults to localStorage                                                                                                                                                                                                                                        |
| classes       | A hash of classes used in your state.  The key is the unmangled name of the class and the value is the class itself. You may use serializable to globally declare classes that are serializable.                                                                                                                      |
| serializers   | A hash of serialization functions that you can optionally use to modify data before it is serialized.   The key is the unmangled class name and the value is the function.  The function is passed each object and may return a copy which has been modified. You may user serializer to globally declare serializers |
| deserializers | A hash of deserialization functions that you can optionally use to modify data before it is serialized.   The key is the unmangled class name and the value is the function. The function should return an instantiation of the object. You may use deserializer to globally declare deserializers                    |
| migrate       | A function which is passed the persisted state and the initial state.  It should return the merged state.                                                                                                                                                                                                             |

The default migration logic will merge initial and persistent states giving preference to the persistent state.  It will merge multiple levels up to but not including properties of built-in objects or Arrays. 

Note that if you use classes you don't need to worry about adding new properties to state as the initial value of the new property will be present when the Class is reconstituted.

### Serialize

```typescript
function serialize(rootObj : any, 
                   classes? : {[index: string] : any}, 
                   serializers? : {[index: string] : (obj: any, type? : any) => any}, type? : any) 
```
Serializes an object returning a string that can be deserialized.

* **classes** is an optional parameter to define the same values as would be passed to serializable
* **serializers** is an optional parameter to define the same values as would be passed to serializer
* **type** is an optional type that is passed as the 2nd argument to the serializer.


It returns a JSON string.  While the string can be parsed with JSON.parse it will parse into an internal format that has types and id's and so really is only useful for processing by deserialize.  See the restrictions above on the data that can be processed in this fashion.
### Deserialize
```typescript
deserialize(json : string, 
            classes? : {[index: string] : any},
            deserializers? : {[index: string] : (obj: any, type? : any) => any})
```
* **classes** is an optional parameter to define the same values as would be passed to serializable
* **deserializers** is an optional parameter to define the same values as would be passed to deserializer
* **type** is an optional type that is passed as the 2nd argument to the deserializer.


Returns an instance of an object.

### Serializer ###

```
function serializer (classHelpers? : {[index: string] : (obj: any)=>any}) 
```
Establishes one or more serializer functions identified by a key that represents the name of the class.  The function will be passed an object to be serialized and optionally a type passed to serialize.  The function is expected to return the data to be serialized.  It should not mutate the data but rather make a copy if the data must be changed prior to serialization.  For example:
```
serializer({Box: (box : Box) => ({...box, name: encrypt(box.name)}) });
```

### Deserializer ###

```
function deserializer(classHelpers?: {[index: string] : (obj: any, type? : any) => any})
```
Establishes one or more deserializer functions identified by a key that represents the name of the class.  The function will be passed the data of an object to be deserialized and optionally a type passed to serialize.  The function is expected to return an instance of the object.  For example:
```
deserializer({Box: (box : Box) => new Box(box.x, box.y, decrypt(box.name)) });
```

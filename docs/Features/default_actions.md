---
title: Action Helpers
sidebar_position: 2
---
## Default Setters
Sometimes you have a large collection of properties in your state that you want to render in a component and modify in response to a user interaction.  Proxily contains a useful helper for this case.  **useObservableProp** will return a getter and a setter for a given property.

```javascript
const counter = makeObservable({
  value: 0
});

function App() {
  useObservables();
  const [value, setValue] = useObservableProp(counter.value)
  return (
    <div>
      <span>Count: {value}</span>
      <button onClick={() => setValue(value + 1)}>Increment</button>
    </div>
  );

}
```
**useObservableProp** will create return the value of the prop as well as function that can be used to set the prop.  The specific prop is the last prop referenced which by convention is the argument to **useObservableProp**.  Be sure to also include **useObservables** before calling **useObservableProp**.

***setValue*** will be considered an action for tooling such as redux-devtools.


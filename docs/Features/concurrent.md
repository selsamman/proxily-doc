---
sidebar_position: 6
title: React 18
---
> React 18 is currently in alpha.  Features have changed since the alpha started and may continue to change. A beta release is anticipated in the fall of 2021.

## New Features
React 18 brings some new capabilities to improve the UX experience.  Those that are relavent to Proxily include:

* **Concurrent Rendering** Allows React to break up rendering and prioritize it. It can abandon renders when state changes and rendering components off-screen first while continuing to display a previous version of the component on-screen.  This feature is fully realized when used in conjunction with **transitions**, **deferred values** and **suspense** described below.

* **Transitions** are a way to mark state updates that will trigger a transition.  The transition consists of off-screen rendering of components with the updated state while continuing to render components on-screen with previous state.  The off-screen render results are brought on-screen only when the entire transition is complete including rendering suspended elements (see below). 

* **Deferred Values** gives the on-screen version of the component access to the previous state while the off-screen version renders with the updated values.  This is useful to avoid triggering a render of child components in the on-screen version of a component that might lead to lags in responsiveness. 

* **Suspense** allows a stand-in to be displayed while waiting for data that is not yet ready to be displayed.  Importantly,  React continues to render off-screen the suspended content, so it can get deliver it sooner. This effectively allows multiple streams to be fetched simultaneously rather than sequentially.

## Proxily Support

The magic of off-screen rendering is possible because React is capable of "branching" state.  In effect multiple versions of the state are kept such that the on-screen version of the component has access to the original values and off-screen version gets the updated values.  

There are two ways to access the older values in the on-screen version of a component:

* Any state updates that are marked as being part of a transition by being wrapped in a ```startTransition``` callback are always fed to the future off-screen version of component while the transition is in progress.

* Previous values can be specifically requested for the benefit of the on-screen version of the component by using a new ```getDeferredValue``` function. 

Branching is intended to be used with React's native setState or by passing values through component props or contexts.  Proxily provides mechanisms to achieve this functionality with observable state.

## Transitions 

### With setState

To use a transition you wrap the code that updates the state that will trigger the transition in a **startTransition** callback:
```typescript
import {useTransition} from 'React';

// In component ....
const [isPending, startTransition] = useTransition();
const [something, setSomething] = useState("");
someEvent = () =>
    startTransition( () => {
        setSomething(newValue); // New value for transition
    });
}
```
At this point React will render off-screen components that depend on the state change and continue to render on-screen components with the state prior to the transition. You can use **isPending** to display an indication that a transition is in progress.

### With Observables

To use transitions with **observable** state you need to use a slightly different way of starting your transition
```typescript
import {useObservableTransition} from 'proxily';
const myState = observable({something: ""});

// In observer component ...
const [isPending, startTransition] = useObservableTransition();
someEvent = () =>
  startTransition( () => {
     myState.something = newValue // New value for transition
  });
}
```
If you don't need **isPending** use **useObservableStartTransition** to get your **startTransition**. 
```typescript
import {useObservableStartTransition} from 'proxily';
const startTransition = useObservableStartTransition();
...
```

## Deferred Values

### With setState

For values set with **useState**, you can simply request the prior version of a value with **getDeferredState**:
```
  const [text, setText] = useState("hello");
  const previousText = getDeferredState(text);
  incrementHandler (e) => setText(e.target.value);
```
Note this applies to the on-screen version of the component. 

### With Observables

For observables you need to request the previous value of an observable with **getDeferredObservable** and wrap the code that sets the value in a **setDeferredObservable** callback.
```
  const state = {text: "hello"};
  ...
  const [{previousText}, setDeferredObservable] = useDeferredObservable(state);
  incrementHandler (e) => 
     setDeferredObservable(() => state.text = e.target.value);
```  

## Suspense ##

Proxily allows a suspense stand-in to be displayed while asynchronously fetched data is still pending. To use this feature:
* Put your data fetching in a getter in an observable.  It can parameterize the fetch with other data in the observable and will keep the query up-to-date. 
  ```
  class MyState = {
    profileId = 1,
    get profile() {
      fetch(url + '&id=' + this.profileId).then(r => r.json())
    }
  }
  state = observable(new MyState());
  ```
* Then tell proxily you want it to be suspendable which will wrap the fetch in the appropriate promise protocol for using Suspense.

  ```
  suspendable(MyState, 'profile`)
  ```
  or with a decorator
  ```
  @suspendable()
  get profile() {
      fetch(url + '&id=' + this.profileId).then(r => r.json())
  }
* Then just use the value in a **<Suspense\>**
  ```
  <Suspense fallback={<h1>Loading user...</h1>}>
     <div>{state.profile.details}</div>
  </Suspense>
  ```
* When you change the profile id in an event handler, the profile getter will be re-evaluated.  The fallback will re-appear until the new profile is fetched.  
  ```
  someEvent = (e) => state.profileId = e.target.value;
  ``` 
  You can keep the old value on screen by wrapping the update in a transition:
  ```
  someEvent = (e) => 
      startObservableTransition(() => state.profileId = e.target.value);
  ```
## Experimental
These features have to be considered experimental until React reaches the beta stage.  At present they have been tested in sample applications with React 18,  but Proxily itself still has all of its internal unit testing using prior version of React until a new testing library is released that supports React 18.

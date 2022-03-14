---
sidebar_position: 6
title: React 18
---

## New Features
React 18 brings some new capabilities to improve the UX experience. Concurrent Rendering allows React to break up rendering and prioritize it. It can abandon renders when state changes and the rendering components off-screen in preparation for a transition while continuing to display a previous version of  components on-screen.  This feature is fully realized when used in conjunction with **transitions**, **deferred values** and **suspense** described below.

* **Transitions** are a way to mark state updates that will trigger a transition.  The transition consists of off-screen rendering of components with the updated state while continuing to render components on-screen with previous state.  The off-screen render results are brought on-screen only when the entire transition is complete including rendering suspended elements (see below). 

* **Deferred Values** gives the on-screen version of the component access to the previous state while the off-screen version renders with the updated values.  This is useful to avoid triggering a render of child components in the on-screen version of a component that might lead to lags in responsiveness. 

* **Suspense** allows a stand-in to be displayed while waiting for data that is not yet ready to be displayed.  Importantly,  React continues to render off-screen the suspended content, so it can get deliver it sooner. This effectively allows multiple streams to be fetched simultaneously rather than sequentially.

## Proxily Support

The magic of off-screen rendering is possible because React is capable of "branching" state.  In effect multiple versions of the state are kept such that the on-screen version of the component has access to the original values and the off-screen version gets the updated values.  

There are two ways to access the older values in the on-screen version of a component:

* Any state updates that are marked as being part of a transition by being wrapped in a ```startTransition``` callback are always fed to the future off-screen version of component while the transition is in progress.

* Previous values can be specifically requested for the benefit of the on-screen version of the component by using a new ```getDeferredValue``` function. 

This state "branching" is intended to be used with React's native setState or by passing values through component props or contexts.  Proxily provides mechanisms to achieve this functionality with observable state.

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

Transitions with **observable** in Proxily deal with your entire state and allow it to be branched. The way of using it is quite similar, just substituting useObservableTransition for useTransition.
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
When you update your state within the startTransition you are "branching" your state and Proxily will provide the old state the component currently on the screen and the current state to another copy of the component that React renders off-screen.

If you don't to update the component currently on the screen while the off-screen rendering is progress (e.g. don't need **isPending** and won't be using **getCurrentValue** you may use **useObservableStartTransition** to get your **startTransition**.   
```typescript
import {useObservableStartTransition} from 'proxily';
const startTransition = useObservableStartTransition();
...
```

### Keeping the UI Responsive with getCurrentValue
You don't have to do anything special to take advantage of this advance off-screen rendering unless you need access to the current value of your state.  This might be, for example if you are providing feedback to the user on input they may have provided. 

In case you want to get the current value of the state rather than the stale value that is normally provided during the transition you can access it using ***getCurrentValue***.  

```
const updatedText = getCurrentValue(state, state => state.text);
```

***getCurrentValue*** is serves a similar purpose as ***useDeferredValue*** except that:
* It must be used along with a transition
* It provides the eventual state rather than the previous state

### Putting it all together

```
const state = observable({
    searchText: ""
    articles : []
});

function SearchList () {
 const [,startTransition] = useObservableTransition();
 const change(e) => startTransition(() => state.result.text = e.target.value;
 return (
     <>
        <input value={getCurrentValue(state, state => state.searchText)}
               onChange={change}/>
        <Articles search={state.searchText}/>       
     </>
 )
}
export observer(SearchList);
```
Here is what will happen:
* When you update search results as part of the startTransition callback you are letting both React and Proxily know that a transition is beginning
* Proxily will update your state immediately but keep the original value around until the transition is complete.
* React will immediately re-render the on-screen component and Proxily will provide the component with the original value of the data because the transition is still in progress.
* However, input field sees the current value through **getCurrentValue** 
* The Articles component is passed the old search value and assuming it uses memo it won't re-render at that point.
* React will render the component again off-screen. Proxily will provide the new value for searchText so Articles will now render but at a lower priority.  
* The lower priority means that if you type more search criteria into the input the rendering will be cut short once the current article renders and the whole process repeats itself.

Had we not used the transition the screen would not be updated until the articles all rendered.

> Be sure to use **useObservableTransition** rather than **useObservableStartTransition** since you need to re-render the component to show the updated input value while the off-screen rendering takes place.

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

---
title: Batching Reactions
sidebar_position: 6
---
React contains a mechanism to avoid excessive renders in response to state changes.  Basically it schedules state updates which cause renders after user-initiated events complete.  If your onClick handler updates state many times in that code it will result in only one render.

In asynchronous situations this is not the case (prior to React 18) since there is no event that React knows about that can be used determine create a boundary around a sequence of state updates.  React 18 will batch and schedule all state updates so for the case of rendering this will no longer be an issue.

With Proxily all state mutations are synchronous and never batched.  The way that redundant renders are eliminated is to defer the reaction to the state change (e.g. the render itself) and batch them.    Renders, however, are not the only possible reaction to state change.  Proxily also supports reactions to changes in state through the **observe** call.  This is used internally in the **persist** call to update local storage with state changes.

This are the rules for batching reactions to state changes:

* A reaction only occurs when the top level call to a method in an observable component completes such that a reaction will never occur while a series of potentially related state updates complete.
* This batching of nested reactions only applies to synchronous methods.  Asynchronous methods return a promise in response to an await or return after scheduling a callback.  The promise fulfillment or callback is no longer nested within the outer asynchronous function.  Therefore multiple state updates occuring after an await, in the promise fulfillment or in a callback do not cause reactions to be batched. 
* To ensure batching of reactions in asyncronous calls you simply need to wrap them in a method call or use **groupUpdate**

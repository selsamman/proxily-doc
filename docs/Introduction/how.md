---
sidebar_position: 3
title: How it Works
id: how
---

## ES6 Proxies

Although you don't need to know all the details, Proxily performs its magic using ES6 proxies.  **makeObservable** creates a proxy for an object.  Then, when you use that proxy to reference further into your state object hierarchy, Proxily will replace references to deeper objects with references to a proxy.  Your entire state will end up being proxied as you reference it.

As this happens the shape of your state is noted such that you don't need to annotate relationships.  The proxies will notify any components that contain **useObservables** when properties they reference change. The relationship information is used to ensure that parent components are also notified when child data changes as is the case for the immutable pattern. Other parts of your application outside of components may also make and observe changes to your state.



## Design Goals

We build on the shoulders of giants. Redux, Redux-toolkit, MobX and MobX-state-tree are all very effective mechanisms for reacting to state changes and can handle complex applications.  Redux (especially redux-toolkit) is the standard-bearer with a rich set of tools including redux-devtools and redux-saga. If you are not religious about immutable state then MobX is one of the more popular mutable state solutions but lacks some capabilities of Redux. MobX-state-tree is an evolution of MobX that imposes a high degree of structure on your application but provides additional benefits such as serialization, redux-dev-tools integration, time-travel, snapshots and generator support.  mobx-keystone goes even further with transactions.  Bot of these, however, use a proprietary type definition system.

Proxily attempts to be the best of all worlds in the realm of mutable state management.  It uses non-proprietary language features to define your state and logic yet offers most of the features of Redux out-of-the box including time-travel, redux-devtools integration, serialization, persistence and redux-saga integration.  Best practices are to use Typescript to construct your state and business logic. This way your IDE is fully aware of your  structure. It also means:
* You have all the tools class have to offer at your disposal
* Robustness through extensive error checking at compile time
* Your IDE and autofill many elements of the application
* It is easy to find references to anything anywhere in your application
* Refactoring is far easier (e.g. renaming a property renames all usages)
* Classes make automatic serialization and deserialization possible

In short, we believe that Proxily is the simplest full-featured React state management system available at this time. 

## Getting to Know Proxily

Have a read through this documentation or take a lood at one of the sample Todo Applications:
* [Classic Todo Application](https://github.com/selsamman/proxily_react_todo_classic) is the standard redux style todo.  The structure is very simple and easy to follow.
* [Todo Application](https://github.com/selsamman/proxily-react-todo) that demonstrates the unique features of Proxily as well as best practices.


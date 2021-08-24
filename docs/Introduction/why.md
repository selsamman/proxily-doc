---
sidebar_position: 3
title: Why Proxily?
id: how
---
Redux, Redux-toolkit, MobX and MobX-state-tree are all very effective mechanisms for managing state changes in complex applications. There are also a number of newer state management libraries such as Recoil, Hook State and Akita and many more.

Redux-toolkit is the standard-bearer with a rich set of tools including redux-devtools and redux-sagas. 
If you are not religious about immutable state, then MobX is one of the more popular mutable state solutions.  Like Proxily it is mostly unopinionated about how you set up your state.  This comes with some limitation in terms of providing all the features that Redux can provide because Redux assumes a "plane object" state.  MobX-state-tree is an evolution of MobX that imposes a high degree of structure on your application but provides additional benefits such as serialization, redux-dev-tools integration, time-travel, snapshots and generator support.  mobx-keystone goes even further with transactions (drafts).  Both of these, like most state management solutions, use a proprietary state definition system. 

With so many choices, why would anyone create yet another state management library?  It is because a full-featured, unopinionated library, where state could be defined using only standard Javascript language features was still non-existent.  Now it does exist and the tangible benefits are:

* The simplicity of mutable state with features of immutable state
* Easily readable and understandable state definitions without relying on a proprietary format
* All the accessory features such as persistence, serialization, redux-devtools and redux-sagas integration
* Unique features such as Transactions with undo/redo commit/rollback

We believe Proxily is the simplest full-featured, mutable state management system for React available at this time.  The author, Sam Elsamman has written other frameworks, such as [Amorphic](https://medium.com/haven-life/an-introduction-to-the-isomorphic-paradigm-using-amorphic-b7a8071ca11f), and [redux-capi](https://selsamman.github.io/redux-capi/docs/intro), a redux-based state management library for react. Sam's state management frameworks are in use in applications such as [Gymanize](https://gymanize.com/) and [Cdash19](https://cdash19.com/)


Please give Proxily a try, [tell us what you think](https://github.com/selsamman/proxily/discussions) and leave a star if you like what you see.




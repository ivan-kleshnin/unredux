# 5. Todos History

```
$ npm install
$ npm start
```

#### Compare to

* [Redux Undo-Redo todos](https://github.com/reactjs/redux/tree/master/examples/todos-with-undo)

## Remarks

Why we keep saying object-oriented design is a pale copy of function design? One of the reasons is
that you can reorder middlewares, getting new and predictable semantics:

```js
D.run(
  () => D.makeStore({}),
  D.withLog({key}),                     // 1) this logger is aware of history
  D.withLocalStoragePersistence({key}), // 3) this storage is aware of history (clear localStorage before switching between 3) and 4)!)
  D.withHistory({}),
  // D.withLog({key}),                     // 2) this logger is unaware of history
  // D.withLocalStoragePersistence({key}), // 4) this storage is unaware of history (clear localStorage before switching between 3) and 4)!)
)
```

Which is impossible to achieve with hard-coded inheritance chains. You could reach the same level
of flexibility only with dynamically created mixins (limiting you to dynamically typed languages).

But it would still produce instances, not plain objects, and instances are impossible to modify in
the immutable fashion:

* `R.merge(obj, {newKey: newValue})` – :thumbsup:
* `R.merge(instance, {newKey: newValue})` – :thumbsdown:

Which counts as another *killing* counter-argument... The list goes much longer but (the point is) even
these two are completely enough to forever ditch OOP.

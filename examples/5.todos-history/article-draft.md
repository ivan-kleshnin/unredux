```js
intents.addTodo.next("Bar") // 1) Add "Bar" todo
intents.undo.next()         // 2) Undo
intents.addTodo.next("Baz") // 3) Add "Baz" todo
```

0. Initial

```js
log: [
  null,
  null,
  {todos: {'1': 'Foo'}}
]
i: 2
```

`log` contains the history. The length of `log` is always the length of the tracked history.
`i` is a marker of the current state. It points to the last item unless we applied some undos (not paired
by the corresponding number of redos) and did not make any basic action since then.

Any basic action after undo erases all the undoed log items. It's done this way in every history
implementation I met, and it's probably the only *intuitive* behavior possible.

1. Add "Bar" todo

```js
log: [
  null,
  {todos: {'1': 'Foo'}},
  {todos: {'1': 'Foo', '2': 'Bar'}}
]
i: 2
```

New state items come from the right and shift other log items to the left.

2. Undo

```js
log: [
  null,
  {todos: {'1': 'Foo'}},
  {todos: {'1': 'Foo', '2': 'Bar'}}
]
i: 1
```

Undo changes the current state marker. It points to the middle item here, not to the last as usual.
Note that the last item is not deleted to keep the possibility of redo.

3. Add "Baz" todo

```js
log: [
  null,
  {todos: {'1': 'Foo'}},
  {todos: {'1': 'Foo', '2': 'Bar', '3': 'Baz'}}
]
i: 2
```

Redo wasn't triggered. So the state comes into the place of `{'1': 'Foo', '2': 'Bar'}` effectively
erasing it. We can't undo to this state anymore because we started a new history after our
one-step undo.

---

```js
intents.addTodo.next("Bar") // 1) Add "Bar" todo
intents.undo.next()         // 2) Undo
intents.addTodo.next("Baz") // 3) Add "Baz" todo
```

0. Initial

```js
log: [
  null,
  null,
  {todos: {'1': 'Foo'}}
]
i: 2
```

`log` contains the history. The length of `log` is always the length of the tracked history.
`i` is a marker of the current state. It points to the last item unless we applied some undos (not paired
by the corresponding number of redos) and did not make any basic action since then.

Any basic action after undo erases all the undoed log items. It's done this way in every history
implementation I met, and it's probably the only *intuitive* behavior possible.

1. Add "Bar" todo

```js
log: [
  null,
  {todos: {'1': 'Foo'}},
  {todos: {'1': 'Foo', '2': 'Bar'}}
]
i: 2
```

New state items come from the right and shift other log items to the left.

2. Undo

```js
log: [
  null,
  {todos: {'1': 'Foo'}},
  {todos: {'1': 'Foo', '2': 'Bar'}}
]
i: 1
```

Undo changes the current state marker. It points to the middle item here, not to the last as usual.
Note that the last item is not deleted to keep the possibility of redo.

3. Add "Baz" todo

```js
log: [
  null,
  {todos: {'1': 'Foo'}},
  {todos: {'1': 'Foo', '2': 'Bar', '3': 'Baz'}}
]
i: 2
```

Redo wasn't triggered. So the state comes into the place of `{'1': 'Foo', '2': 'Bar'}` effectively
erasing it. We can't undo to this state anymore because we started a new history after our
one-step undo.

---

```js
intents.addTodo.next("Bar") // 1) Add "Bar" todo
intents.undo.next()         // 2) Undo
intents.addTodo.next("Baz") // 3) Add "Baz" todo
```

0. Initial

```js
log: [
  null,
  null,
  {todos: {'1': 'Foo'}}
]
i: 2
```

`log` contains the history. The length of `log` is always the length of the tracked history.
`i` is a marker of the current state. It points to the last item unless we applied some undos (not paired
by the corresponding number of redos) and did not make any basic action since then.

Any basic action after undo erases all the undoed log items. It's done this way in every history
implementation I met, and it's probably the only *intuitive* behavior possible.

1. Add "Bar" todo

```js
log: [
  null,
  {todos: {'1': 'Foo'}},
  {todos: {'1': 'Foo', '2': 'Bar'}}
]
i: 2
```

New state items come from the right and shift other log items to the left.

2. Undo

```js
log: [
  null,
  {todos: {'1': 'Foo'}},
  {todos: {'1': 'Foo', '2': 'Bar'}}
]
i: 1
```

Undo decrements the current state marker. Now it points to the second item, not to the last.
Note that the last item is not deleted to keep the possibility of redo.

3. Add "Baz" todo

```js
log: [
  null,
  {todos: {'1': 'Foo'}},
  {todos: {'1': 'Foo', '2': 'Bar', '3': 'Baz'}}
]
i: 2
```

Redo wasn't triggered. So the state comes into the place of `{'1': 'Foo', '2': 'Bar'}` effectively
erasing it. We can't undo to this state anymore because we started a new history after our
one-step undo.

---

```js
intents.addTodo.next("Bar") // 1) Add "Bar" todo
intents.undo.next()         // 2) Undo
intents.redo.next()         // 3) Redo
intents.addTodo.next("Baz") // 4) Add "Baz" todo
intents.addTodo.next("Qux") // 5) Add "Qux" todo
```

0. Initial

```js
log: [
  null,
  null,
  {todos: {'1': 'Foo'}}
]
i: 2
```

Everything as it was before.

1. Add "Bar" todo

```js
log: [
  null,
  {todos: {'1': 'Foo'}},
  {todos: {'1': 'Foo', '2': 'Bar'}}
]
i: 2
```

Everything as it was before.

2. Undo

```js
log: [
  null,
  {todos: {'1': 'Foo'}},
  {todos: {'1': 'Foo', '2': 'Bar'}}
]
i: 1
```

Everything as it was before: undo decrements the current state marker.

3. Redo

```js
log: [
  null,
  {todos: {'1': 'Foo'}},
  {todos: {'1': 'Foo', '2': 'Bar'}}
]
i: 2
```

Redo increments the current state marker, basically "undoing undo".

4. Add "Baz" todo

```js
log: [
  {todos: {'1': 'Foo'}},
  {todos: {'1': 'Foo', '2': 'Bar'}}
  {todos: {'1': 'Foo', '2': 'Bar', '3': 'Baz'}}
]
i: 2
```

Now the history continues, like nothing happened with those undo/redo experiments.

5. Add "Qux" todo

```js
log: [
  {todos: {'1': 'Foo', '2': 'Bar'}}
  {todos: {'1': 'Foo', '2': 'Bar', '3': 'Baz'}}
  {todos: {'1': 'Foo', '2': 'Bar', '3': 'Baz', '4': 'Qux'}}
]
i: 2
```

The history log tails as expected. We can not longer see the `{todos: {'1': 'Foo'}}` state
because our history spans only 3 steps.

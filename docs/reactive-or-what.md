# Reactive or... what?

What it the opposite of being "reactive"? Should we always say "non-reactive" like it's something bad?
Let's start with a more simple question and accept, at first, that there are two types of programs:
**one-off** and **interactive**. Those terms aren't *official* but neither are, which is strange, by
the way, because it's such a fundamental distinction!

One-off programs have no loop. Examples: command line utils. The result of their work is their
return value and the side effects made during their run time. The run time is an unnecessary evil.
We can definitely apply the rule "the faster – the better" for them. Moreover, the time is the enemy
of one-off programs. Check that file exists. Write to it. If the file disappears between those two –
we have a bug. Efficiency metrics: throughput. Common optimization technique: parallelism.

Interactive programs (basically, it's what we often call "applications") have a loop inside them.
Examples: servers (web, database, etc.), games, cronjobs (egde case). The result of their work
is both the process itself (being ready to respond to the request) and the side-effects it makes.
Efficiency metrics: latency. Common optimization technique: concurrency.

So back to "reactive". Andre Staltz "proposed" (in quotes because it wasn't formally a *proposition*)
two words as definitions of being non-reactive: interactive and passive. I don't particularly like both.

"Interactive" sounds good, the word is not too overloaded. The problem comes with connotations.
Reactive architectures fit the best for Interactive systems. So we have a contradiction.

"Passive" is even worth because in non-reactive systems we mostly deal with the active part.
Contradiction in its essence.

```
------------------> time
emitter <- reactor
active -> passive
------------------> time
```

From [dataflows](https://github.com/ivan-kleshnin/dataflows).

To break this wall we can try to search for inspirational ideas outside of the programming field.
We'll quickly find one particularly curious binary group: "proactive vs reactive" in the field of Psychology.
"Proactive" basically means "doing something *before* something else happens" while "reactive" carries
the opposite meaning: "doing something *after* something else happens".

That's kinda interesting because it seems to describe OUR situation exceptionally well.
In the `emitter <- reactor` case we code "something that happens after something".
In the `active -> passive` case we code "something that will happen after something".

* In the **proactive** case we look into the future.
* In the **reactive** case we look into the past.

The repetion of the "active" suffix here is an additional clue that "passive" is a wrong term
to describe non-reactive systems. Anyway, "passive" and "active" terms are just are too vague and ambiguos.
Telling people you're doing "active programming" you'll make them think you're coding on walks.
Telling people you're doing "passive programming" you'll evoke "passive smoker" kind of connotations.

So a think proactive is the best candidate of "non-reactive" so far.

There is one more good term though and it's **Control**. Being reactive means you give up the control
over some situation. Because the situation can't be affected, or it's plainly too expensive in terms
of resources. Being proactive means taking a control.

Now let's recall the MVC term. There are multiple variations of it struggling to be considered canonical.
The Model can update the View or the View can be subscribed to the Model yadda yadda.
There is one common theme, however and it's M-C relationship. The Model is never subscribed to the Controller.
The Controller is always "in control" and updates the Model.

Now let's recall the CycleJS MVI approach, expanded as [Model-View-Intent](https://cycle.js.org/model-view-intent.html)
in case you never hear of it. In "MVI", Model is represented by the reactive state which is (surprise)
*subscribed* to the preceding Intent layer.

1. Model-View-Controller, in it's purest form, can be reformulated as Model-View-Control, where Control
describes the primary approach to a dataflow. It's like PHP MVCs where nothing is reactive because an
app and a server are two different entities. An app is just a *one-off* code "plugin" in a reactive
server (Apache).

In the retrospective, it's very funny to recall how people, hearing the MVC term, attempted to make
a `Controller` class. It was always a design disaster in the end. Why? Let's see:

```js
let model = makeModel(request)    // make the data
let view = makeView(model)        // make the view
let response = makeResponse(view) // make the response
```

Where's the controller? Well, it's the function itself:

```js
// Server
function controller(request) {
  let model = makeModel(request) // get the model
  let view = makeView(model)     // render the view
  return makeResponse(view)      // return the response
}
```

The "controller" is the *sequence*, the *dataflow*.

2. Model-View-Intent, in it's purest form, can be reformulated as Model-View-Reaction, where Reaction
desribes the primary approach to a dataflow. It's like CycleJS where nothing is proactive:

```js
let model = response.map(...) // make the model
let view = model.map(...)     // make the view
let request = view.map(...)   // make the request
```

Where's the reactor? Well, it's the function itself:

```js
// Client
function reactor(response) {
  let model = response.map(...) // describe model in terms of responses
  let view = model.map(...)     // describe views in terms of models
  return view.map(...)          // desribe requests in terms of views
}
```

What is the outgoing "request" here? What it *requests*? It may be seen differently, but, for example,
it may be seen as a "request to redraw a screen". The CycleJS model is reversed and I believe that's
why they refused to enter the backend territory. It's just too weird to have it upside down.

But it's not the requirement of MVR, it's just a design choice. The flow could be organized like:

```js
// Server
function reactor(request) {
  let model = request.map(...) // describe models in terms of requests
  let view = model.map(...)    // describe views in terms of models
  return view.map(...)         // desribe responses in terms of views
}
```

which would be a better match for servers and worse for clients.

So how can I claim "MVC is dead" and show it's dual to MVR at the same time? Am I stupid or something?
Well, MVC is a good choice to describe stateless Request-Response sequences. When there're no
implicit relations between the current and the previous requests. Recall that HTTP is stateless which
we overcome with cookies and other extraneous artefacts.

Now the industry is gradually switching to the real-time servers. You have to push data to clients.
You have to throttle some less important channels. You have to debounce requests. You have to
describe relations between data channels over time. And all that means you need reactivity.

The only thing that slows down the process is the inertia of ecosystem. Sockets, servers side events,
etc. etc. still aren't properly supported by the major market players. There is no go-to approach
and the nececcisity to keep multiple fallbacks is burdening. There are unresolved security issues.
But all that is about to change soon enough.

To design good systems, we need to have a good undestanding of the *underlying* reality. Many people
say that the best solutions in math and programming have a sense of discovery. They are found, rather
than constructed.

The understanding starts with terms because we think in words (except for artists), so I refrain
myself from "writing a new framework" and choose to peer into reality. We have to find and approve
the terms before going further.

My next goal is to dig deeper into the relationships of reactivity and control because it's not
a binary good-evil or left-right dichotomy. A reactive system can totally have some controlled parts and
a controlled system can totally have some reactive parts. They can be nested within each other and
the task is to find some clues, at least, to rationally choose between them.

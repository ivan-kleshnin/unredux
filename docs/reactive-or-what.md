# Reactive or what?

What it the opposite of being **reactive**? Should we always say "non-reactive" like it's something bad?
Let's take a step back and accept, at first, that there are two types of programs:
**one-off** and **interactive**. Those terms aren't *official* but neither are, which is strange, by
the way, because it's such a fundamental distinction!

**One-off** programs have no interaction loop. Examples: most command line utils, frozen application (edge-case).
Counter-example: `less` util (`$ cat package.json | less`) which can be interacted with UP/DOWN keys.

The result of one-off programs is their return value and side effects they produce during their run time. The
run time is an unnecessary evil. We can definitely apply the rule "the faster – the better" for them.
Moreover, the time is the enemy of one-off programs. Check that file exists. Write to it. If the file
is removed *between* both actions – we have a bug.

* Efficiency metrics: throughput
* Optimization technique: parallelism

**Interactive** programs (applications) have an interaction loop inside them.
Examples: servers (web, database, etc.), games, cronjobs (egde case). Counter-example: a casino game
where you guess a number and get the yes/no result – the next attempt is the next game.

The result of interactive programs is both the process itself and the side-effects it produces. The
run time is rather good. Imagine your dev-ops saying "Our server has finally finished it's work". :smile:
We can claim "the faster is better" for servers but it's not that same *faster* as it was before. The overal
computation time is irrelevant. We care for individual delays for each client instead.

* Efficiency metrics: latency
* Optimization technique: concurrency

---

So back to "reactive". Andre Staltz "proposed" (in quotes because it wasn't formally a *proposition*)
two words as definitions of being non-reactive: [**interactive**](https://futurice.com/blog/reactive-mvc-and-the-virtual-dom)
and [**passive**](https://staltz.com/on-passive-programming.html). I don't particularly like both.

**Interactive** sounds good, the word is not too overloaded. The problem comes with connotations.
Reactive architectures is actually the best fit for Interactive systems. So we get a contradiction.

**Passive** is even worth because in non-reactive systems we mostly deal with the active part.
Another, more serious contradiction.

In case you aren't big about the terms, I recommend to look at my [dataflows](https://github.com/ivan-kleshnin/dataflows)
article and the read the above articles. You'll get the meaning despite the term disrepancy.

Then there's a question of with visual representation

Andre's approach it to move arrows close to one or another part. Arrows represent the direction
of dataflow.

```
------------------> time
emitter ->reactor
active-> passive
------------------> time
reactor<- emitter   FINE
```

In my version, arrow represent the direction of *dependency* or *control* so I just flip them.
The direction of dataflow is captured by the position on diagram:

```
------------------> time
emitter <- reactor
active -> passive
------------------> time
```

Both versions mean the same, they just accent on different properties of the system.

## Reactive or Proactive

To break this wall we can try to search for inspirational ideas outside of the programming field.
We'll quickly find one particularly curious binary group: "reactive/proactive" in the field of Psychology
and Business. "Proactive" basically means "doing something BEFORE something else happens" while "reactive" carries
the opposite meaning: "doing something AFTER something else happens".

That's kinda interesting because it seems to describe our situation pretty well.
In the `emitter <- reactor` case we code "something that happens after something".
In the `active -> passive` case we code "something that will happen after something".

* In the **proactive** case we look into the future.
* In the **reactive** case we look into the past.

The repetion of the "active" suffix here is an additional clue that "passive" is a wrong term
to describe non-reactive systems. Anyway, "passive" and "active" terms are just are too vague and ambiguos.
Telling people you're doing "active programming" you'll make them think you're coding on walks.
Telling people you're doing "passive programming" you'll evoke "passive smoker" kind of connotations.

So a think **proactive** is the best candidate of "non-reactive" so far.

There is one more good term though and it's **control**. Being reactive means you give up the control
over some situation. Because the situation can't be affected, or it's plainly too expensive in terms
of resources. Being proactive means taking a control.

## MVC and MVR

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

We can update our diagram as so:

```
------------------> time
emitter <- reactor
controller -> controllable
------------------> time
```

## Applications

So how can I claim "MVC is dead" and show it's dual to MVR at the same time? Am I stupid or something?
Well, MVC is a good tool to describe those Request-Response sequences. When there're no implicit
relations between the current and the previous requests. Recall that HTTP is stateless which we
overcome with cookies and other extraneous artefacts.

Today the industry is gradually switching to the real-time servers. You have to push data to clients.
You have to throttle some less important channels. You have to debounce requests. You have to
describe relations between data channels over time. And all that means you need reactivity. It's just
the level of immersion into the problem is too shallow for most web devs today. Few people are busy
writing real-time servers and the total volume of "collective wisdom" is very small.

Now there is a big slowing factor – the inertia of an ecosystem. Sockets, servers side events,
etc. still aren't properly supported by the major market players. There is no go-to approach
and the nececcisity to keep multiple fallbacks is burdening. There are unresolved security issues.
But all that is about to change anyway.

To design good systems, we need to have a good undestanding of the *underlying* reality. Many people
say that the best solutions in math and programming have a sense of discovery. They are found, rather
than constructed.

Understanding starts with terms because we think in words (except for artists), so I refrain
myself from "writing a new framework" and choose to peer into Reality again and again. And you should
probably too.

My next goal is to dig deeper into the relationships of **reactivity** and **control** because it's not
a binary good-evil or left-right dichotomy. If Declarative is always better than Imperative, then why
Haskell adopted the `do` syntax for IO monads? Why the dev-ops field, mostly dealing with side-effects
is totally dominated by Rubyists? I don't think it's just a coincidence.

Technically speaking, a reactive system can totally have some controlled parts and a controlled system
can totally have some reactive parts. Hey, they can be even nested within each other! So the task of
the utter importance is to find clues, if not principles, to guide our design decisions.

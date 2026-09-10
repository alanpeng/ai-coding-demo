# ai-coding-demo

A small, deliberately unfinished Node.js library used as the **demo target for
HarnessCodeAgent** — the self-hosted web UI that runs Claude Code and OpenCode
inside a container.

The library is a dependency-graph planner: given tasks and their dependencies it
returns the order to run them in, and when the graph is impossible it reports the
exact cycle that makes it impossible.

> **Status: the feature is not implemented.** `npm test` fails on purpose. That red
> state is the starting line for the demo, not a broken checkout.

## Requirements

Node.js >= 22. Nothing else — zero runtime dependencies and zero dev dependencies.

## Run the tests

```sh
npm test
```

That is `node --test`, Node's built-in test runner. There is no install step; do
not run `npm install`.

Run a single file:

```sh
node --test test/depgraph.test.js
```

## Layout

```
src/index.js      public API surface (re-exports)
src/depgraph.js   the feature — currently a stub
test/             tests
tasks/            work orders handed to the agent
```

## API

```js
import { planOrder, findCycle, CycleError } from './src/index.js';

planOrder({ build: ['compile'], compile: [], test: [] });
// => ['compile', 'build', 'test']   greedy: 'build' becomes ready before 'test' is picked

planOrder({ a: ['b'], b: ['a'] });
// throws CycleError with .cycle === ['a', 'b', 'a']
```

Full specification: [`tasks/001-plan-order.md`](tasks/001-plan-order.md).

## Why this repo exists

It is intentionally the smallest thing that can demonstrate a real loop end to end:
failing test -> agent implements under TDD -> green -> branch -> push -> PR -> CI
green. No network, no external services, no dependencies, so the only variable in
the demo is the agent.

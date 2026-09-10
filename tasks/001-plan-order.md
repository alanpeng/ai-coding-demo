# 001 — Dependency-graph planner

**Owner:** platform team
**Status:** ready for implementation
**Module:** `src/depgraph.js` — public surface `src/index.js`

## Goal

Our build runner needs to know what order to run tasks in. `planOrder()` currently
throws `not implemented`.

Implement it, and implement `findCycle()`, so that:

- a valid plan is returned whenever one exists, and
- when one does not exist, the caller is told **which** tasks form the loop, not
  merely that a loop exists.

## API

`src/index.js` must keep exporting exactly these three names:

```js
export { planOrder, findCycle, CycleError } from './depgraph.js';
```

### `planOrder(tasks) -> string[]`

`tasks` is a plain object. Each key is a task id; each value is the array of ids
that task depends on.

```js
planOrder({ build: ['compile'], compile: ['lint'], lint: [] })
// => ['lint', 'compile', 'build']
```

Returns the ids of **every** key of `tasks`, each exactly once, in an order where
every dependency appears before the task that needs it.

**Tie-break (important).** Build the order greedily: repeatedly choose, from all
tasks whose dependencies have already been emitted, the one that sorts **first**
under the default `Array.prototype.sort()` (code-unit / lexicographic) order.

This is a greedy choice, and it is **not** the same as sorting the final array.
Counter-example — sorting the output is wrong:

```js
planOrder({ a: ['z'], z: [] })
// => ['z', 'a']      correct: greedy
// => ['a', 'z']      wrong: sorted output; 'a' runs before its dependency
```

Ties are resolved only among tasks that are *currently* ready, so the result is
fully deterministic for a given input.

### `findCycle(tasks) -> string[] | null`

Returns the cycle path if one exists, otherwise `null`.

```js
findCycle({ a: ['b'], b: ['c'], c: ['b'] })
// => ['b', 'c', 'b']    note: 'a' is a tail, not part of the cycle
```

The returned path must satisfy all of:

1. `path[0] === path[path.length - 1]` and `path.length >= 2`.
2. For every index `i`, `path[i + 1]` is an element of `tasks[path[i]]`.
3. It starts at the **lexicographically smallest id that participates in any
   cycle** in the graph. To keep this deterministic: depth-first search from that
   id, visiting each task's dependencies in sorted order, returning the first path
   that leads back to the start. (A consequence: if several cycles start at that
   id, the one whose second element sorts first is returned.)
4. It contains **no** leading tail — the first element is itself on the cycle.

### `CycleError`

Already implemented in `src/depgraph.js`. `planOrder` throws it when the graph
contains a cycle:

```js
try {
  planOrder({ a: ['c'], b: ['a'], c: ['b'] });
} catch (err) {
  err instanceof CycleError; // true
  err.cycle;                 // ['a', 'c', 'b', 'a']
}
```

`.cycle` is the same array `findCycle(tasks)` returns.

## Edge cases

| Situation | Behaviour |
| --- | --- |
| A dependency id is not a key of `tasks` | throw `Error`, message matching `/unknown dependency/i` |
| A deps value is not an array | throw a `TypeError` |
| Graph contains a cycle | `planOrder` throws `CycleError`; `findCycle` returns the path |
| `tasks` is `{}` | `planOrder({})` -> `[]`; `findCycle({})` -> `null` |
| Self-dependency `{ a: ['a'] }` | a cycle: `['a', 'a']` |
| Duplicate ids inside one deps array | treated as a single dependency |
| Dependencies named in a different order than they sort | tie-break is by id, not declaration order |

## Constraints

- **No new dependencies.** Do not touch `dependencies` / `devDependencies` and do
  not run `npm install`. Node's standard library only, `node:` prefixes for builtins.
- **ESM only.** `import` / `export`, never `require`.
- **Do not edit `test/depgraph.test.js`.** Those four tests are the contract. If
  one of them looks wrong, stop and ask — do not "fix" it.
- **Do not change the `test` script in `package.json`.**
- Put new tests in **`test/edge-cases.test.js`**. The directory matters: `node --test`
  only discovers `.js` files inside a directory named `test` (singular), so a file
  under `tests/` or named `*.spec.js` elsewhere would silently never run.
- Do not mutate the `tasks` argument; return a fresh array.
- Keep the implementation in `src/depgraph.js`; keep `src/index.js` as the only
  public entry point.
- Plain, readable code. The graphs here are tiny — a straightforward Kahn's
  algorithm over a per-iteration sorted ready list is the intended shape. No
  micro-optimisation.

## Acceptance criteria

1. `npm test` exits 0.
2. `node --test` reports **at least 12 passing tests**, including the 4 shipped
   tests unmodified.
3. `test/edge-cases.test.js` covers at minimum:
   - unknown dependency id (error case)
   - non-array deps value (error case)
   - self-dependency -> `['a', 'a']`
   - cycle with a tail -> tail is trimmed
   - two independent cycles -> smallest participating id wins
   - diamond graph -> deterministic order
   - `{ a: ['z'], z: [] }` -> `['z', 'a']` (greedy, not sorted)
   - the input object is not mutated
4. `findCycle()` returns `null` for an acyclic graph.
5. Commit on a branch named `feat/plan-order`, push it, and open a pull request
   against `main`. **Leave the PR open** — do not merge it.

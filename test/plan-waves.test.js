// Contract for `planWaves`. See tasks/002-plan-waves.md.
import test from 'node:test';
import assert from 'node:assert/strict';

import { planWaves, CycleError } from '../src/index.js';

test('planWaves groups the build example into waves', () => {
  const tasks = { build: ['compile'], compile: [], test: [], ship: ['build', 'test'] };
  assert.deepEqual(planWaves(tasks), [['compile', 'test'], ['build'], ['ship']]);
});

test('planWaves handles a four-wave chain', () => {
  const tasks = { d: ['c'], c: ['b'], b: ['a'], a: [] };
  assert.deepEqual(planWaves(tasks), [['a'], ['b'], ['c'], ['d']]);
});

test('planWaves parallelizes a diamond graph', () => {
  const tasks = { d: ['b', 'c'], b: ['a'], c: ['a'], a: [] };
  assert.deepEqual(planWaves(tasks), [['a'], ['b', 'c'], ['d']]);
});

test('planWaves collapses independent tasks into a single wave', () => {
  assert.deepEqual(planWaves({ a: [], b: [] }), [['a', 'b']]);
});

test('planWaves degrades a single chain to one task per wave', () => {
  assert.deepEqual(planWaves({ c: ['b'], b: ['a'], a: [] }), [['a'], ['b'], ['c']]);
});

test('planWaves returns an empty plan for an empty graph', () => {
  assert.deepEqual(planWaves({}), []);
});

test('planWaves sorts tasks within a wave lexicographically', () => {
  assert.deepEqual(planWaves({ b: [], a: [], c: [] }), [['a', 'b', 'c']]);
});

test('planWaves throws CycleError carrying the trimmed cycle path', () => {
  const tasks = { x: ['b'], b: ['c'], c: ['b'] };
  assert.throws(
    () => planWaves(tasks),
    (err) => {
      assert.ok(err instanceof CycleError);
      assert.deepEqual(err.cycle, ['b', 'c', 'b']);
      return true;
    },
  );
});

test('planWaves throws for an unknown dependency id', () => {
  assert.throws(() => planWaves({ a: ['b'] }), /unknown dependency/i);
});

test('planWaves throws a TypeError for a non-array deps value', () => {
  assert.throws(() => planWaves({ a: 'b' }), TypeError);
});

test('planWaves throws a TypeError for null input', () => {
  assert.throws(() => planWaves(null), TypeError);
});

test('planWaves throws a TypeError for a non-object input', () => {
  assert.throws(() => planWaves('nope'), TypeError);
  assert.throws(() => planWaves(42), TypeError);
});

test('planWaves throws a TypeError for an array input', () => {
  assert.throws(() => planWaves([]), TypeError);
});

test('planWaves does not mutate its input', () => {
  const tasks = { d: ['b', 'c'], b: ['a'], c: ['a'], a: [] };
  const before = structuredClone(tasks);
  planWaves(tasks);
  assert.deepEqual(tasks, before);
});

test('planWaves treats duplicate ids inside a deps array as a single dependency', () => {
  assert.deepEqual(planWaves({ a: ['b', 'b'], b: [] }), [['b'], ['a']]);
});

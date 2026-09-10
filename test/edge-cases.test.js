import test from 'node:test';
import assert from 'node:assert/strict';

import { planOrder, findCycle, CycleError } from '../src/index.js';

test('planOrder throws on an unknown dependency id', () => {
  assert.throws(() => planOrder({ a: ['b'] }), /unknown dependency/i);
});

test('findCycle throws on an unknown dependency id', () => {
  assert.throws(() => findCycle({ a: ['b'] }), /unknown dependency/i);
});

test('planOrder throws a TypeError when a deps value is not an array', () => {
  assert.throws(() => planOrder({ a: 'b' }), TypeError);
});

test('findCycle throws a TypeError when a deps value is not an array', () => {
  assert.throws(() => findCycle({ a: 'b' }), TypeError);
});

test('findCycle reports a self-dependency as a cycle', () => {
  assert.deepEqual(findCycle({ a: ['a'] }), ['a', 'a']);
});

test('planOrder throws CycleError on a self-dependency', () => {
  assert.throws(
    () => planOrder({ a: ['a'] }),
    (err) => {
      assert.ok(err instanceof CycleError);
      assert.deepEqual(err.cycle, ['a', 'a']);
      return true;
    },
  );
});

test('findCycle trims a leading tail', () => {
  assert.deepEqual(findCycle({ a: ['b'], b: ['c'], c: ['b'] }), ['b', 'c', 'b']);
});

test('findCycle picks the smallest id participating in any cycle', () => {
  assert.deepEqual(
    findCycle({ a: ['b'], b: ['a'], c: ['d'], d: ['c'] }),
    ['a', 'b', 'a'],
  );
});

test('planOrder resolves a diamond deterministically', () => {
  const tasks = { a: [], b: ['a'], c: ['a'], d: ['b', 'c'] };
  assert.deepEqual(planOrder(tasks), ['a', 'b', 'c', 'd']);
});

test('planOrder is greedy, not a sorted output', () => {
  assert.deepEqual(planOrder({ a: ['z'], z: [] }), ['z', 'a']);
});

test('planOrder does not mutate its input', () => {
  const tasks = { build: ['compile'], compile: ['lint'], lint: [] };
  const snapshot = JSON.stringify(tasks);
  planOrder(tasks);
  assert.equal(JSON.stringify(tasks), snapshot);
});

test('findCycle returns null for an acyclic graph', () => {
  assert.equal(findCycle({ build: ['compile'], compile: ['lint'], lint: [] }), null);
});

test('planOrder treats duplicate deps as a single dependency', () => {
  assert.deepEqual(planOrder({ a: ['b', 'b'], b: [] }), ['b', 'a']);
});

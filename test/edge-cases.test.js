// Edge cases for the dependency-graph planner. See tasks/001-plan-order.md.
import test from 'node:test';
import assert from 'node:assert/strict';

import { planOrder, findCycle, CycleError } from '../src/index.js';

test('planOrder throws for an unknown dependency id', () => {
  assert.throws(() => planOrder({ a: ['b'] }), /unknown dependency/i);
});

test('findCycle throws for an unknown dependency id', () => {
  assert.throws(() => findCycle({ a: ['b'] }), /unknown dependency/i);
});

test('planOrder throws a TypeError for a non-array deps value', () => {
  assert.throws(() => planOrder({ a: 'b' }), TypeError);
});

test('findCycle throws a TypeError for a non-array deps value', () => {
  assert.throws(() => findCycle({ a: 'b' }), TypeError);
});

test('findCycle reports a self-dependency as a cycle', () => {
  assert.deepEqual(findCycle({ a: ['a'] }), ['a', 'a']);
});

test('planOrder reports a self-dependency as a cycle', () => {
  assert.throws(
    () => planOrder({ a: ['a'] }),
    (err) => {
      assert.ok(err instanceof CycleError);
      assert.deepEqual(err.cycle, ['a', 'a']);
      return true;
    },
  );
});

test('findCycle trims the tail from a cycle', () => {
  assert.deepEqual(findCycle({ a: ['b'], b: ['c'], c: ['b'] }), ['b', 'c', 'b']);
});

test('findCycle picks the smallest id among independent cycles', () => {
  assert.deepEqual(findCycle({ a: ['b'], b: ['a'], c: ['d'], d: ['c'] }), ['a', 'b', 'a']);
});

test('planOrder orders a diamond graph deterministically', () => {
  const tasks = { d: ['b', 'c'], b: ['a'], c: ['a'], a: [] };
  assert.deepEqual(planOrder(tasks), ['a', 'b', 'c', 'd']);
});

test('planOrder is greedy, not a sorted output', () => {
  assert.deepEqual(planOrder({ a: ['z'], z: [] }), ['z', 'a']);
});

test('planOrder does not mutate its input', () => {
  const tasks = { a: ['z'], z: [] };
  const before = structuredClone(tasks);
  planOrder(tasks);
  assert.deepEqual(tasks, before);
});

test('findCycle returns null for an acyclic graph', () => {
  assert.equal(findCycle({ a: ['b'], b: [] }), null);
});

test('duplicate ids inside a deps array are a single dependency', () => {
  assert.deepEqual(planOrder({ a: ['b', 'b'], b: [] }), ['b', 'a']);
});

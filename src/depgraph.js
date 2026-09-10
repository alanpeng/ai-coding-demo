/**
 * Dependency-graph planner.
 *
 * SPEC: ../../tasks/001-plan-order.md
 *
 * `planOrder` and `findCycle` are intentionally unimplemented. `npm test` is
 * expected to be red until they are written.
 */

/**
 * Thrown by `planOrder` when the graph cannot be ordered.
 */
export class CycleError extends Error {
  /**
   * @param {string[]} cycle Cycle path. First and last element are identical,
   *   e.g. ['b', 'c', 'b'].
   */
  constructor(cycle) {
    super(`dependency cycle detected: ${cycle.join(' -> ')}`);
    this.name = 'CycleError';
    this.cycle = cycle;
  }
}

/**
 * Order tasks so that every dependency is emitted before the task needing it.
 *
 * @param {Record<string, string[]>} tasks Task id -> dependency ids.
 * @returns {string[]} Every key of `tasks`, exactly once, in a valid order.
 * @throws {CycleError} If the graph contains a cycle.
 * @throws {Error} If a dependency id is not a key of `tasks`.
 * @throws {TypeError} If a dependency value is not an array.
 */
export function planOrder(tasks) {
  // TODO(001): implement per tasks/001-plan-order.md
  throw new Error('not implemented: planOrder');
}

/**
 * Find one cycle in the graph.
 *
 * @param {Record<string, string[]>} tasks Task id -> dependency ids.
 * @returns {string[] | null} The cycle path, or null if the graph is acyclic.
 */
export function findCycle(tasks) {
  // TODO(001): implement per tasks/001-plan-order.md
  throw new Error('not implemented: findCycle');
}

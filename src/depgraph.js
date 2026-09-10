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
/**
 * Validate a tasks map: every dependency value must be an array, and every
 * dependency id must itself be a key of `tasks`.
 *
 * @param {Record<string, string[]>} tasks Task id -> dependency ids.
 * @throws {TypeError} If a dependency value is not an array.
 * @throws {Error} If a dependency id is not a key of `tasks`.
 */
function validate(tasks) {
  for (const [id, deps] of Object.entries(tasks)) {
    if (!Array.isArray(deps)) {
      throw new TypeError(`dependencies for task "${id}" must be an array`);
    }
    for (const dep of deps) {
      if (!Object.hasOwn(tasks, dep)) {
        throw new Error(`unknown dependency "${dep}" referenced by task "${id}"`);
      }
    }
  }
}

/**
 * The de-duplicated, lexicographically sorted dependencies of a task.
 *
 * @param {Record<string, string[]>} tasks Task id -> dependency ids.
 * @param {string} id Task id.
 * @returns {string[]}
 */
function sortedDeps(tasks, id) {
  return [...new Set(tasks[id])].sort();
}

export function planOrder(tasks) {
  validate(tasks);

  const remaining = new Set(Object.keys(tasks));
  const result = [];
  const emitted = new Set();

  while (remaining.size > 0) {
    const ready = [];
    for (const id of remaining) {
      if (tasks[id].every((dep) => emitted.has(dep))) {
        ready.push(id);
      }
    }

    if (ready.length === 0) {
      throw new CycleError(findCycle(tasks));
    }

    ready.sort();
    const next = ready[0];
    result.push(next);
    emitted.add(next);
    remaining.delete(next);
  }

  return result;
}

/**
 * Depth-first search from `start`, following dependencies in sorted order,
 * returning the first path that leads back to `start`.
 *
 * @param {Record<string, string[]>} tasks Task id -> dependency ids.
 * @param {string} start Starting (and closing) task id.
 * @returns {string[] | null} Cycle path, or null if none reaches `start`.
 */
function searchFrom(tasks, start) {
  const path = [start];
  const onPath = new Set([start]);

  const visit = (node) => {
    for (const dep of sortedDeps(tasks, node)) {
      if (dep === start) {
        return [...path, start];
      }
      if (onPath.has(dep)) {
        continue;
      }
      path.push(dep);
      onPath.add(dep);
      const found = visit(dep);
      if (found) {
        return found;
      }
      path.pop();
      onPath.delete(dep);
    }
    return null;
  };

  return visit(start);
}

export function findCycle(tasks) {
  validate(tasks);

  for (const start of Object.keys(tasks).sort()) {
    const path = searchFrom(tasks, start);
    if (path) {
      return path;
    }
  }

  return null;
}

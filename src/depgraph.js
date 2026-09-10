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
  const { ids, deps } = normalize(tasks);

  // Number of dependencies still waiting to be emitted for each task.
  const remaining = new Map();
  // Reverse edges: dep id -> tasks that depend on it.
  const dependents = new Map();
  for (const id of ids) {
    remaining.set(id, deps.get(id).length);
    dependents.set(id, []);
  }
  for (const id of ids) {
    for (const dep of deps.get(id)) {
      dependents.get(dep).push(id);
    }
  }

  const ready = ids.filter((id) => remaining.get(id) === 0);
  const result = [];

  while (ready.length > 0) {
    ready.sort();
    const id = ready.shift();
    result.push(id);
    for (const dependent of dependents.get(id)) {
      remaining.set(dependent, remaining.get(dependent) - 1);
      if (remaining.get(dependent) === 0) ready.push(dependent);
    }
  }

  if (result.length !== ids.length) {
    throw new CycleError(findCycle(tasks));
  }
  return result;
}

/**
 * Find one cycle in the graph.
 *
 * @param {Record<string, string[]>} tasks Task id -> dependency ids.
 * @returns {string[] | null} The cycle path, or null if the graph is acyclic.
 */
export function findCycle(tasks) {
  const { ids, deps } = normalize(tasks);

  const start = ids.find((id) => canReach(id, id, deps));
  if (start === undefined) return null;

  // Depth-first search from `start`, exploring dependencies in sorted order,
  // returning the first path that leads back to `start`.
  const path = [start];
  const search = (node) => {
    for (const dep of deps.get(node)) {
      if (dep === start) return [...path, dep];
      if (path.includes(dep)) continue;
      path.push(dep);
      const cycle = search(dep);
      if (cycle) return cycle;
      path.pop();
    }
    return null;
  };

  return search(start);
}

/**
 * Validate the graph shape and return the sorted ids plus normalized
 * (deduplicated, sorted) dependency lists. Throws on malformed input.
 *
 * @param {Record<string, string[]>} tasks
 * @returns {{ ids: string[], deps: Map<string, string[]> }}
 */
function normalize(tasks) {
  const ids = Object.keys(tasks).sort();
  const deps = new Map();
  for (const id of ids) {
    if (!Array.isArray(tasks[id])) {
      throw new TypeError(`dependencies for "${id}" must be an array`);
    }
    deps.set(id, [...new Set(tasks[id])].sort());
  }
  for (const id of ids) {
    for (const dep of deps.get(id)) {
      if (!Object.hasOwn(tasks, dep)) {
        throw new Error(`unknown dependency "${dep}" of task "${id}"`);
      }
    }
  }
  return { ids, deps };
}

/**
 * Whether `target` is reachable from `node` by following dependencies.
 */
function canReach(node, target, deps) {
  const visited = new Set();
  const stack = [node];
  while (stack.length > 0) {
    const current = stack.pop();
    for (const dep of deps.get(current)) {
      if (dep === target) return true;
      if (visited.has(dep)) continue;
      visited.add(dep);
      stack.push(dep);
    }
  }
  return false;
}

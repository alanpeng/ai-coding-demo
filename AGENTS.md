# AGENTS.md

Conventions for this repo. Follow them exactly.

- Node.js >= 22, **ESM only** (`"type": "module"`). Use `import` / `export`, never `require`.
- **Zero runtime dependencies.** Never add anything to `dependencies` or
  `devDependencies`, and do not run `npm install`. Tests use the built-in runner:
  `npm test` -> `node --test`.
- Source lives in `src/`, tests live in `test/`.
- **Test files must live in `test/` and be named `*.test.js`.** `node --test`
  discovers every `.js` file inside a directory named exactly `test` (singular).
  A file at `tests/edge-cases.js` or `src/edge-cases.spec.js` would never run —
  which looks exactly like a passing suite.
- Use `node:test` and `node:assert/strict` for tests.
- Use `node:` prefixes for builtins (`import { readFile } from 'node:fs/promises'`).
- No `console.log` in `src/`.
- Comments explain *why*, not *what*.
- **Never edit an existing test to make it pass.** If a shipped test looks wrong,
  stop and ask.
- Do not change the `test` script in `package.json`.
- Commits use Conventional Commits: `test:`, `feat:`, `fix:`, `chore:`.

# AGENTS.md

## What this repo is

CMPM 121 section S6 activity: build "Mushroom Colony", an incremental game
revisiting the D1 assignment, implemented together with a programming agent.
Agents should edit files, run checks, and make small, meaningful commits as
they go. This collaboration is intentional and instructor-approved.

## Setup commands

- Enable git hooks (once per clone): `deno task setup`
- Install a dev server now (first run is slow): `deno task dev`
- Run tests: `deno test`
- Check everything (fmt, lint, types, build): `deno task ci`
- Fix formatting: `deno task fmt`

The tooling is Deno 2.9.7 driving Vite; there is no pnpm dependency file and
no `package.json`.

## Code style

- TypeScript strict mode
- Keep browser-independent game logic in plain modules that `deno test` can
  exercise; keep DOM wiring in `src/main.ts`
- Formatting is enforced by `deno fmt`: double quotes, semicolons on,
  2-space indent, 80-column wrapping

## Design direction

Theme: a mushroom colony. Clicking scatters spores; spores spread as a
colony over elapsed time; purchases change how the colony grows. Content
(such as upgrades) is data: describe an entry as data and let shared code
process it. Prefer pure functions for game logic and small commits with
messages describing the actual change.

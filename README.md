# Mushroom Colony (CMPM 121 S6)

An incremental game: scatter spores by hand, and a mycelium colony spreads
on its own as elapsed time passes. Grow the colony further by cultivating
upgrades from spores the colony has produced.

## Play

**Play the deployed app: [Mushroom Colony on GitHub Pages](https://anna-zhang6.github.io/cmpm121-s6/).**

Interactions:

- **Scatter Spores** adds spores to the colony by hand.
- The colony also spreads by itself, at a rate in spores per second that
  depends only on elapsed time, not the display's frame rate.
- **Cultivate** purchases an upgrade when the colony can afford its price.
  Each kind of upgrade changes growth its own way: some make each scatter
  richer, others keep the colony spreading while you wait. Buying one makes
  the next copy of that upgrade more expensive.

## Run and build

The project tooling is Deno 2.9.7 driving Vite. Nothing else is required:

```sh
deno task setup   # enable the pre-commit checks, once per clone
deno task dev     # dev server with reload
deno test         # colony-logic tests
deno task ci      # format, lint, typecheck, test, and build dist/
deno task preview # serve the last build (does not rebuild)
```

Where things live:

- `src/game.ts` — the colony state and all of its rules: scatters, costs,
  escalating prices, elapsed-time growth. Plain functions, no DOM.
- `src/cultivations.ts` — the purchases as data. Every upgrade is one
  object; `main.ts` interprets any entry identically.
- `src/main.ts` — DOM wiring only: it builds the view, forwards clicks,
  and updates the display from state.
- `src/game.test.ts` — unit tests over the shared model.
- `src/style.css`, `src/assets/mushroom.svg` — the themed face of the game.

## How the design changed

The first version kept state, rules, and DOM building together in one
`main.ts`, and each purchase was coded by hand. The meaningful revision
moved the rules into pure colony functions in `game.ts` and made upgrades
data in `cultivations.ts`, so the display only reads state and every new
upgrade is one object entry instead of copied logic. See the refactor
commits: [007d9f2](https://github.com/anna-zhang6/cmpm121-s6/commit/007d9f2)
(into shared data), [18dad00](https://github.com/anna-zhang6/cmpm121-s6/commit/18dad00)
(state/rules/presentation separation with tests),
[770defe](https://github.com/anna-zhang6/cmpm121-s6/commit/770defe) (a new
upgrade added through the model with no new logic).

## Credits

Tooling adapted from the
[CMPM 121 Fall 2026 S01 starter](https://github.com/ucsc-cmpm-121-f26/s01-starter),
which carries no explicit repository license; the D1 scaffold came from the
course. The mushroom artwork and game content were created for this
repository with the help of a programming agent during the section S6
activity. External references used: MDN on
[event listeners](https://developer.mozilla.org/docs/Web/API/EventTarget/addEventListener),
[requestAnimationFrame](https://developer.mozilla.org/docs/Web/API/Window/requestAnimationFrame),
and Vite's
[deployment guide](https://vite.dev/guide/static-deploy).

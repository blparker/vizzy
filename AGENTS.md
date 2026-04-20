# AGENTS.md

Guidance for AI coding assistants (Claude Code, Cursor, Copilot, Codex) working in this repo or using Vizzy in another project. This file is the source of truth; `CLAUDE.md` is a symlink to it.

## What is Vizzy?

Vizzy is a TypeScript library for interactive visuals that live inside a webpage: function graphs, geometric diagrams, algorithm walkthroughs, explorable essays. It is browser-native, declarative, and interaction-first. It is not a charting library, a research notebook, or a Python-to-video pipeline.

-   npm org: `@vizzyjs`
-   GitHub: `blparker/vizzy`
-   Docs: https://vizzyjs.dev
-   Playground / hub: https://hub.vizzyjs.dev
-   Status: pre-1.0 (`0.1.x`); the API is stabilizing but may move between minor versions.

## Packages (pnpm workspace)

| Package                    | Path                       | Purpose                                                            |
| -------------------------- | -------------------------- | ------------------------------------------------------------------ |
| `@vizzyjs/core`            | `packages/core`            | Render-agnostic core: shapes, scene graph, animations, math, style |
| `@vizzyjs/renderer-canvas` | `packages/renderer-canvas` | Canvas2D renderer, `createScene`, controls, interaction            |
| `@vizzyjs/react`           | `packages/react`           | `useScene` hook for React 19+                                      |
| `@vizzyjs/docs`            | `packages/docs`            | VitePress docs site (vizzyjs.dev)                                  |
| `@vizzyjs/playground`      | `packages/playground`      | Local sandbox with Monaco editor                                   |
| `@vizzyjs/hub`             | `apps/hub`                 | Next.js app for hub.vizzyjs.dev (publish and share vizzes)         |

Runtime versions: Node 22+, pnpm 10+.

## Commands

Use pnpm. Run from the repo root. Has standard commands, but unique commands include:

| Command           | What it does                                                        |
| ----------------- | ------------------------------------------------------------------- |
| `pnpm docs`       | Run the docs site locally (VitePress)                               |
| `pnpm playground` | Run the local sandbox                                               |
| `pnpm hub`        | Run the Next.js hub app (needs `.env`, see `apps/hub/.env.example`) |

Always run `pnpm test` and `pnpm typecheck` before proposing a PR. CI runs typecheck, tests, and builds on every PR.

## Code conventions

-   4-space indentation. Single quotes. TypeScript strict mode.
-   ESM with bundler module resolution. No `.js` extensions on local imports.
-   Factory functions are the public API; classes are internal. If you add `MyShape`, also add a `myShape(props)` factory in `packages/core/src/shapes/factories.ts` and export both from `packages/core/src/shapes/index.ts`.
-   No em-dashes in prose (commits, docs, comments). Reword instead.
-   Default to no comments. Only add one when the WHY is non-obvious.
-   Small, focused PRs over multi-feature ones.

## Architecture (one-screen version)

-   **Retained scene graph.** `add(shape)` stages the shape; the scene re-renders. Shapes expose `.shift()`, `.moveTo()`, `.nextTo()`, `.setStyle()`, etc.
-   **Visitor pattern for rendering.** The `Renderer` interface in `@vizzyjs/core` is backend-agnostic; `@vizzyjs/renderer-canvas` implements Canvas2D. SVG is the next planned implementation.
-   **Shallow hierarchy.** Most shapes extend `Shape` or `PathShape`. Composites extend `Group`.
-   **Hybrid API.** `createScene(canvas)` returns a `BoundScene` you destructure (`const { add, play, grid, controls, interact } = createScene(canvas)`). `renderScene(canvas, cb)` is the callback form.
-   **World coordinates, not pixels.** 14x8 world units, origin at center, Y up. DPR and canvas resize are handled for you.
-   **Animation via `async/await`.** `play(...animations)` returns a Promise. Sequence with `await`; parallelize by passing multiple animations to a single `play()` call.

## The canonical first example

```typescript
import { circle, fadeIn, sky } from '@vizzyjs/core';
import { createScene } from '@vizzyjs/renderer-canvas';

const canvas = document.querySelector<HTMLCanvasElement>('canvas')!;
const { add, play, grid } = createScene(canvas);

grid();
const c = circle({ radius: 1, color: sky });
add(c);
await play(fadeIn(c));
```

## Common recipes

### Animate sequentially, then in parallel

```typescript
await play(fadeIn(a)); // one at a time
await play(fadeIn(b), fadeIn(c)); // simultaneous
await play(animateShift(a, [2, 0]), animateRotate(a, Math.PI));
```

### Draggable point with a live label

```typescript
const dot = circle({ radius: 0.2, style: { fill: sky, stroke: null } });
const lbl = text({ content: '(0.0, 0.0)', position: [0, 0.5], style: { fill: white, fontSize: 0.25 } });
add(dot, lbl);

interact.draggable(dot, {
    onDrag(pos) {
        dot.moveTo(pos);
        lbl.position = [pos[0], pos[1] + 0.5];
        lbl.content = '(' + pos[0].toFixed(1) + ', ' + pos[1].toFixed(1) + ')';
    },
});
```

### Slider-driven scene

```typescript
controls.panel();
const radius = controls.slider('Radius', { min: 0.2, max: 3, value: 1, step: 0.1 });
const c = circle({ color: sky });
add(c);
controls.onUpdate(() => {
    c.radius = radius.value;
});
```

### React (`@vizzyjs/react`)

```tsx
import { useScene } from '@vizzyjs/react';
import { circle, fadeIn, sky } from '@vizzyjs/core';

export function Demo() {
    const ref = useScene(({ add, play, grid }) => {
        grid();
        const c = circle({ color: sky });
        add(c);
        play(fadeIn(c));
    });
    return <canvas ref={ref} width={800} height={457} />;
}
```

### Function graph with tangent

```typescript
const ax = axes({ xRange: [-5, 5, 1], yRange: [-3, 3, 1], includeNumbers: true });
add(ax);
add(functionGraph({ fn: (x) => Math.sin(x), axes: ax, style: { stroke: sky } }));
```

## Gotchas and things to avoid

-   Shapes added with `add()` are visible immediately. If you want a shape to appear via `fadeIn`/`create`, skip `add()`; `play(fadeIn(shape))` adds it for you.
-   Use world units, not pixels. `radius: 1` is a unit circle, not a 100-pixel blob.
-   Don't import from package internals (`@vizzyjs/core/src/...`). Only the top-level entry is public.
-   Don't instantiate shape classes directly in user code; use the factory (`circle(...)`, not `new Circle(...)`).
-   KaTeX is a peer dep of `@vizzyjs/renderer-canvas`. Only needed if you use `tex()`.
-   Don't position Vizzy as a manim port. It's its own library, inspired by manim in a few places. At most one casual nod in prose.

## Adding things

-   **New shape.** New file under `packages/core/src/shapes/<name>.ts` extending `Shape`, `PathShape`, or `Group`. Add a factory in `factories.ts`. Export from `packages/core/src/shapes/index.ts`. Consider a docs snippet under `packages/docs/snippets/`.
-   **New animation.** New file under `packages/core/src/animation/`. Follow `fade.ts` or `transform.ts`. Use `makeAnimation()` to cut boilerplate. Expose a factory returning an `Animation` with `begin`, `update`, `finish` hooks.
-   **New renderer.** Implement the `Renderer` interface from `@vizzyjs/core`. Publish as a sibling package (`packages/renderer-<name>`).

## Hub (apps/hub) specifics

-   Next.js App Router, Drizzle + Neon, Clerk auth.
-   Embed route: `apps/hub/src/app/embed/[id]/route.ts` returns HTML that imports `/vizzy-runtime.js` (a bundled copy of `@vizzyjs/core` + `@vizzyjs/renderer-canvas`) and runs user code.
-   User code runs with `{ add, remove, play, wait, grid, render, controls, interact }` and every `@vizzyjs/core` export as globals.
-   `/v/[id]` is the viewer page; `/v/[id]/edit` is the editor.

## Before you submit a PR

1. `pnpm test` passes.
2. `pnpm typecheck` passes.
3. For runtime-visible changes, verify in `pnpm playground` or `pnpm docs`.
4. Keep commits focused. No em-dashes in the commit message.

## For AI agents using Vizzy in someone else's project

-   Install both packages: `@vizzyjs/core` and `@vizzyjs/renderer-canvas` (or `@vizzyjs/react`).
-   Always import factories from `@vizzyjs/core` and `createScene` / `renderScene` from `@vizzyjs/renderer-canvas`.
-   Prefer the destructuring form: `const { add, play, grid, controls, interact } = createScene(canvas)`.
-   Use world coordinates (14x8, origin centered, Y up). Don't set pixel dimensions via `style`.
-   `await play(...)` for animations. `play()` accepts multiple animations for parallel playback.
-   For React, use `useScene` from `@vizzyjs/react`; don't call `createScene` inside a component render.

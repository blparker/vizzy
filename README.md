# vizzy

Math visualization for TypeScript. Inspired by [manim](https://www.manim.community/), built for the browser.

[Documentation](https://vizzyjs.dev) · [Examples](https://vizzyjs.dev/examples/) · [Hub](https://hub.vizzyjs.dev)

> **Status:** pre-1.0 (`0.1.x`). The API is stabilizing but may still change between minor versions.

<!-- TODO: replace with a hero GIF (e.g. calculus scene: secant to tangent, or function graph with slider) -->
<p align="center">
  <img src="./.github/media/hero.gif" alt="vizzy hero demo" width="640" />
</p>

## Why vizzy?

Manim produces beautiful math videos, but it's Python, offline, and video-only. Observable and D3 are great for data, but awkward for the math-teaching idiom (tangent lines, limits, annotated diagrams). Vizzy borrows manim's vocabulary (`scene.play(fadeIn(c))`, `axes.plot(...)`) and makes it interactive, embeddable, and written in TypeScript.

If you're building an interactive textbook, a blog post with a draggable derivative, or a classroom demo, vizzy is aimed at you.

## Quick start

```bash
npm install @vizzyjs/core @vizzyjs/renderer-canvas
```

```typescript
import { circle, fadeIn, sky } from '@vizzyjs/core';
import { createScene } from '@vizzyjs/renderer-canvas';

const canvas = document.querySelector('canvas')!;
const { add, play, grid } = createScene(canvas);

grid();
const c = circle({ radius: 1, color: sky });
add(c);
await play(fadeIn(c));
```

Using React? See [`@vizzyjs/react`](./packages/react) for a `useScene` hook that handles the canvas ref and lifecycle for you.

## Packages

| Package | Description |
|---------|-------------|
| [`@vizzyjs/core`](./packages/core) | Render-agnostic core: shapes, scene graph, animations, math utilities |
| [`@vizzyjs/renderer-canvas`](./packages/renderer-canvas) | Canvas2D renderer with controls and interaction |
| [`@vizzyjs/react`](./packages/react) | React bindings: `useScene` hook |

## Highlights

- **30+ shape factories:** `circle()`, `rect()`, `line()`, `arrow()`, `axes()`, `functionGraph()`, `tex()`, `brace()`, `angleShape()`, and more
- **Async/await animations:** `await play(fadeIn(c))`. No queues, no schedulers, just native promises.
- **Interactive out of the box:** draggable shapes, hover/click handlers, HTML controls (sliders, checkboxes, color pickers) that auto-render on change
- **World coordinates, not pixels:** 14×8 world units with Y-up, origin at center. DPR scaling is automatic.
- **Calculus-ready:** discontinuity handling, tangent/secant helpers, annotations, TeX rendering via KaTeX
- **Full Tailwind palette:** `sky`, `emerald`, `violet`, 22 scales × 11 shades

## Development

This is a pnpm workspace.

```bash
pnpm install
pnpm playground   # local dev sandbox with Monaco editor + live preview
pnpm test
pnpm typecheck
```

## License

[MIT](./LICENSE)

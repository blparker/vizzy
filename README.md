# vizzy

A TypeScript math visualization library inspired by [manim](https://www.manim.community/) (3Blue1Brown). Create math visualizations with animations and interactivity in the browser.

## Packages

| Package | Description |
|---------|-------------|
| [`@vizzyjs/core`](./packages/core) | Render-agnostic core: shapes, scene graph, animations, math utilities |
| [`@vizzyjs/renderer-canvas`](./packages/renderer-canvas) | Canvas2D renderer with controls and interaction |

## Quick Start

```bash
npm install @vizzyjs/core @vizzyjs/renderer-canvas
```

```typescript
import { circle, text, axes, functionGraph } from '@vizzyjs/core';
import { createScene } from '@vizzyjs/renderer-canvas';

const canvas = document.querySelector('canvas');
const { add, play, grid } = createScene(canvas);

grid();
const c = circle({ radius: 1, color: sky });
add(c);
await play(fadeIn(c));
```

## Features

- **30+ shape factories** — `circle()`, `rect()`, `line()`, `arrow()`, `axes()`, `functionGraph()`, `tex()`, and more
- **Animation system** — `fadeIn`, `fadeOut`, `create`, `shift`, `rotate`, `scale`, `animateColor`, `during`
- **Interactive** — draggable shapes, hover effects, click handlers with hit testing
- **HTML controls** — sliders, checkboxes, selects, color pickers with auto-render
- **Coordinate system** — 14x8 world units, origin center, Y-up. No pixel math.
- **Calculus-ready** — function graphs with discontinuities, tangent lines, secant lines, annotations
- **Tailwind palette** — full color system with `sky`, `emerald`, `violet`, etc.

## Development

```bash
pnpm install
pnpm playground   # launches dev sandbox with live preview
pnpm test         # run tests
pnpm typecheck    # type-check all packages
```

## License

[MIT](./LICENSE)

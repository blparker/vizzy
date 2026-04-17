# @vizzyjs/renderer-canvas

Canvas2D renderer for [vizzy](https://github.com/blparker/vizzy) — a TypeScript math visualization library inspired by manim.

This package renders vizzy scenes to an HTML `<canvas>`, with an animation player, interactive controls, and mouse interaction. It's the default renderer — `createScene()` is the one-call entry point most users will want.

- **Docs:** https://vizzyjs.dev
- **Examples:** https://vizzyjs.dev/examples/
- **Repo:** https://github.com/blparker/vizzy

## Install

```bash
npm install @vizzyjs/core @vizzyjs/renderer-canvas
```

## Usage

```typescript
import { circle, fadeIn, sky } from '@vizzyjs/core';
import { createScene } from '@vizzyjs/renderer-canvas';

const canvas = document.querySelector('canvas')!;
const { add, play, grid, controls } = createScene(canvas);

grid();
const c = circle({ radius: 1, color: sky });
add(c);
await play(fadeIn(c));
```

See the [getting started guide](https://vizzyjs.dev/guide/getting-started) for a full walkthrough.

## What `createScene()` gives you

```ts
const { add, play, wait, grid, controls, interact, render, scene } = createScene(canvas);
```

| Property | Purpose |
|----------|---------|
| `add(shape)` | Add a shape (auto-renders) |
| `play(anim)` | Run an animation, returns a Promise |
| `wait(seconds)` | Pause between animations |
| `grid()` | Draw a coordinate grid |
| `controls` | `slider()`, `checkbox()`, `select()`, `text()`, `color()` — HTML inputs that re-render on change |
| `interact` | `draggable()`, `hoverable()`, `clickable()` with hit testing and cursor management |

## Why Canvas2D?

Canvas is ubiquitous, cheap to render, and has no DOM-tree overhead for the hundreds of shapes a math scene can produce. The `Renderer` interface in `@vizzyjs/core` is backend-agnostic, so SVG / WebGL renderers can be added without touching scenes.

## Peer dependencies

- `@vizzyjs/core` — required
- `katex` — optional, only needed for `tex()` shapes

## License

[MIT](https://github.com/blparker/vizzy/blob/main/LICENSE)

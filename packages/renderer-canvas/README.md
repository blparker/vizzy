# @vizzyjs/renderer-canvas

Canvas2D renderer for [vizzy](https://github.com/bryantpark04/vizzy) — a TypeScript math visualization library inspired by manim.

This package renders vizzy scenes to an HTML `<canvas>` element, with support for animations, interactive controls, and mouse interaction.

## Install

```bash
npm install @vizzyjs/core @vizzyjs/renderer-canvas
```

## Usage

```typescript
import { circle, fadeIn } from '@vizzyjs/core';
import { createScene } from '@vizzyjs/renderer-canvas';

const canvas = document.querySelector('canvas');
const { add, play, grid, controls } = createScene(canvas);

grid();
const c = circle({ radius: 1, color: sky });
add(c);
await play(fadeIn(c));
```

## What's Included

- **Canvas2D renderer** — high-DPI, full shape support including TeX (via KaTeX)
- **Animation player** — requestAnimationFrame loop, starts on play, stops when idle
- **Controls** — `slider()`, `checkbox()`, `select()`, `text()`, `color()` with auto-render on change
- **Interaction** — `draggable()`, `hoverable()`, `clickable()` with hit testing and cursor management
- **`createScene()`** — one-call setup returning `{ add, play, wait, grid, controls, interact, render, scene }`

## Peer Dependencies

- `@vizzyjs/core` — required
- `katex` — optional, needed only if you use `tex()` shapes

## License

[MIT](https://github.com/bryantpark04/vizzy/blob/main/LICENSE)

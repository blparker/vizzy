# @vizzyjs/core

Render-agnostic core for [vizzy](https://github.com/blparker/vizzy) — a TypeScript math visualization library inspired by manim.

This package holds the scene graph, shape factories, animation system, math utilities, and styling. It does not draw pixels. Pair it with a renderer — today that means [`@vizzyjs/renderer-canvas`](https://www.npmjs.com/package/@vizzyjs/renderer-canvas) for Canvas2D.

- **Docs:** https://vizzyjs.dev
- **Repo:** https://github.com/blparker/vizzy

## Install

```bash
npm install @vizzyjs/core @vizzyjs/renderer-canvas
```

## Example

```typescript
import { circle, fadeIn, sky } from '@vizzyjs/core';
import { createScene } from '@vizzyjs/renderer-canvas';

const canvas = document.querySelector('canvas')!;
const { add, play } = createScene(canvas);

const c = circle({ radius: 1, color: sky });
add(c);
await play(fadeIn(c));
```

## What's inside

- **Shapes** — `circle()`, `rect()`, `line()`, `polygon()`, `arc()`, `arrow()`, `text()`, `tex()`, `axes()`, `functionGraph()`, `brace()`, `angleShape()`, and more
- **Scene graph** — retained tree with groups, affine transforms, and z-ordering
- **Animations** — `fadeIn`, `fadeOut`, `create`, `animateShift`, `animateRotate`, `animateScale`, `animateColor`, `during`
- **Math** — `Vec2`, `Mat3`, `Color`, `BoundingBox`, easing functions, `lerp`
- **Palette** — full Tailwind CSS color system (22 scales × 11 shades)
- **Hit testing** — point-in-shape queries for interaction

## Writing a custom renderer

`@vizzyjs/core` exposes a `Renderer` interface. Any backend (SVG, WebGL, PDF) that implements it can drive the same scenes. See the [source](https://github.com/blparker/vizzy/tree/main/packages/renderer-canvas) of `renderer-canvas` for a reference implementation.

## License

[MIT](https://github.com/blparker/vizzy/blob/main/LICENSE)

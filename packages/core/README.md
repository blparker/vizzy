# @vizzyjs/core

Render-agnostic core for [vizzy](https://github.com/blparker/vizzy) — a TypeScript math visualization library inspired by manim.

This package contains the scene graph, shapes, animation system, math utilities, and styling — everything except the actual rendering. Pair it with [`@vizzyjs/renderer-canvas`](https://www.npmjs.com/package/@vizzyjs/renderer-canvas) for Canvas2D output.

## Install

```bash
npm install @vizzyjs/core
```

## What's Included

- **Shapes** — `circle()`, `rect()`, `line()`, `polygon()`, `arc()`, `arrow()`, `text()`, `tex()`, `axes()`, `functionGraph()`, `brace()`, `angleShape()`, and more
- **Scene graph** — retained, with groups, transforms, and z-ordering
- **Animations** — `fadeIn`, `fadeOut`, `create`, `animateShift`, `animateRotate`, `animateScale`, `animateColor`, `during`
- **Math** — `Vec2`, `Mat3` (affine transforms), `Color`, `BoundingBox`, easing functions, lerp
- **Palette** — full Tailwind CSS color system (22 scales x 11 shades)
- **Hit testing** — point-in-shape queries for interaction

## License

[MIT](https://github.com/blparker/vizzy/blob/main/LICENSE)

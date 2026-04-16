<script setup>
const firstScene = `export default function({ add }) {
    add(circle({ color: sky }));
}`

const shapesIntro = `export default function({ add, grid }) {
    grid();
    add(
        circle({ radius: 0.8, style: { stroke: sky } }).shift(-3, 1),
        rect({ width: 2, height: 1.2, style: { stroke: emerald } }).shift(0, 1),
        triangle({ radius: 0.9, style: { stroke: red } }).shift(3, 1),
        arrow([-3, -1.5], [3, -1.5], { color: orange }),
    );
}`

const animationIntro = `export default async function({ add, play, grid }) {
    const c = circle({ color: sky });
    const r = rect({ width: 1.5, height: 1.5, color: emerald }).shift(3, 0);

    await play(fadeIn(c), fadeIn(r));
    await play(animateShift(c, [-3, 0]));
    await play(animateColor(c, { stroke: red }), animateRotate(r, Math.PI / 4));
}`
</script>

# Getting Started

## Installation

```bash
npm install @vizzyjs/core @vizzyjs/renderer-canvas
```

::: tip pnpm / yarn
Works with any package manager: `pnpm add`, `yarn add`, etc.
:::

## Your First Scene

Vizzy renders to an HTML `<canvas>`. Use `createScene()` to set up the scene, then `add()` shapes and call `render()`:

```typescript
import { circle, sky } from '@vizzyjs/core';
import { createScene } from '@vizzyjs/renderer-canvas';

const canvas = document.querySelector('canvas');
const { add, render } = createScene(canvas);

add(circle({ color: sky }));
render();
```

<ClientOnly>
  <VizzyExample :code="firstScene" />
</ClientOnly>

`createScene()` returns an object you can destructure. The most common properties are:

| Property | Purpose |
|----------|---------|
| `add(shape)` | Add a shape to the scene |
| `render()` | Draw the current frame |
| `grid()` | Add a coordinate grid |
| `play(animation)` | Run an animation (returns a Promise) |
| `wait(seconds)` | Pause between animations |
| `controls` | Create HTML controls (sliders, etc.) |
| `interact` | Add drag/hover/click to shapes |

## Shapes

Vizzy has 30+ shape factory functions. Every shape starts at the origin — use `shift(x, y)` to position it.

<ClientOnly>
  <VizzyExample :code="shapesIntro" />
</ClientOnly>

All shapes support a `color` shorthand for quick styling, or a `style` object for full control. See [Shapes](/guide/shapes) for the complete list.

## Animations

Animations use `async/await`. Call `play()` to animate, and `await` the result. Pass multiple animations to `play()` to run them simultaneously.

<ClientOnly>
  <VizzyExample :code="animationIntro" />
</ClientOnly>

See [Animations](/guide/animations) for all animation types and options.

## Coordinate System

Vizzy uses a 14x8 world-unit coordinate system with the origin at center and Y pointing up. You never deal with pixels — shapes are positioned in world units, and the renderer handles DPR scaling.

```
         (0, 4)
           │
(-7, 0) ───┼─── (7, 0)
           │
         (0, -4)
```

## What's Next

- [Shapes](/guide/shapes) — All shape factories, positioning, colors, groups, and text
- [Animations](/guide/animations) — The animation system in depth
- [Interactivity](/guide/interactivity) — Controls and mouse interaction
- [Examples](/examples/) — Gallery of interactive examples

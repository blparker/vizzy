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

## Your First Scene

Create an HTML page with a `<canvas>` element, then use `createScene` to start drawing:

```typescript
import { circle, sky } from '@vizzyjs/core';
import { createScene } from '@vizzyjs/renderer-canvas';

const canvas = document.querySelector('canvas');
const { add, grid, render } = createScene(canvas);

grid();
add(circle({ color: sky }));
render();
```

Here's what that produces:

<ClientOnly>
  <VizzyExample :code="firstScene" />
</ClientOnly>

## Adding More Shapes

Vizzy comes with 30+ shape factories. Here's a scene with several shapes:

<ClientOnly>
  <VizzyExample :code="shapesIntro" />
</ClientOnly>

## Animations

Use `play()` with `await` to animate shapes. Multiple animations in one `play()` call run simultaneously:

<ClientOnly>
  <VizzyExample :code="animationIntro" />
</ClientOnly>

## What's Next

-   [Shapes](/guide/shapes) — All available shape factories and their options
-   [Animations](/guide/animations) — The animation system in depth
-   [Interactivity](/guide/interactivity) — Controls, dragging, and click handlers
-   [Examples](/examples/) — Gallery of complete examples

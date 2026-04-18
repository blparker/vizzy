<script setup>
const firstScene = `add(circle({ color: sky }));`

const shapesIntro = `grid();

const c = circle({ color: sky });
const r = rect({ color: emerald }).shift(3, 0);

add(c, r);`

const animationIntro = `const c = circle({ color: sky });
const r = rect({ width: 1.5, height: 1.5, color: emerald }).shift(3, 0);

await play(fadeIn(c), fadeIn(r));
await play(animateShift(c, [-3, 0]));
await play(animateColor(c, { stroke: red }), animateRotate(r, Math.PI / 4));`
</script>

# Getting Started

## Installation

```bash
pnpm add @vizzyjs/core @vizzyjs/renderer-canvas
```

::: tip Other package managers

```bash
npm install @vizzyjs/core @vizzyjs/renderer-canvas
# or
yarn add @vizzyjs/core @vizzyjs/renderer-canvas
```

:::

## Your First Scene

Vizzy renders to an HTML `<canvas>`. Use `createScene()` to set up the scene, then `add()` shapes.

The shortest runnable example. Drop this into a module script on an otherwise empty page and it works:

```typescript
import { circle, sky } from '@vizzyjs/core';
import { createScene } from '@vizzyjs/renderer-canvas';

// create the canvas
const canvas = document.createElement('canvas');
canvas.width = 800;
canvas.height = 457;
document.body.appendChild(canvas);

// create the scene
const { add } = createScene(canvas);

// start adding shapes
add(circle({ color: sky }));
```

### Using an existing canvas

If your HTML already has a canvas, just grab it and hand it to `createScene()`:

```typescript
import { circle, sky } from '@vizzyjs/core';
import { createScene } from '@vizzyjs/renderer-canvas';

const canvas = document.querySelector<HTMLCanvasElement>('#my-canvas')!;
const { add } = createScene(canvas);

add(circle({ color: sky }));
```

### Callback form

`renderScene()` is a thin wrapper that hands the bound scene to a callback. Useful when you want the scene's API in a single block without destructuring:

```typescript
import { circle, sky } from '@vizzyjs/core';
import { renderScene } from '@vizzyjs/renderer-canvas';

const canvas = document.querySelector<HTMLCanvasElement>('#my-canvas')!;

renderScene(canvas, ({ add }) => {
    add(circle({ color: sky }));
});
```

All three forms produce the same scene:

<ClientOnly>
  <VizzyExample :code="firstScene" />
</ClientOnly>

`createScene()` returns an object you can destructure. The most common properties are:

| Property          | Purpose                                 |
| ----------------- | --------------------------------------- |
| `add(shape)`      | Add a shape to the scene (auto-renders) |
| `grid()`          | Add a coordinate grid                   |
| `play(animation)` | Run an animation (returns a Promise)    |
| `wait(seconds)`   | Pause between animations                |
| `controls`        | Create HTML controls (sliders, etc.)    |
| `interact`        | Add drag/hover/click to shapes          |

::: tip Sandbox vs real code
The live examples below are sandboxes where `add`, `play`, `grid`, and every `@vizzyjs/core` export (`circle`, `sky`, `fadeIn`, ...) are injected as globals. In your own project, you'd get them via `import` + `createScene()` as shown above. The rest of the code is identical.
:::

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

-   [Shapes](/guide/shapes) — All shape factories, positioning, colors, groups, and text
-   [Animations](/guide/animations) — The animation system in depth
-   [Interactivity](/guide/interactivity) — Controls and mouse interaction
-   [Examples](/examples/) — Gallery of interactive examples

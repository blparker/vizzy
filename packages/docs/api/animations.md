<script setup>
const showcase = `const c = circle({ color: sky }).shift(-4, 0);
const r = rect({ width: 1.5, height: 1.5, color: emerald }).shift(4, 0);

await play(fadeIn(c), create(r));
await play(animateShift(c, [4, 0]), animateShift(r, [-4, 0]));
await play(animateColor(c, { stroke: red }), animateRotate(r, Math.PI / 4));
await wait(0.5);`
</script>

# Animations

Every animation function Vizzy exposes. All are passed to `play()`, which returns a promise you can `await`.

<ClientOnly>
  <VizzyExample :code="showcase" />
</ClientOnly>

## Fade

| Function  | Signature                                       | Description                                                        |
| --------- | ----------------------------------------------- | ------------------------------------------------------------------ |
| `fadeIn`  | `fadeIn(shape, { shift?, duration?, easing? })` | Fade shape in from transparent. Adds shape to scene automatically. |
| `fadeOut` | `fadeOut(shape, { duration?, easing? })`        | Fade shape out to transparent.                                     |

## Creation

| Function | Signature                               | Description                                                      |
| -------- | --------------------------------------- | ---------------------------------------------------------------- |
| `create` | `create(shape, { duration?, easing? })` | Progressively draw the shape's stroke, as if tracing with a pen. |

## Movement

| Function        | Signature                                               | Description                                 |
| --------------- | ------------------------------------------------------- | ------------------------------------------- |
| `animateShift`  | `animateShift(shape, [dx, dy], { duration?, easing? })` | Relative translation from current position. |
| `animateMoveTo` | `animateMoveTo(shape, [x, y], { duration?, easing? })`  | Absolute translation to a destination.      |

## Transform

| Function        | Signature                                             | Description                      |
| --------------- | ----------------------------------------------------- | -------------------------------- |
| `animateRotate` | `animateRotate(shape, angle, { duration?, easing? })` | Rotate by angle in radians.      |
| `animateScale`  | `animateScale(shape, factor, { duration?, easing? })` | Scale uniformly (1 = no change). |

## Style

| Function         | Signature                                                     | Description                                     |
| ---------------- | ------------------------------------------------------------- | ----------------------------------------------- |
| `animateColor`   | `animateColor(shape, { stroke?, fill?, duration?, easing? })` | Smooth color transition for stroke and/or fill. |
| `animateOpacity` | `animateOpacity(shape, target, { duration?, easing? })`       | Fade to a specific opacity (0–1).               |

## Custom

| Function        | Signature                                      | Description                                                                                            |
| --------------- | ---------------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| `during`        | `during(callback, { duration?, easing? })`     | Run `callback(t)` every frame while other animations play. Useful for live labels, computed positions. |
| `makeAnimation` | `makeAnimation({ apply, duration?, easing? })` | Low-level primitive to build custom animation types.                                                   |

## Playback

| Function | Signature                       | Description                                                          |
| -------- | ------------------------------- | -------------------------------------------------------------------- |
| `play`   | `play(...animations, options?)` | Run animations, returns a promise. Multiple args run simultaneously. |
| `wait`   | `wait(seconds)`                 | Pause for a duration.                                                |

**Sequential vs simultaneous:**

```typescript
// Simultaneous - all at once
await play(fadeIn(a), fadeIn(b));

// Sequential - one after another
await play(fadeIn(a));
await play(fadeIn(b));
```

## Options

All animations accept the same options object:

| Option     | Default  | Description                  |
| ---------- | -------- | ---------------------------- |
| `duration` | `1`      | Length in seconds.           |
| `easing`   | `smooth` | Easing function (see below). |

## Easing functions

| Name                                               | Curve                         |
| -------------------------------------------------- | ----------------------------- |
| `linear`                                           | Constant speed.               |
| `easeInQuad`, `easeInCubic`, `easeInSine`          | Start slow, accelerate.       |
| `easeOutQuad`, `easeOutCubic`, `easeOutSine`       | Start fast, decelerate.       |
| `easeInOutQuad`, `easeInOutCubic`, `easeInOutSine` | Slow at both ends.            |
| `smooth`                                           | Hermite smoothstep (default). |
| `smoother`                                         | Ken Perlin's smootherstep.    |

Quad is mildest (`t²`), cubic is stronger (`t³`), sine is the most gradual.

See the [Animations guide](/guide/animations) for worked examples.

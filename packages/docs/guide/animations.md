<script setup>
const fadeExample = `const c = circle({ color: sky });
const r = rect({ width: 1.5, height: 1.5, color: emerald }).shift(3, 0);

await play(fadeIn(c));
await wait(0.5);
await play(fadeIn(r));
await wait(0.5);
await play(fadeOut(c), fadeOut(r));`

const createExample = `grid();

const c = circle({ color: sky }).shift(-2, 0);
const r = rect({ width: 2, height: 1.2, color: emerald }).shift(2, 0);

await play(create(c));
await play(create(r));
await wait(1);`

const movementExample = `const c = circle({ color: sky });
await play(fadeIn(c));

await play(animateShift(c, [3, 2]));
await play(animateShift(c, [-6, 0]));
await play(animateMoveTo(c, [0, 0]));
await wait(0.5);`

const transformExample = `const r = rect({ width: 2, height: 1.5, color: emerald });
await play(fadeIn(r));

await play(animateRotate(r, Math.PI / 4));
await play(animateScale(r, 1.5));
await play(animateScale(r, 0.5));
await wait(0.5);`

const colorExample = `const c = circle({ color: sky });
await play(fadeIn(c));

await play(animateColor(c, { stroke: red }));
await play(animateColor(c, { stroke: violet, fill: violet[900] }));
await play(animateOpacity(c, 0.3));
await play(animateOpacity(c, 1));
await wait(0.5);`

const simultaneousExample = `const c = circle({ color: sky }).shift(-3, 0);
const r = rect({ width: 1.5, height: 1.5, color: emerald }).shift(3, 0);

await play(fadeIn(c), fadeIn(r));
await play(
    animateShift(c, [3, 0]),
    animateShift(r, [-3, 0]),
    animateColor(c, { stroke: red }),
    animateColor(r, { stroke: violet }),
);
await wait(0.5);`

const duringExample = `grid();

const dot = circle({ radius: 0.15, style: { fill: sky, stroke: null } });
const lbl = text({
    content: '(0.0, 0.0)',
    position: [0, 0.5],
    style: { fill: white, fontSize: 0.25 },
});
add(dot, lbl);

await play(
    animateShift(dot, [4, 2]),
    animateShift(lbl, [4, 2]),
    during(() => {
        const [x, y] = dot.center;
        lbl.content = '(' + x.toFixed(1) + ', ' + y.toFixed(1) + ')';
    }),
    { duration: 2 },
);

await wait(1);`

const optionsExample = `const c = circle({ color: sky });
await play(fadeIn(c));

await play(animateShift(c, [3, 0]), { duration: 2 });
await play(animateShift(c, [-3, 0]), { duration: 0.5, easing: easeInOut });
await wait(0.5);`
</script>

# Animations

Vizzy's animation system uses `async/await`. Call `play()` to run animations and `await` the result. This gives you sequential flow with native JavaScript, no queues or schedulers.

::: tip Key concept
Shapes added with `add()` are visible immediately. If you want them to appear with an animation, skip the `add()`. Calling `play(fadeIn(shape))` adds the shape to the scene automatically.
:::

## Fade In / Fade Out

The simplest way to make shapes appear and disappear:

<ClientOnly>
  <VizzyExample :code="fadeExample" />
</ClientOnly>

## Create (Draw-On)

`create()` progressively draws a shape's stroke, like a pen tracing it. Works best with shapes that have visible strokes:

<ClientOnly>
  <VizzyExample :code="createExample" />
</ClientOnly>

## Movement

Two ways to animate position:

- **`animateShift(shape, [dx, dy])`**: relative offset from current position
- **`animateMoveTo(shape, [x, y])`**: absolute destination

<ClientOnly>
  <VizzyExample :code="movementExample" />
</ClientOnly>

## Rotation and Scale

- **`animateRotate(shape, angle)`**: rotate by angle in radians
- **`animateScale(shape, factor)`**: scale uniformly (1 = no change)

<ClientOnly>
  <VizzyExample :code="transformExample" />
</ClientOnly>

## Color and Opacity

- **`animateColor(shape, { stroke?, fill? })`**: smooth color transition
- **`animateOpacity(shape, target)`**: fade to a specific opacity (0-1)

<ClientOnly>
  <VizzyExample :code="colorExample" />
</ClientOnly>

## Simultaneous vs Sequential

**Simultaneous:** pass multiple animations to a single `play()` call:

```typescript
await play(fadeIn(a), fadeIn(b), fadeIn(c)); // all at once
```

**Sequential:** use separate `await play()` calls:

```typescript
await play(fadeIn(a)); // first
await play(fadeIn(b)); // then
await play(fadeIn(c)); // then
```

<ClientOnly>
  <VizzyExample :code="simultaneousExample" />
</ClientOnly>

## Per-Frame Updates with during()

`during(callback)` runs a function every frame while other animations play. The callback receives the eased progress `t` (0 to 1). Use it for dynamic labels, computed positions, or anything that needs continuous updates:

<ClientOnly>
  <VizzyExample :code="duringExample" />
</ClientOnly>

## Options

Pass an options object as the last argument to `play()`:

| Option | Default | Description |
|--------|---------|-------------|
| `duration` | `1` | Animation length in seconds |
| `easing` | `smooth` | Easing function |

<ClientOnly>
  <VizzyExample :code="optionsExample" />
</ClientOnly>

::: details Available easing functions
- `linear`: constant speed
- `easeIn`: starts slow, accelerates
- `easeOut`: starts fast, decelerates
- `easeInOut`: slow at both ends
- `smooth`: Hermite smoothstep (default)
- `smoother`: Ken Perlin's smootherstep
:::

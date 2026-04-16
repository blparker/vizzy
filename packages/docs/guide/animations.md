<script setup>
const fadeExample = `export default async function({ add, play, wait }) {
    const c = circle({ color: sky });
    const r = rect({ width: 1.5, height: 1.5, color: emerald }).shift(3, 0);

    await play(fadeIn(c));
    await wait(0.5);
    await play(fadeIn(r));
    await wait(0.5);
    await play(fadeOut(c), fadeOut(r));
}`

const createExample = `export default async function({ add, play, wait, grid }) {
    grid();

    const c = circle({ color: sky }).shift(-2, 0);
    const r = rect({ width: 2, height: 1.2, color: emerald }).shift(2, 0);

    await play(create(c));
    await play(create(r));
    await wait(1);
}`

const movementExample = `export default async function({ add, play, wait }) {
    const c = circle({ color: sky });
    await play(fadeIn(c));

    await play(animateShift(c, [3, 2]));
    await play(animateShift(c, [-6, 0]));
    await play(animateMoveTo(c, [0, 0]));
    await wait(0.5);
}`

const transformExample = `export default async function({ add, play, wait }) {
    const r = rect({ width: 2, height: 1.5, color: emerald });
    await play(fadeIn(r));

    await play(animateRotate(r, Math.PI / 4));
    await play(animateScale(r, 1.5));
    await play(animateScale(r, 0.5));
    await wait(0.5);
}`

const colorExample = `export default async function({ add, play, wait }) {
    const c = circle({ color: sky });
    await play(fadeIn(c));

    await play(animateColor(c, { stroke: red }));
    await play(animateColor(c, { stroke: violet, fill: violet[900] }));
    await play(animateOpacity(c, 0.3));
    await play(animateOpacity(c, 1));
    await wait(0.5);
}`

const simultaneousExample = `export default async function({ add, play, wait }) {
    const c = circle({ color: sky }).shift(-3, 0);
    const r = rect({ width: 1.5, height: 1.5, color: emerald }).shift(3, 0);

    await play(fadeIn(c), fadeIn(r));
    await play(
        animateShift(c, [3, 0]),
        animateShift(r, [-3, 0]),
        animateColor(c, { stroke: red }),
        animateColor(r, { stroke: violet }),
    );
    await wait(0.5);
}`

const duringExample = `export default async function({ add, play, wait, grid }) {
    grid();

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

    await wait(1);
}`

const optionsExample = `export default async function({ add, play, wait }) {
    const c = circle({ color: sky });
    await play(fadeIn(c));

    await play(animateShift(c, [3, 0]), { duration: 2 });
    await play(animateShift(c, [-3, 0]), { duration: 0.5, easing: easeInOut });
    await wait(0.5);
}`
</script>

# Animations

Vizzy's animation system uses async/await. Call `play()` to run animations and `await` the result. This gives you sequential flow with native JavaScript — no queues or schedulers.

## Fade In / Fade Out

The simplest animations. Shapes are invisible until animated in:

<ClientOnly>
  <VizzyExample :code="fadeExample" />
</ClientOnly>

## Create (Draw-On)

`create()` draws a shape's stroke progressively, like a pen tracing it:

<ClientOnly>
  <VizzyExample :code="createExample" />
</ClientOnly>

## Movement

`animateShift(shape, [dx, dy])` moves by a relative offset. `animateMoveTo(shape, [x, y])` moves to an absolute position:

<ClientOnly>
  <VizzyExample :code="movementExample" />
</ClientOnly>

## Rotation and Scale

`animateRotate(shape, angle)` rotates by an angle in radians. `animateScale(shape, factor)` scales uniformly:

<ClientOnly>
  <VizzyExample :code="transformExample" />
</ClientOnly>

## Color and Opacity

`animateColor(shape, { stroke?, fill? })` transitions colors smoothly. `animateOpacity(shape, target)` fades to a specific opacity:

<ClientOnly>
  <VizzyExample :code="colorExample" />
</ClientOnly>

## Simultaneous Animations

Pass multiple animations to a single `play()` call and they run at the same time:

<ClientOnly>
  <VizzyExample :code="simultaneousExample" />
</ClientOnly>

For sequential animations, use separate `await play()` calls — one after the other.

## Per-Frame Updates with during()

`during(callback)` runs a function every frame during an animation. Use it for dynamic labels, computed positions, or anything that needs to update continuously:

<ClientOnly>
  <VizzyExample :code="duringExample" />
</ClientOnly>

## Options

Pass options as the last argument to `play()`. Available options:

- `duration` — animation length in seconds (default: 1)
- `easing` — easing function (default: `smooth`)

<ClientOnly>
  <VizzyExample :code="optionsExample" />
</ClientOnly>

Available easing functions: `linear`, `easeIn`, `easeOut`, `easeInOut`, `smooth` (default), `smoother`.

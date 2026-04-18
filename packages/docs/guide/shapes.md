<script setup>
const basicShapes = `grid();
add(
    circle({ color: sky }),
    rect({ width: 2, height: 1.2, color: emerald }).shift(3, 0),
    triangle({ color: red }).shift(-3, 0),
);`

const moreShapes = `grid();
add(
    regularPolygon({ sides: 6, color: violet }).shift(-4, 1.5),
    star({ points: 5, outerRadius: 0.8, color: yellow }).shift(-1, 1.5),
    ellipse({ rx: 1.2, ry: 0.6, style: { stroke: pink } }).shift(2, 1.5),
    square({ size: 1.2, color: orange }).shift(5, 1.5),
);`

const linesAndArrows = `grid();
add(
    line([-5, 2], [-2, 2], { color: sky }),
    arrow([-5, 0], [-2, 0], { color: emerald }),
    dashedLine({ start: [-5, -2], end: [-2, -2], style: { stroke: orange } }),
    doubleArrow({ start: [1, 2], end: [5, 2], style: { stroke: violet, fill: violet } }),
    vector({ direction: [2, 1], style: { stroke: red, fill: red } }).shift(1, -1),
    curvedArrow({ start: [1, -1], end: [5, -1], style: { stroke: pink } }),
);`

const positioning = `grid();

const c = circle({ color: sky });
add(c);

const r = rect({ width: 1.5, height: 1, color: emerald });
r.shift(3, 2);
add(r);

const t = triangle({ color: red });
t.moveTo([-3, -2]);
add(t);

const s = square({ size: 1, color: violet });
s.nextTo(c, RIGHT);
add(s);`

const colors = `grid();
add(
    circle({ color: sky }).shift(-4, 2),
    circle({ color: emerald }).shift(-1, 2),
    circle({ color: violet }).shift(2, 2),
    circle({ color: red }).shift(5, 2),

    circle({ style: { stroke: sky, fill: sky[900] } }).shift(-4, -1),
    circle({ style: { stroke: emerald[300] } }).shift(-1, -1),
    circle({ style: { stroke: violet, fill: violet.alpha(0.3) } }).shift(2, -1),
    circle({ style: { fill: orange, stroke: null } }).shift(5, -1),
);`

const groups = `grid();

const g = group(
    circle({ radius: 0.5, color: sky }),
    rect({ width: 1.5, height: 0.8, color: emerald }).shift(0, -1.2),
    triangle({ radius: 0.5, color: red }).shift(0, 1.2),
);

add(g);
g.shift(3, 0);

const row = group(
    circle({ radius: 0.4, color: violet }),
    circle({ radius: 0.4, color: pink }),
    circle({ radius: 0.4, color: orange }),
);
row.arrange(RIGHT, 0.5);
row.shift(-3, 0);
add(row);`

const textAndTex = `grid();

add(
    text({ content: 'Hello, Vizzy!', position: [0, 2], style: { fill: white, fontSize: 0.5 } }),
    text({ content: 'smaller text', position: [0, 0.5], style: { fill: sky, fontSize: 0.25 } }),
);

const c = circle({ radius: 0.6, color: emerald }).shift(0, -2);
add(c);
add(label(c, 'circle', DOWN));`

const axesExample = `const ax = axes({
    xRange: [-5, 5, 1],
    yRange: [-3, 3, 1],
    includeNumbers: true,
    color: neutral[400],
});
add(ax);

add(functionGraph({
    fn: (x) => Math.sin(x),
    axes: ax,
    style: { stroke: sky, strokeWidth: 0.05 },
}));

add(functionGraph({
    fn: (x) => 0.5 * x,
    axes: ax,
    style: { stroke: emerald, strokeWidth: 0.03, lineDash: [0.1, 0.05] },
}));`
</script>

# Shapes

Vizzy provides factory functions for creating shapes. Every factory returns a shape object that you can position, style, and add to the scene.

## Basic Shapes

The most common shapes. Use the `color` shorthand to set the stroke color in one line:

<ClientOnly>
  <VizzyExample :code="basicShapes" />
</ClientOnly>

All shapes accept an optional props object. Without props, you get sensible defaults (radius 1, width 2, etc.).

## More Shapes

Polygons, stars, ellipses, and squares:

<ClientOnly>
  <VizzyExample :code="moreShapes" />
</ClientOnly>

::: details Full list of shape factories
`circle()`, `rect()`, `line()`, `arrow()`, `polygon()`, `regularPolygon()`, `triangle()`, `square()`, `ellipse()`, `arc()`, `star()`, `point()`, `text()`, `tex()`, `dashedLine()`, `vector()`, `doubleArrow()`, `curvedArrow()`, `arcBetweenPoints()`, `rightAngle()`, `surroundingRectangle()`, `numberLine()`, `axes()`, `functionGraph()`, `brace()`, `braceOver()`, `braceBetween()`, `angleShape()`, `edgeLabel()`, `lineLabel()`, `label()`, `group()`
:::

## Lines and Arrows

`line()` and `arrow()` support a positional shorthand — pass start and end points directly instead of a props object:

<ClientOnly>
  <VizzyExample :code="linesAndArrows" />
</ClientOnly>

## Positioning

Shapes start at the origin. Three ways to position them:

- **`shift(x, y)`** — move by a relative offset (chainable)
- **`moveTo([x, y])`** — move to an absolute position
- **`nextTo(shape, direction)`** — place adjacent to another shape

<ClientOnly>
  <VizzyExample :code="positioning" />
</ClientOnly>

Direction constants: `UP`, `DOWN`, `LEFT`, `RIGHT`, `UP_LEFT`, `UP_RIGHT`, `DOWN_LEFT`, `DOWN_RIGHT`, `ORIGIN`.

## Colors

Use the `color` shorthand for simple stroke coloring, or the `style` object for full control over stroke, fill, and opacity:

<ClientOnly>
  <VizzyExample :code="colors" />
</ClientOnly>

Vizzy includes the full Tailwind color palette. Each color has shades from `[50]` (lightest) to `[950]` (darkest), and an `.alpha(n)` method for transparency.

::: details Available colors
`red`, `orange`, `amber`, `yellow`, `lime`, `green`, `emerald`, `teal`, `cyan`, `sky`, `blue`, `indigo`, `violet`, `purple`, `fuchsia`, `pink`, `rose`, `slate`, `gray`, `zinc`, `neutral`, `stone`, plus `white` and `black`.
:::

## Groups

Use `group()` to compose shapes into a single unit. Groups can be positioned and transformed together. `arrange(direction, spacing)` auto-layouts children in a row or column:

<ClientOnly>
  <VizzyExample :code="groups" />
</ClientOnly>

Groups also support `moveToFront(shape)` and `moveToBack(shape)` for z-ordering within the group.

## Text and Labels

`text()` renders plain text. `label(shape, content, direction)` is a convenience that positions text near a shape automatically:

<ClientOnly>
  <VizzyExample :code="textAndTex" />
</ClientOnly>

For math formulas, use `tex()` which renders LaTeX via KaTeX. See the [TeX Formulas example](/examples/) in the gallery.

## Axes and Function Graphs

`axes()` creates a coordinate system with tick marks and optional labels. `functionGraph()` plots a function on axes:

<ClientOnly>
  <VizzyExample :code="axesExample" />
</ClientOnly>

Axes auto-frame the camera to fit their range. Use `c2p([x, y])` (coord-to-point) and `p2c([x, y])` (point-to-coord) to convert between axis coordinates and world coordinates.

::: tip
Use `ax.plot(fn, opts)` as a shorthand for creating and adding a function graph to axes in one call.
:::

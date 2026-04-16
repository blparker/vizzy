<script setup>
const basicShapes = `export default function({ add, grid }) {
    grid();
    add(
        circle({ color: sky }),
        rect({ width: 2, height: 1.2, color: emerald }).shift(3, 0),
        triangle({ color: red }).shift(-3, 0),
    );
}`

const moreShapes = `export default function({ add, grid }) {
    grid();
    add(
        regularPolygon({ sides: 6, color: violet }).shift(-4, 1.5),
        star({ points: 5, outerRadius: 0.8, color: yellow }).shift(-1, 1.5),
        ellipse({ rx: 1.2, ry: 0.6, style: { stroke: pink } }).shift(2, 1.5),
        square({ size: 1.2, color: orange }).shift(5, 1.5),
    );
}`

const linesAndArrows = `export default function({ add, grid }) {
    grid();
    add(
        line([-5, 2], [-2, 2], { color: sky }),
        arrow([-5, 0], [-2, 0], { color: emerald }),
        dashedLine({ start: [-5, -2], end: [-2, -2], style: { stroke: orange } }),
        doubleArrow({ start: [1, 2], end: [5, 2], style: { stroke: violet, fill: violet } }),
        vector({ direction: [2, 1], style: { stroke: red, fill: red } }).shift(1, -1),
        curvedArrow({ start: [1, -1], end: [5, -1], style: { stroke: pink } }),
    );
}`

const positioning = `export default function({ add, grid }) {
    grid();

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
    add(s);
}`

const colors = `export default function({ add, grid }) {
    grid();
    add(
        circle({ color: sky }).shift(-4, 2),
        circle({ color: emerald }).shift(-1, 2),
        circle({ color: violet }).shift(2, 2),
        circle({ color: red }).shift(5, 2),

        circle({ style: { stroke: sky, fill: sky[900] } }).shift(-4, -1),
        circle({ style: { stroke: emerald[300] } }).shift(-1, -1),
        circle({ style: { stroke: violet, fill: violet.alpha(0.3) } }).shift(2, -1),
        circle({ style: { fill: orange, stroke: null } }).shift(5, -1),
    );
}`

const groups = `export default function({ add, grid }) {
    grid();

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
    add(row);
}`

const textAndTex = `export default function({ add, grid }) {
    grid();

    add(
        text({ content: 'Hello, Vizzy!', position: [0, 2], style: { fill: white, fontSize: 0.5 } }),
        text({ content: 'smaller text', position: [0, 0.5], style: { fill: sky, fontSize: 0.25 } }),
    );

    const c = circle({ radius: 0.6, color: emerald }).shift(0, -2);
    add(c);
    add(label(c, 'circle', DOWN));
}`

const axesExample = `export default function({ add }) {
    const ax = axes({
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
    }));
}`
</script>

# Shapes

Vizzy provides factory functions for creating shapes. Every factory returns a shape object that you can position, style, and add to the scene.

## Basic Shapes

The most common shapes: circles, rectangles, and triangles. Use the `color` shorthand to set the stroke color.

<ClientOnly>
  <VizzyExample :code="basicShapes" />
</ClientOnly>

## More Shapes

Polygons, stars, ellipses, and squares:

<ClientOnly>
  <VizzyExample :code="moreShapes" />
</ClientOnly>

## Lines and Arrows

Lines, arrows, dashed lines, double arrows, vectors, and curved arrows:

<ClientOnly>
  <VizzyExample :code="linesAndArrows" />
</ClientOnly>

## Positioning

Shapes start at the origin. Use `shift(x, y)` for relative movement, `moveTo([x, y])` for absolute positioning, and `nextTo(shape, direction)` to place one shape adjacent to another:

<ClientOnly>
  <VizzyExample :code="positioning" />
</ClientOnly>

## Colors

Use the `color` shorthand for simple stroke coloring, or the `style` object for full control. Vizzy includes the full Tailwind color palette with shade access and alpha support:

<ClientOnly>
  <VizzyExample :code="colors" />
</ClientOnly>

Available colors: `red`, `orange`, `yellow`, `green`, `emerald`, `sky`, `blue`, `violet`, `purple`, `pink`, `neutral`, and more. Each has shades from `[50]` to `[950]`, and an `.alpha(n)` method.

## Groups

Use `group()` to compose shapes. Groups can be positioned and transformed as a unit. `arrange(direction, spacing)` auto-layouts children:

<ClientOnly>
  <VizzyExample :code="groups" />
</ClientOnly>

## Text and Labels

`text()` renders plain text. `label(shape, content, direction)` places text near a shape automatically:

<ClientOnly>
  <VizzyExample :code="textAndTex" />
</ClientOnly>

For math formulas, use `tex()` which renders LaTeX via KaTeX.

## Axes and Function Graphs

`axes()` creates a coordinate system. `functionGraph()` plots a function on axes:

<ClientOnly>
  <VizzyExample :code="axesExample" />
</ClientOnly>

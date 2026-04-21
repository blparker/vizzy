<script setup>
const showcase = `grid();
add(
    circle({ color: sky }).shift(-5, 1.5),
    square({ size: 1.2, color: emerald }).shift(-2, 1.5),
    star({ points: 5, outerRadius: 0.8, color: yellow }).shift(1, 1.5),
    regularPolygon({ sides: 6, color: violet }).shift(4, 1.5),
    arrow([-5, -1], [-2, -1], { color: pink }),
    curvedArrow({ start: [-1, -1], end: [2, -1], color: orange }),
    tex({ content: 'e^{i\\\\pi} + 1 = 0', position: [4, -1] }),
);`
</script>

# Shapes

Every shape Vizzy exposes. Each entry shows the factory function (lowercase, preferred) - the equivalent class (`CircleShape`, `RectShape`, etc.) is also exported for advanced use.

<ClientOnly>
  <VizzyExample :code="showcase" />
</ClientOnly>

## Primitives

| Factory          | Signature                                                             | Description                               |
| ---------------- | --------------------------------------------------------------------- | ----------------------------------------- |
| `circle`         | `circle({ radius?, color?, style? })`                                 | Circle with given radius (default 1).     |
| `rect`           | `rect({ width?, height?, cornerRadius?, color?, style? })`            | Rectangle with optional rounded corners.  |
| `square`         | `square({ size?, cornerRadius?, style? })`                            | Square convenience wrapper around `rect`. |
| `ellipse`        | `ellipse({ rx?, ry?, style? })`                                       | Ellipse with independent x/y radii.       |
| `line`           | `line(start, end, { color?, style? })` or `line({ start, end, ... })` | Straight line segment.                    |
| `polygon`        | `polygon({ points, closed?, style? })`                                | Arbitrary polygon from point list.        |
| `regularPolygon` | `regularPolygon({ sides?, radius?, center?, color?, style? })`        | Regular n-sided polygon.                  |
| `triangle`       | `triangle({ radius?, center?, color?, style? })`                      | Equilateral triangle.                     |
| `star`           | `star({ points?, outerRadius?, innerRadius?, center?, style? })`      | n-pointed star.                           |
| `arc`            | `arc({ center?, radius?, startAngle?, endAngle?, style? })`           | Circular arc segment.                     |
| `path`           | `new PathShape({ commands, style? })`                                 | SVG-style path from command list.         |

## Arrows & Vectors

| Factory       | Signature                                                                         | Description                       |
| ------------- | --------------------------------------------------------------------------------- | --------------------------------- |
| `arrow`       | `arrow(start, end, { color?, style? })` or `arrow({ start, end, tipSize?, ... })` | Arrow from point to point.        |
| `doubleArrow` | `doubleArrow({ start?, end?, tipSize?, style? })`                                 | Arrow with tips on both ends.     |
| `curvedArrow` | `curvedArrow({ start?, end?, angle?, tipSize?, style? })`                         | Curved arrow with bend angle.     |
| `vector`      | `vector({ direction?, tipSize?, style? })`                                        | Arrow from origin in a direction. |

## Text & Labels

| Factory     | Signature                                                    | Description                                                                           |
| ----------- | ------------------------------------------------------------ | ------------------------------------------------------------------------------------- |
| `text`      | `text({ content, position?, style? })`                       | Plain text shape.                                                                     |
| `tex`       | `tex({ content, position?, style? })`                        | LaTeX-rendered math (powered by KaTeX).                                               |
| `label`     | `label(shape, content, direction?, { offset?, style? })`     | Auto-positioned text near a shape.                                                    |
| `edgeLabel` | `edgeLabel({ shape, edge, content, offset?, style? })`       | Text pinned to a shape's edge (`'top' \| 'bottom' \| 'left' \| 'right' \| 'center'`). |
| `lineLabel` | `lineLabel({ start, end, content, offset?, side?, style? })` | Text alongside a line segment.                                                        |

## Math & Diagrams

| Factory            | Signature                                                                                                            | Description                                                    |
| ------------------ | -------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------- |
| `axes`             | `axes({ xRange?, yRange?, xLength?, yLength?, includeNumbers?, includeTicks?, includeTip?, xLabel?, yLabel?, ... })` | Cartesian axes with `coordToPoint` / `c2p` helper.             |
| `numberLine`       | `numberLine({ range?, length?, includeNumbers?, includeTicks?, includeTip?, ... })`                                  | Standalone number line.                                        |
| `functionGraph`    | `functionGraph({ fn, axes, xRange?, ... })`                                                                          | Plot a function on an axes. Use `axes.plot(fn)` for shorthand. |
| `tangentLine`      | `tangentLine({ fn, axes, x, length?, style? })`                                                                      | Tangent line to a function at x.                               |
| `lineThrough`      | `lineThrough({ p1, p2, extend?, style? })`                                                                           | Extended line through two points.                              |
| `arcBetweenPoints` | `arcBetweenPoints({ start, end, angle?, style? })`                                                                   | Arc connecting two points with given bend.                     |
| `angleShape`       | `angleShape({ vertex, point1, point2, radius?, ... })` or `angleShape({ line1, line2, ... })`                        | Angle arc between rays or lines.                               |
| `rightAngle`       | `rightAngle({ vertex, point1, point2, size?, style? })`                                                              | Right-angle marker (small square).                             |
| `brace`            | `brace({ start, end, direction?, sharpness?, style? })`                                                              | Curly brace between two points.                                |
| `braceOver`        | `braceOver({ shape, edge?, label?, sharpness?, labelOffset?, style?, labelStyle? })`                                 | Brace around one side of a shape, optionally labeled.          |
| `braceBetween`     | `braceBetween({ from, to, edge?, label?, ... })`                                                                     | Brace spanning two shapes.                                     |

## Dots, Grids & Markers

| Factory                | Signature                                                          | Description                                              |
| ---------------------- | ------------------------------------------------------------------ | -------------------------------------------------------- |
| `point`                | `point({ position?, radius?, color?, style? })`                    | Small filled dot (thin wrapper over `circle`).           |
| `grid`                 | `grid({ step?, style? })`                                          | Background coordinate grid. Usually called without args. |
| `dashedLine`           | `dashedLine({ start?, end?, dashPattern?, style? })`               | Line with dashed stroke.                                 |
| `surroundingRectangle` | `surroundingRectangle({ shape, padding?, cornerRadius?, style? })` | Rectangle sized to wrap a shape.                         |

## Groups

| Factory | Signature            | Description                                      |
| ------- | -------------------- | ------------------------------------------------ |
| `group` | `group(...children)` | Combine shapes into a single transformable unit. |

All group methods, `shift`, `moveTo`, `scale`, `rotate`, `nextTo`, etc., propagate to children.

## Shape methods

Every shape supports a common transform and positioning API:

| Method                                          | Description                       |
| ----------------------------------------------- | --------------------------------- |
| `shift(dx, dy)`                                 | Translate by offset.              |
| `moveTo([x, y])`                                | Move center to absolute position. |
| `scale(s)` or `scale(sx, sy)`                   | Uniform or independent scaling.   |
| `rotate(angle)`                                 | Rotate by radians around center.  |
| `nextTo(other, direction, buffer?)`             | Place adjacent to another shape.  |
| `.center`, `.top`, `.bottom`, `.left`, `.right` | Anchor points for positioning.    |
| `.width`, `.height`                             | Bounding dimensions.              |

See the [Shapes guide](/guide/shapes) for worked examples.

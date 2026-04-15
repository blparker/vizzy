# Vimath3 Initial Build Plan

## Context

Building a TypeScript visualization library inspired by manim (3blue1brown). The goal is a library that makes it trivially easy to create math visualizations — static initially, with animation and interactivity designed in from day 1. The project is a pnpm monorepo with `@vimath/core` (render-agnostic), `@vimath/renderer-canvas` (Canvas2D), and `@vimath/playground` (dev sandbox). All three packages exist as stubs.

## Architecture Decisions

- **Coordinate system**: 14x8 world units, origin center, Y-up. Users never deal with pixels.
- **API**: Hybrid — functional factories (`circle()`, `rect()`) + optional class-based Scene
- **Render model**: Visitor pattern. Shapes are data, renderers draw them. Core traversal composes transforms and styles, then dispatches to per-shape-type renderer methods.
- **Styling**: Inline style props on shapes + shared style objects. Inline overrides shared. Cascade from parent to child during traversal.
- **Shape taxonomy**: Shallow hierarchy. Base `Shape` class → `Circle`, `Rect`, `Line`, `Polygon`, `Arc`, `Text`, `Group`. `Arrow` extends `Group` (composite).
- **Scene model**: Retained scene graph with dirty tracking for future animation/interaction support.

## File Structure

```
packages/core/src/
  index.ts
  uid.ts                        # Shape identity generator
  math/
    index.ts
    vec2.ts                     # Vec2 = readonly [number, number] + functions
    vec3.ts                     # Vec3 for color math / future use
    mat3.ts                     # 3x3 affine transform (Float64Array)
    color.ts                    # Color type, hex parsing, interpolation
    easing.ts                   # Easing functions
    lerp.ts                     # lerp, clamp, remap
  style/
    index.ts
    types.ts                    # Style interface, DEFAULT_STYLE, mergeStyles
  shapes/
    index.ts
    types.ts                    # ShapeType enum
    shape.ts                    # Abstract base class (id, type, style, transform, parent, dirty)
    circle.ts
    rect.ts
    line.ts
    polygon.ts
    arc.ts
    text.ts
    group.ts
    arrow.ts                    # Extends Group: Line + triangle head
    factories.ts                # circle(), rect(), line(), etc.
  scene/
    index.ts
    camera.ts                   # World→pixel transform (14x8 → canvas pixels)
    scene.ts                    # Retained graph, render traversal, add/remove
  renderer/
    index.ts
    types.ts                    # Renderer interface (visitor methods)

packages/renderer-canvas/src/
  index.ts
  canvas-renderer.ts            # Implements Renderer via Canvas2D API

packages/playground/src/
  main.ts                       # Demo: create scene, add shapes, render
```

## Implementation Order

### Phase 1: Math foundations
Files: `uid.ts`, `math/vec2.ts`, `math/vec3.ts`, `math/mat3.ts`, `math/lerp.ts`, `math/easing.ts`, `math/color.ts`, `math/index.ts`

- `Vec2` = `readonly [number, number]`, pure functions (add, sub, scale, dot, length, normalize, distance, rotate, lerp)
- `Mat3` = `Float64Array(9)`, column-major. Functions: identity, translation, rotation, scaling, multiply, transformPoint, invert
- `Color` = `{r, g, b, a}` all 0-1. Helpers: rgba, fromHex, toHex, toCssRgba, lerpColor, named constants
- Tests for vec2, mat3, color (mat3 tests are critical — verify multiply, transformPoint, column-major layout)

### Phase 2: Style system
Files: `style/types.ts`, `style/index.ts`

- `Style` interface: fill, stroke, strokeWidth, opacity, lineCap, lineJoin, lineDash, fontSize, fontFamily, textAlign, textBaseline
- `DEFAULT_STYLE`: stroke white, strokeWidth 0.04, no fill
- `mergeStyles(base, override)`: non-undefined override fields win

### Phase 3: Shape system
Files: `shapes/types.ts`, `shapes/shape.ts`, `shapes/group.ts`, `shapes/circle.ts`, `shapes/rect.ts`, `shapes/line.ts`, `shapes/polygon.ts`, `shapes/arc.ts`, `shapes/text.ts`, `shapes/arrow.ts`, `shapes/factories.ts`, `shapes/index.ts`

- Base `Shape` class: id (auto-generated), type, style, transform (Mat3, default identity), parent pointer, visible flag
- Transform helpers on Shape: `.translate()`, `.rotate()`, `.scale()`, `.setPosition()` — mutate transform, return `this`
- `markDirty()` walks up parent chain to Scene
- Each concrete shape: thin class with geometry props (e.g., CircleShape has center: Vec2, radius: number)
- `Group`: children array, add/remove/clear
- `ArrowShape extends Group`: manages internal Line + triangle Polygon, rebuilds children when start/end change
- Factory functions: `circle()`, `rect()`, etc. — shorthand for `new CircleShape(props)`

### Phase 4: Renderer interface + Scene
Files: `renderer/types.ts`, `scene/camera.ts`, `scene/scene.ts`, barrels

**Renderer interface:**
```ts
interface Renderer {
  beginFrame(scene: Scene): void;
  endFrame(scene: Scene): void;
  drawCircle(shape, worldTransform: Mat3, computedStyle: Style): void;
  drawRect(...): void;
  drawLine(...): void;
  drawPolygon(...): void;
  drawArc(...): void;
  drawText(...): void;
  enterGroup(group, worldTransform, computedStyle): void;
  exitGroup(group): void;
}
```

**Camera**: Maps world (14x8, Y-up) → pixels. Uniform scale = `min(pw/ww, ph/wh)`, Y-flip, center offset. Provides `getWorldToPixel(): Mat3` and `getPixelToWorld(): Mat3`.

**Scene.render(renderer)** traversal:
1. `renderer.beginFrame()`
2. Walk from root Group with initial transform = `camera.getWorldToPixel()`
3. At each node: compose `worldTransform = multiply(parent, shape.transform)`, merge styles, dispatch to renderer method
4. `renderer.endFrame()`

### Phase 5: Canvas renderer
File: `renderer-canvas/src/canvas-renderer.ts`

- Each draw method: `ctx.save()` → apply composed transform via `ctx.setTransform()` → draw shape in local coords → apply fill/stroke from style → `ctx.restore()`
- Text: compensate for Y-flip before drawing (apply additional Y-flip so text isn't upside down)
- `beginFrame`: clear canvas with background color
- `enterGroup/exitGroup`: save/restore for opacity compositing

### Phase 6: Playground demo + core barrel
- Update `core/src/index.ts` to re-export all public API
- Rewrite `playground/src/main.ts`: create Scene, add circles/rects/lines/arrows/text, render via CanvasRenderer

## Key Design Notes

- **Stroke width in world units**: Strokes scale with transform (matches manim behavior). World units are more intuitive than pixels.
- **Style cascade**: Parent style flows to children during traversal. Child's inline style overrides. This enables group-level styling.
- **Transform composition**: `camera * parent₁ * parent₂ * ... * shape.transform`. Core traversal builds this incrementally; renderer receives the final composed transform.
- **Arrow as Group**: No special `drawArrow` method needed. Arrow manages its child Line + Polygon internally. The renderer just draws the children.
- **Y-flip gotcha**: Camera flips Y. Arc angles rotate clockwise in world space. Text draw must compensate with additional Y-flip.

## Verification

1. `pnpm test` — unit tests for vec2, mat3, color, shapes, scene
2. `pnpm build` — all packages compile cleanly
3. `pnpm typecheck` — no TypeScript errors
4. `pnpm playground` — visual verification: open browser, see a scene with multiple shapes (circles, rectangles, lines, arrows, text) properly positioned in the 14x8 coordinate space with correct styling

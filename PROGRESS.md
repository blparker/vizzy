# Vimath3 Progress

## Architecture

- **Monorepo**: pnpm workspace with `@vimath/core`, `@vimath/renderer-canvas`, `@vimath/playground`
- **Coordinate system**: 14x8 world units (configurable), origin center, Y-up. Height is fixed, width adapts to canvas aspect ratio via `min(scaleX, scaleY)`
- **Render model**: Visitor pattern — shapes are data, renderer walks the scene graph. Core owns traversal + transform/style composition. Renderer just draws.
- **Scene model**: Retained scene graph. Animation loop via requestAnimationFrame, idle when no animations active.
- **Shape taxonomy**: Shallow hierarchy — abstract `Shape` base class, thin concrete classes, `Group` for composites, `PathShape` for native bezier curves
- **API style**: Hybrid — functional factories (`circle()`, `rect()`) as primary API, with `createScene`/`renderScene` convenience wrappers. BoundScene returns destructurable `add`, `play`, `wait`, `controls`, `interact`, `render`, `grid`, `scene`.
- **Extensibility**: `ShapeType` is open (`string`). Renderer has `drawShape()` fallback for unknown types. Third-party shapes just extend `Shape`.

## What's Built

### Core (`packages/core`)

**Math module** (`src/math/`):
- `Vec2` — readonly tuple `[number, number]` with pure functions (add, sub, scale, dot, length, normalize, distance, rotate, lerp, angle)
- `Vec3` — similar, for color math and future 3D
- `Mat3` — 3x3 affine transform as `Float64Array(9)`, column-major. Functions: identity, translation, rotation, scaling, multiply, transformPoint, invert, getScaleX/Y, getRotation, getTranslation, decompose, compose
- `BoundingBox` — min/max with helpers (center, width, height, top/bottom/left/right, fromPoints)
- `Color` — `{r, g, b, a}` (0-1). Helpers: rgba, fromHex, toHex, toCssRgba, lerpColor, colorToCss
- `Palette` — full Tailwind CSS color palette (22 color scales × 11 shades each). `ColorScale` objects double as `Color` (default shade 500) with `.alpha()` method. Standalone `white`, `black`.
- `Easing` — linear, easeIn/Out/InOut for quad, cubic, sine, plus smooth and smoother (Hermite)
- `Lerp` — lerp, clamp, remap
- Direction constants: `ORIGIN`, `UP`, `DOWN`, `LEFT`, `RIGHT`, `UP_LEFT`, `UP_RIGHT`, `DOWN_LEFT`, `DOWN_RIGHT`

**Style system** (`src/style/`):
- `Style` interface: fill, stroke, strokeWidth, opacity, lineCap, lineJoin, lineDash, lineDashOffset, fontSize, fontFamily, textAlign, textBaseline
- `mergeStyles(base, override)` — cascade (non-undefined fields win)
- `Theme` — background + defaultStyle. Built-in `DARK_THEME` (neutral-900 bg, white stroke) and `LIGHT_THEME` (white bg, neutral-900 stroke)

**Shapes** (`src/shapes/`):
- `Shape` (abstract base) — id, type, style, transform (Mat3), parent pointer, visible flag
  - Bounding box getters: `center`, `top`, `bottom`, `left`, `right`, `width`, `height` (world-space, via abstract `getBounds()`)
  - `getPathLength()` — approximate path length for draw-on animations (overridden per shape)
  - Positioning: `moveTo(target)`, `shift(delta)`, `nextTo(other, direction, buffer)`
  - Transforms: `translate(x, y)`, `rotate(angle)`, `scale(sx, sy)`, `setPosition(x, y)`
- `CircleShape` — localCenter, radius
- `RectShape` — localCenter, localWidth, localHeight, cornerRadius
- `LineShape` — start, end
- `PolygonShape` — points[], closed
- `ArcShape` — localCenter, radius, startAngle, endAngle
- `PathShape` — native bezier path commands (M, L, C, Z). Rendered with `ctx.bezierCurveTo()` for perfectly smooth curves. Builder API: `.M()`, `.L()`, `.C()`, `.Z()`.
- `TextShape` — content (mutable), position. Defaults: fill white, no stroke, monospace font. Uses `OffscreenCanvas` for accurate `getBounds()`
- `TexShape` — content (LaTeX string), position. Has `measuredBounds` field populated by renderer after rasterization
- `ArrowShape` (extends Group) — start, end, tipSize. Manages internal Line + triangle Polygon.
- `Group` — children array, add/remove/clear. `getBounds()` is union of transformed child bounds.
- `NumberLine` (extends Group) — range [min, max, step], ticks, labels (with `labelRotation` for y-axis upright text), arrow tips, `numberToPoint()`/`n2p()` for coordinate conversion
- `Axes` (extends Group) — two NumberLines (x horizontal, y rotated 90° with counter-rotated labels). `coordToPoint()`/`c2p()` and `pointToCoord()`/`p2c()` for coordinate conversion. Per-axis option overrides via `xAxis`/`yAxis`. Smart axis label positioning (`xLabel`/`yLabel`) adapts based on range. Auto-frames camera when added to scene (`autoFrame` default true). Origin-aligned: coordinate (0,0) maps to local-space (0,0).
- `FunctionGraph` (extends Group) — plots `y = f(x)` on an Axes. Samples function, handles discontinuities (NaN/Infinity/large jumps break into separate polyline segments, declared discontinuities with open/filled circle markers). `setFunction(fn)` for live updates.
- `BraceShape` (extends PathShape) — curly brace annotation using 4 bezier segments. Filled shape with proper thickness and pointed tip. Configurable `sharpness`.
- `AngleShape` (extends Group) — arc between two directions from a vertex with optional label.
- `grid()` factory — creates Group of lines for coordinate grid. Accepts camera for auto-sizing to viewport. Emphasized axis lines.
- Factory functions: `circle()`, `rect()`, `line()`, `polygon()`, `regularPolygon()`, `triangle()`, `arc()`, `text()`, `tex()`, `arrow()`, `numberLine()`, `axes()`, `functionGraph()`, `brace()`, `angleShape()`, `point()`, `dashedLine()`, `lineThrough()`, `tangentLine()`, `edgeLabel()`, `braceOver()`, `braceBetween()`, `group()`

**Animation system** (`src/animation/`):
- `Animation` interface — `begin()`, `update(t)`, `finish()` lifecycle with duration, easing, targets
- `makeAnimation()` helper — reduces boilerplate for animation factories
- Built-in animations:
  - `fadeIn(shape)` / `fadeOut(shape)` — opacity + visibility
  - `create(shape)` — stroke draw-on effect via lineDash/lineDashOffset trick
  - `animateShift(shape, delta)` / `animateMoveTo(shape, target)` — position
  - `animateScale(shape, factor)` / `animateRotate(shape, angle)` — transform (decompose → lerp → recompose)
  - `animateColor(shape, { fill?, stroke? })` / `animateOpacity(shape, target)` — style
  - `during(callback)` — per-frame callback, receives eased t. For dynamic text, coordinate labels, etc.
- Defaults: duration 1s, easing `smooth` (Hermite smoothstep)
- `play(...animations, opts?)` returns Promise. Multiple animations in one `play()` run simultaneously. Sequential via `await`.
- `wait(seconds)` returns Promise, keeps rendering active during the pause.
- Auto-add: if an animation's target shape has no parent, `play()` adds it to the scene automatically.

**Hit testing** (`src/hit-testing.ts`):
- `pointInBounds()` — AABB containment test
- `pointInCircle()` — inverse-transform to local space, distance check
- `pointInRect()` — inverse-transform to local space, AABB check
- `pointInShape()` — dispatches to shape-specific test, falls back to world-space AABB
- `hitTestAll()` — walks scene graph, returns all shapes under a point (draw order)
- `hitTest()` — returns topmost hit shape

**Scene** (`src/scene/`):
- `Camera` — worldWidth (14), worldHeight (8), pixelWidth, pixelHeight (all mutable). `getWorldToPixel()` / `getPixelToWorld()`. `visibleWidth` / `visibleHeight` for letterbox-aware bounds.
- `Scene` — root Group, camera, theme, background (accepts string or Color). Render traversal dispatches to typed renderer methods with `drawShape()` fallback for unknown types.

**Renderer interface** (`src/renderer/`):
- `Renderer` — beginFrame, endFrame, draw methods for each shape type (including drawPath for PathShape), enterGroup/exitGroup, drawShape (generic fallback)

### Canvas Renderer (`packages/renderer-canvas`)

- `CanvasRenderer` — implements full Renderer interface for Canvas2D
  - High-DPI support (devicePixelRatio scaling)
  - Per-shape draw methods with transform + style application
  - `drawPath` — renders PathShape commands natively with `ctx.bezierCurveTo()`
  - Opacity support for text and TeX (globalAlpha)
  - lineDashOffset support for draw-on animations
  - Text: Y-flip compensation, font sizing in world units
  - TeX: KaTeX → SVG foreignObject → cached offscreen canvas. Font inlining (base64 data URIs). Async rasterization with `onTexReady` callback for auto-re-render.
  - Groups: save/restore for opacity compositing
- `AnimationPlayer` — rAF-based loop. Starts on `play()`, stops when idle (zero overhead for static scenes). Each frame computes elapsed time, applies easing, calls `update(t)`, renders.
- `ControlsManager` — creates HTML controls that auto-render on change
  - Control types: `slider`, `checkbox`, `select`, `text`, `color`
  - Each returns `ControlHandle<T>` with `.value`, `.set()`, `.onChange()`, `.dispose()`, `.element`
  - `controls.panel()` — opt-in overlay panel on canvas with collapse/expand toggle
  - `controls.onUpdate(fn)` — global callback on any control change
  - Themed dark/light, CSS injected via `<style>` tag
- `InteractionManager` — mouse event handling on canvas
  - `interact.draggable(shape, { onDrag, constrainX?, constrainY? })` — drag with offset tracking
  - `interact.hoverable(shape, { onEnter, onLeave })` — hover effects
  - `interact.clickable(shape, { onClick })` — click handlers
  - Hit testing pierces through non-interactive shapes to find interactive ones underneath
  - Automatic cursor management (grab/grabbing/pointer)
  - Each method returns an unsubscribe function
  - Auto-renders after any state change
- `createScene(canvas, opts)` — returns `BoundScene` with destructurable `add`, `remove`, `render`, `grid`, `play`, `wait`, `controls`, `interact`, `scene`
  - `add()` returns the shape (single arg) or typed tuple (2-5 args) for inline usage
  - Auto-detects `Axes` shapes and frames the camera to fit
- `renderScene(canvas, opts, callback)` — one-shot convenience

### Playground (`packages/playground`)

- Monaco editor with TypeScript syntax highlighting (semantic validation disabled)
- Example gallery: Blank Canvas, Shapes, Animations, Text + Animation, Interactive, Draggable, Function Plot, Calculus, First Quadrant, Annotations, Number Lines, TeX Formulas, Logo
- Live code execution via `new Function()` with all vimath exports injected
- Supports async examples via `AsyncFunction` constructor (detected by presence of `await`)
- Two coding patterns: `export default function({ add, grid })` (auto-wrapped) or direct `createScene(canvas, ...)` (supports async)
- Dark/Light theme toggle (switches Monaco theme + vimath scene theme)
- Controls panel cleanup on re-run (unwraps canvas from vimath-container)
- Error display panel
- Cmd/Ctrl+Enter to run

### Tests

- 28 tests covering: vec2 operations, mat3 transforms (identity, translation, scaling, rotation, multiply, invert), color parsing/conversion/interpolation, lerp/clamp/remap, palette (default shade, alpha, shade+alpha, Color compatibility), shape creation/identity/grouping/chaining

### Build & Tooling

- pnpm workspaces, Vite (build + dev server), Vitest, TypeScript 5.7 (strict, composite projects)
- Playground: Vite aliases resolve `@vimath/*` to source files for HMR
- ESM throughout, no `.js` extensions in imports (bundler module resolution)

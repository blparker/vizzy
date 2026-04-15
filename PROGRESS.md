# Vimath3 Progress

## Architecture

- **Monorepo**: pnpm workspace with `@vimath/core`, `@vimath/renderer-canvas`, `@vimath/playground`
- **Coordinate system**: 14x8 world units (configurable), origin center, Y-up. Height is fixed, width adapts to canvas aspect ratio via `min(scaleX, scaleY)`
- **Render model**: Visitor pattern — shapes are data, renderer walks the scene graph. Core owns traversal + transform/style composition. Renderer just draws.
- **Scene model**: Retained scene graph with dirty tracking hooks for future animation
- **Shape taxonomy**: Shallow hierarchy — abstract `Shape` base class, thin concrete classes, `Group` for composites
- **API style**: Hybrid — functional factories (`circle()`, `rect()`) as primary API, with `createScene`/`renderScene` convenience wrappers
- **Extensibility**: `ShapeType` is open (`string`). Renderer has `drawShape()` fallback for unknown types. Third-party shapes just extend `Shape`.

## What's Built

### Core (`packages/core`)

**Math module** (`src/math/`):
- `Vec2` — readonly tuple `[number, number]` with pure functions (add, sub, scale, dot, length, normalize, distance, rotate, lerp, angle)
- `Vec3` — similar, for color math and future 3D
- `Mat3` — 3x3 affine transform as `Float64Array(9)`, column-major. Functions: identity, translation, rotation, scaling, multiply, transformPoint, invert, getScaleX/Y, getTranslation
- `BoundingBox` — min/max with helpers (center, width, height, top/bottom/left/right, fromPoints)
- `Color` — `{r, g, b, a}` (0-1). Helpers: rgba, fromHex, toHex, toCssRgba, lerpColor, colorToCss
- `Palette` — full Tailwind CSS color palette (22 color scales × 11 shades each). `ColorScale` objects double as `Color` (default shade 500) with `.alpha()` method. Standalone `white`, `black`.
- `Easing` — linear, easeIn/Out/InOut for quad, cubic, sine, plus smooth and smoother (Hermite)
- `Lerp` — lerp, clamp, remap
- Direction constants: `ORIGIN`, `UP`, `DOWN`, `LEFT`, `RIGHT`, `UP_LEFT`, `UP_RIGHT`, `DOWN_LEFT`, `DOWN_RIGHT`

**Style system** (`src/style/`):
- `Style` interface: fill, stroke, strokeWidth, opacity, lineCap, lineJoin, lineDash, fontSize, fontFamily, textAlign, textBaseline
- `mergeStyles(base, override)` — cascade (non-undefined fields win)
- `Theme` — background + defaultStyle. Built-in `DARK_THEME` (neutral-900 bg, white stroke) and `LIGHT_THEME` (white bg, neutral-900 stroke)

**Shapes** (`src/shapes/`):
- `Shape` (abstract base) — id, type, style, transform (Mat3), parent pointer, visible flag
  - Bounding box getters: `center`, `top`, `bottom`, `left`, `right`, `width`, `height` (world-space, via abstract `getBounds()`)
  - Positioning: `moveTo(target)`, `shift(delta)`, `nextTo(other, direction, buffer)`
  - Transforms: `translate(x, y)`, `rotate(angle)`, `scale(sx, sy)`, `setPosition(x, y)`
- `CircleShape` — localCenter, radius
- `RectShape` — localCenter, localWidth, localHeight, cornerRadius
- `LineShape` — start, end
- `PolygonShape` — points[], closed
- `ArcShape` — localCenter, radius, startAngle, endAngle
- `TextShape` — content, position. Defaults: fill white, no stroke, monospace font. Uses `OffscreenCanvas` for accurate `getBounds()`
- `TexShape` — content (LaTeX string), position. Has `measuredBounds` field populated by renderer after rasterization
- `ArrowShape` (extends Group) — start, end, tipSize. Manages internal Line + triangle Polygon. Tip offset past last tick when used with NumberLine.
- `Group` — children array, add/remove/clear. `getBounds()` is union of transformed child bounds.
- `NumberLine` (extends Group) — range [min, max, step], ticks, labels, arrow tips, `numberToPoint()`/`n2p()` for coordinate conversion
- `grid()` factory — creates Group of lines for coordinate grid. Accepts camera for auto-sizing to viewport. Emphasized axis lines.
- Factory functions: `circle()`, `rect()`, `line()`, `polygon()`, `regularPolygon()`, `triangle()`, `arc()`, `text()`, `tex()`, `arrow()`, `numberLine()`, `group()`

**Scene** (`src/scene/`):
- `Camera` — worldWidth (14), worldHeight (8), pixelWidth, pixelHeight. `getWorldToPixel()` / `getPixelToWorld()`. `visibleWidth` / `visibleHeight` for letterbox-aware bounds.
- `Scene` — root Group, camera, theme, background (accepts string or Color). Render traversal dispatches to typed renderer methods with `drawShape()` fallback for unknown types.

**Renderer interface** (`src/renderer/`):
- `Renderer` — beginFrame, endFrame, draw methods for each shape type, enterGroup/exitGroup, drawShape (generic fallback)

### Canvas Renderer (`packages/renderer-canvas`)

- `CanvasRenderer` — implements full Renderer interface for Canvas2D
  - High-DPI support (devicePixelRatio scaling)
  - Per-shape draw methods with transform + style application
  - Text: Y-flip compensation, font sizing in world units
  - TeX: KaTeX → SVG foreignObject → cached offscreen canvas. Font inlining (base64 data URIs). Async rasterization with `onTexReady` callback for auto-re-render.
  - Groups: save/restore for opacity compositing
- `createScene(canvas, opts)` — returns `BoundScene` with destructurable `add`, `remove`, `render`, `grid` methods
- `renderScene(canvas, opts, callback)` — one-shot convenience

### Playground (`packages/playground`)

- Monaco editor with TypeScript syntax highlighting (semantic validation disabled)
- Example gallery: Blank Canvas, Shapes, Number Lines, TeX Formulas, Logo
- Live code execution via `new Function()` with all vimath exports injected
- Two coding patterns: `export default function({ add, grid })` (auto-wrapped) or direct `renderScene(canvas, ...)`
- Dark/Light theme toggle (switches Monaco theme + vimath scene theme)
- Error display panel
- Cmd/Ctrl+Enter to run

### Tests

- 28 tests covering: vec2 operations, mat3 transforms (identity, translation, scaling, rotation, multiply, invert), color parsing/conversion/interpolation, lerp/clamp/remap, palette (default shade, alpha, shade+alpha, Color compatibility), shape creation/identity/grouping/chaining

### Build & Tooling

- pnpm workspaces, Vite (build + dev server), Vitest, TypeScript 5.7 (strict, composite projects)
- Playground: Vite aliases resolve `@vimath/*` to source files for HMR
- ESM throughout, `.js` extensions in imports

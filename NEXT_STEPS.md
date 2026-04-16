# Vimath3 Next Steps

## High Priority

### API Ergonomics Improvements
- **Z-ordering**: add `moveToFront(shape)` / `moveToBack(shape)` on BoundScene, or `zIndex` on Shape
- **`ax.plot(fn, opts?)`**: convenience method on Axes that creates + adds a FunctionGraph (like manim)
- **Simpler point creation**: `point(position, opts?)` overload or `ax.point([x, y], opts?)`
- **`label(shape, content, direction?)`**: auto-positioned text label near a shape, using `nextTo` logic
- **Mutable line endpoints**: encourage updating `line.start`/`line.end` + re-render instead of remove/add dance

### Low-Hanging Fruit Shapes
Trivial factory wrappers (no new classes needed):
- `square(size, opts?)` — rect with equal width/height
- `ellipse(rx, ry, opts?)` — scaled circle
- `doubleArrow(start, end, opts?)` — arrow with tips on both ends
- `rightAngle(vertex, p1, p2, opts?)` — small square instead of arc
- `star(points, outerRadius, innerRadius, opts?)` — star polygon
- `vector(direction, opts?)` — arrow from origin
- `curvedArrow(start, end, opts?)` — arc with arrowhead

Small new shapes:
- `ParametricCurve` — plot `(x(t), y(t))` on Axes
- `Sector` — filled arc wedge
- `Annulus` — ring/donut shape
- `ArcBetweenPoints` — arc connecting two arbitrary points
- `SurroundingRectangle` — auto-sized rect that surrounds a shape with padding
- `Cross` — X mark through a shape
- `Underline` — line under a shape
- `NumberPlane` — combined grid + axes (merge our `grid()` and `axes()`)
- `BarChart` — bars on axes

### Showcase Examples
- More calculus: area under curve (Riemann sums), derivative visualization
- Parametric curves gallery (spirals, Lissajous, cardioid)
- Interactive function explorer (drag coefficients, see curve change)

### Shape Morphing / Transform Animation
- Manim's `Transform(square, circle)` that morphs one shape into another
- Requires `toPath()` bezier representation for each shape
- `PathShape` already exists — shapes need `toPath()` methods returning PathCommands
- Every shape returns cubic bezier segments, morph lerps control points
- This is the single biggest animation feature missing

## Medium Priority

### Distribution / Community (shadcn-style Shape Registry)
- CLI tool: `npx vimath add spiral` copies shape source into your project
- Shapes are standalone `.ts` files extending `Shape`/`PathShape` — easy to fork and modify
- Community registry where developers publish shapes
- Similar model to shadcn/ui: you own the code, not a dependency
- Requires: npm publishing pipeline, shape template standard, registry infrastructure
- Track in separate design doc when ready to implement

### TeX Rendering Performance
- Current: KaTeX → SVG foreignObject → font inlining → rasterize to canvas (~500ms first render)
- Better: walk KaTeX's parsed AST, draw glyphs directly with `ctx.fillText()`
- Would make TeX synchronous (~1ms), enabling per-frame content updates during animation
- Reference: canvas-latex (github.com/CurriculumAssociates/canvas-latex)

### Camera Pan/Zoom
- Mouse wheel to zoom (scale worldWidth/worldHeight)
- Middle-click drag or Ctrl+drag to pan (shift camera.center)
- Smooth animated transitions

### Additional Renderers
- `@vimath/renderer-svg` — SVG output for static exports
- `@vimath/renderer-webgl` — WebGL for large scenes / performance
- `@vimath/renderer-rough` — rough.js for hand-drawn aesthetic
- The Renderer interface is already defined, each just implements the visitor methods

### Export / Recording
- Export scene as PNG (canvas.toDataURL)
- Export as SVG (via SVG renderer)
- Record animations as video (canvas.captureStream → MediaRecorder)
- Export to GIF

### Medium-Effort Shapes
- `Table` / `MathTable` — grid of text cells for matrix/table display
- `ArrowVectorField` / `StreamLines` — vector field visualizations
- `LabeledLine` / `LabeledArrow` — lines with attached text labels

## Lower Priority

### Developer Experience
- TypeScript type declarations for Monaco (playground autocomplete for vimath API)
- Store playground examples as real `.ts` files, import with Vite's `?raw` suffix
- Better error messages when shapes are misconfigured
- Documentation site with interactive examples
- npm publishing pipeline

### Math Utilities
- Complex number type
- Parametric curve evaluation
- Numerical integration
- Bezier curve utilities (subdivision, arc-length parameterization, nearest point)

### Scene Features
- Scene-level `prepare()` method that pre-rasterizes all TeX before first render
- Layer system (foreground, background, UI overlay)
- Clipping / masking support
- Gradient fills

### Interactivity Enhancements
- Touch event support (mobile)
- Keyboard event handling
- Infinite/looping animations
- Group-level interaction (make a whole group draggable/clickable)
- Shadow DOM for controls CSS isolation (if style conflicts arise)

## Design Decisions to Revisit

- **Text bounds**: `TextShape` uses `OffscreenCanvas.measureText()` which works well. `TexShape` uses rough estimates until post-render measurement. Consider a `prepare()` step.
- **Shape property naming**: `CircleShape.localCenter` vs manim's `center`. The `local` prefix avoids collision with the base class `center` getter. Could revisit if confusing for users.
- **Grid auto-sizing**: Grid accepts camera for viewport-aware sizing. Could be more automatic (scene-level grid that always fills).
- **Canvas DPR handling**: Currently reads `canvas.width`/`canvas.height` HTML attributes as display size. Works but fragile if users set canvas size via CSS instead of attributes.
- **TeX dynamic content**: Currently TeX is static (async rasterization pipeline). Regular `TextShape` works for dynamic labels. Revisit when canvas-direct TeX rendering is implemented.
- **Brace shape**: Uses PathShape with 4 bezier segments. Has a slight pinch where outer contour halves meet at center. Could be refined.
- **Playground examples as strings**: Works but no IDE support inside template literals. Consider `?raw` imports for real `.ts` files.

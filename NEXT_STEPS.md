# Vimath3 Next Steps

## High Priority

### More Shapes
- `ParametricCurve` — plot `(x(t), y(t))` parametric curves on Axes
- `VectorField` — grid of arrows showing vector field `(dx, dy) = f(x, y)`
- `Angle` — arc showing angle between two lines with optional label
- `Sector` — filled arc/pie slice
- `Annulus` — ring shape (donut)
- `CurveLabel` — text that follows along a curve
- `Table` — grid of text cells for matrix/table display

### Shape Morphing / Transform Animation
- Manim's `Transform(square, circle)` that morphs one shape into another
- Requires `toPath()` bezier representation for each shape
- Every shape returns cubic bezier segments, morph lerps control points
- Also enables generic rendering fallback for custom shapes
- This is the single biggest animation feature missing

### Path Representation (`toPath()`)
- Prerequisite for shape morphing
- `CircleShape.toPath()` → 4 cubic bezier arcs
- `RectShape.toPath()` → 4 line segments (with optional corner arcs)
- `PolygonShape.toPath()` → line segments between points
- `ArcShape.toPath()` → cubic bezier arc approximation
- `FunctionGraph` already produces point arrays — convert to smoothed bezier

## Medium Priority

### TeX Rendering Performance
- Current: KaTeX → SVG foreignObject → font inlining → rasterize to canvas (~500ms first render)
- Better: walk KaTeX's parsed AST, draw glyphs directly with `ctx.fillText()`
- Would make TeX synchronous (~1ms), enabling per-frame content updates during animation
- Reference: canvas-latex (github.com/CurriculumAssociates/canvas-latex)
- Not blocking anything now but needed for animated equations

### Camera Pan/Zoom
- Mouse wheel to zoom (scale worldWidth/worldHeight)
- Middle-click drag or Ctrl+drag to pan (shift camera.center)
- Smooth animated transitions
- Useful for dense or large scenes

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

# Vimath3 Next Steps

## High Priority

### Showcase Examples
- Secant-to-tangent animation (P→Q limit visualization) — all primitives exist, needs an example combining axes, lineThrough, during, animateMoveTo, point
- More calculus examples: area under curve (Riemann sums), derivative visualization

### More Shapes
- `ParametricCurve` — plot `(x(t), y(t))` parametric curves on Axes
- `VectorField` — grid of arrows showing vector field `(dx, dy) = f(x, y)`
- `Sector` — filled arc/pie slice
- `Annulus` — ring shape (donut)
- `CurveLabel` — text that follows along a curve
- `Table` — grid of text cells for matrix/table display

### Shape Morphing / Transform Animation
- Manim's `Transform(square, circle)` that morphs one shape into another
- Requires `toPath()` bezier representation for each shape
- `PathShape` already exists — shapes need `toPath()` methods that return PathCommands
- Every shape returns cubic bezier segments, morph lerps control points
- This is the single biggest animation feature missing

### Annotation Improvements
- Edge labels for line segments (annotate triangle sides, etc.)
- Brace tip pinch refinement (outer contour meets slightly at center)
- Label collision avoidance (auto-offset when labels overlap)

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
- **Brace shape**: Uses PathShape with 4 bezier segments. Looks good but has a slight pinch where outer contour halves meet at center. Could be refined with a 5th segment bridging the top.
- **Playground examples as strings**: Works but no IDE support inside template literals. Consider `?raw` imports for real `.ts` files.

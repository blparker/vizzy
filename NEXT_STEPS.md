# Vimath3 Next Steps

## High Priority

### Animation System
The architecture is ready (retained scene graph, shape identity, easing functions). Needs:
- `Timeline` / animation loop with requestAnimationFrame
- Tween system: animate any shape property over time (position, radius, opacity, color, etc.)
- `scene.play()` or similar API to queue and run animations
- Easing functions are already built in `math/easing.ts`
- Consider manim's animation API: `scene.play(FadeIn(circle), Transform(square, triangle))`

### Interactivity
- Hit testing: point-in-shape detection for mouse events
- Event system on shapes: onClick, onHover, onDrag
- Draggable shapes / input controls (sliders, draggable points)
- Camera pan/zoom via mouse

### Path Representation (`toPath()`)
- Every shape should eventually have `toPath()` returning cubic bezier segments
- Enables shape morphing (lerp control points between any two shapes)
- Enables generic rendering fallback for custom shapes
- Not blocking other work, but should be added incrementally as shapes are refined

## Medium Priority

### More Composite Shapes
- `Axes` — x/y number lines with labels, building on `NumberLine`
- `FunctionGraph` — plot y = f(x) as a polyline/bezier path
- `ParametricCurve` — plot parametric curves
- `Brace` / `BraceBetweenPoints` — curly brace annotations
- `DashedLine` — line with dash pattern (already supported via style.lineDash, but a convenience shape)
- `Dot` — small filled circle (convenience)
- `Angle` — arc showing angle between two lines

### TeX Rendering Performance
- Current approach: KaTeX → SVG foreignObject → rasterize to canvas (async, ~500ms first render)
- Investigate canvas-latex approach: walk KaTeX's internal tree, draw directly with `ctx.fillText()`
- Would eliminate SVG round-trip and font inlining complexity
- Reference: https://github.com/CurriculumAssociates/canvas-latex

### Additional Renderers
- `@vimath/renderer-svg` — SVG output for static exports
- `@vimath/renderer-webgl` — WebGL for large scenes / performance
- `@vimath/renderer-rough` — rough.js for hand-drawn aesthetic
- The Renderer interface is already defined, each just implements the visitor methods

### Export / Recording
- Export scene as PNG/SVG
- Record animations as video (canvas.captureStream → MediaRecorder)
- Export to GIF

## Lower Priority

### Developer Experience
- TypeScript type declarations for the playground editor (so Monaco autocomplete works with vimath API)
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

## Design Decisions to Revisit

- **Text bounds**: `TextShape` uses `OffscreenCanvas.measureText()` which works well. `TexShape` uses rough estimates until post-render measurement. Consider a `prepare()` step.
- **Shape property naming**: `CircleShape.localCenter` vs manim's `center`. The `local` prefix avoids collision with the base class `center` getter. Could revisit if confusing for users.
- **Grid auto-sizing**: Grid accepts camera for viewport-aware sizing. Could be more automatic (scene-level grid that always fills).
- **Canvas DPR handling**: Currently reads `canvas.width`/`canvas.height` HTML attributes as display size. Works but fragile if users set canvas size via CSS instead of attributes.

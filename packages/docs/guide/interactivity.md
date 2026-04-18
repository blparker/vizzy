<script setup>
const sliderExample = `controls.panel();
grid();

const radius = controls.slider('Radius', { min: 0.2, max: 3, value: 1, step: 0.1 });
const c = circle({ color: sky });
add(c);

controls.onUpdate(() => {
    c.radius = radius.value;
});`

const multipleControls = `controls.panel();

const showGrid = controls.checkbox('Show Grid', { value: true });
const fillColor = controls.color('Fill', { value: '#0ea5e9' });
const sides = controls.slider('Sides', { min: 3, max: 12, value: 6, step: 1 });

let g = grid();
const p = regularPolygon({ sides: sides.value, radius: 1.5, style: { fill: fillColor.value } });
add(p);

controls.onUpdate(() => {
    p.points = regularPolygonPoints([0, 0], 1.5, sides.value);
    p.setStyle({ fill: fillColor.value });
    g.visible = showGrid.value;
});`

const draggableExample = `grid();

const dot = circle({ radius: 0.2, style: { fill: sky, stroke: null } });
const lbl = text({
    content: '(0.0, 0.0)',
    position: [0, 0.5],
    style: { fill: white, fontSize: 0.25 },
});
add(dot, lbl);

interact.draggable(dot, {
    onDrag(pos) {
        dot.moveTo(pos);
        lbl.position = [pos[0], pos[1] + 0.5];
        lbl.content = '(' + pos[0].toFixed(1) + ', ' + pos[1].toFixed(1) + ')';
    },
});`

const hoverClickExample = `grid();

const r = rect({ width: 2, height: 1.5, color: emerald }).shift(-3, 0);
add(r);

interact.hoverable(r, {
    onEnter() { r.setStyle({ fill: emerald[900] }); },
    onLeave() { r.setStyle({ fill: null }); },
});

let filled = false;
const btn = circle({ radius: 0.8, color: violet }).shift(3, 0);
const btnLabel = text({
    content: 'click me',
    position: [3, 0],
    style: { fill: white, fontSize: 0.2 },
});
add(btn, btnLabel);

interact.clickable(btn, {
    onClick() {
        filled = !filled;
        btn.setStyle({ fill: filled ? violet[800] : null });
        btnLabel.content = filled ? 'clicked!' : 'click me';
    },
});`

const constrainedDrag = `grid();

const track = line([-4, 0], [4, 0], { color: neutral[600] });
const dot = circle({ radius: 0.15, style: { fill: orange, stroke: null } });
const lbl = text({
    content: '0.0',
    position: [0, 0.5],
    style: { fill: white, fontSize: 0.25 },
});
add(track, dot, lbl);

interact.draggable(dot, {
    onDrag(pos) {
        dot.setPosition(pos[0], 0);
        lbl.position = [pos[0], 0.5];
        lbl.content = pos[0].toFixed(1);
    },
    constrainX: [-4, 4],
    constrainY: [0, 0],
});`
</script>

# Interactivity

Vizzy provides two systems for making scenes interactive: **controls** (HTML widgets that overlay the canvas) and **interaction** (mouse events directly on shapes).

## Controls

Controls are HTML inputs — sliders, checkboxes, color pickers — that float over the canvas in a collapsible panel. When a control changes, the scene re-renders automatically.

### The Pattern

1. Call `controls.panel()` to create the overlay panel
2. Create controls — each returns a handle with a `.value` property
3. Use `controls.onUpdate()` to react when any control changes

<ClientOnly>
  <VizzyExample :code="sliderExample" />
</ClientOnly>

### Combining Controls

Mix different control types in one panel. They all trigger the same `onUpdate` callback:

<ClientOnly>
  <VizzyExample :code="multipleControls" />
</ClientOnly>

### Available Controls

| Control | Signature | Returns |
|---------|-----------|---------|
| Slider | `controls.slider(label, { min, max, value, step })` | `ControlHandle<number>` |
| Checkbox | `controls.checkbox(label, { value })` | `ControlHandle<boolean>` |
| Color | `controls.color(label, { value })` | `ControlHandle<string>` |
| Select | `controls.select(label, { options, value })` | `ControlHandle<string>` |
| Text | `controls.text(label, { value, placeholder })` | `ControlHandle<string>` |

Each handle has `.value` (current value), `.set(v)` (update programmatically), and `.onChange(fn)` (per-control callback).

## Mouse Interaction

The `interact` API lets you make shapes draggable, hoverable, and clickable. Hit testing works through the scene graph — clicking on text above a shape correctly targets the shape underneath if only the shape is interactive.

### Draggable

`interact.draggable(shape, opts)` makes a shape follow the mouse. The `onDrag` callback receives the world-space position:

<ClientOnly>
  <VizzyExample :code="draggableExample" />
</ClientOnly>

::: tip
The cursor automatically changes to `grab`/`grabbing` for draggable shapes, `pointer` for hoverable/clickable shapes.
:::

### Hover and Click

- **`interact.hoverable(shape, { onEnter, onLeave })`** — mouse enter/leave
- **`interact.clickable(shape, { onClick })`** — click handler

<ClientOnly>
  <VizzyExample :code="hoverClickExample" />
</ClientOnly>

### Constrained Dragging

Restrict drag movement to a range with `constrainX` and `constrainY`. This is useful for building slider-like interactions:

<ClientOnly>
  <VizzyExample :code="constrainedDrag" />
</ClientOnly>

::: tip Cleanup
Each interaction method returns an unsubscribe function: `const unsub = interact.draggable(shape, opts)`. Call `unsub()` to remove the interaction.
:::

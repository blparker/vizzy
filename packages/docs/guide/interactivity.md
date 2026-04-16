<script setup>
const sliderExample = `export default function({ add, controls, grid, render }) {
    controls.panel();
    grid();

    const radius = controls.slider('Radius', { min: 0.2, max: 3, value: 1, step: 0.1 });
    const c = circle({ color: sky });
    add(c);
    render();

    controls.onUpdate(() => {
        c.radius = radius.value;
    });
}`

const multipleControls = `export default function({ add, controls, grid, render }) {
    controls.panel();

    const showGrid = controls.checkbox('Show Grid', { value: true });
    const fillColor = controls.color('Fill', { value: '#0ea5e9' });
    const sides = controls.slider('Sides', { min: 3, max: 12, value: 6, step: 1 });

    let g = grid();
    const p = regularPolygon({ sides: sides.value, radius: 1.5, style: { fill: fillColor.value } });
    add(p);
    render();

    controls.onUpdate(() => {
        p.points = regularPolygonPoints([0, 0], 1.5, sides.value);
        p.setStyle({ fill: fillColor.value });
        g.visible = showGrid.value;
    });
}`

const draggableExample = `export default function({ add, interact, grid, render }) {
    grid();

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
    });

    render();
}`

const hoverClickExample = `export default function({ add, interact, grid, render }) {
    grid();

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
    });

    render();
}`

const constrainedDrag = `export default function({ add, interact, grid, render }) {
    grid();

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
    });

    render();
}`
</script>

# Interactivity

Vizzy provides two systems for interactivity: **controls** (HTML widgets like sliders and checkboxes) and **interaction** (mouse events on shapes like drag, hover, and click).

## Controls

### Sliders

`controls.slider()` creates a range input. Call `controls.panel()` first to create the overlay panel, and `controls.onUpdate()` to react to changes:

<ClientOnly>
  <VizzyExample :code="sliderExample" />
</ClientOnly>

### Multiple Controls

Combine sliders, checkboxes, color pickers, and selects. They all auto-render the scene when changed:

<ClientOnly>
  <VizzyExample :code="multipleControls" />
</ClientOnly>

Available control types:
- `controls.slider(label, { min, max, value, step })`
- `controls.checkbox(label, { value })`
- `controls.color(label, { value })`
- `controls.select(label, { options, value })`
- `controls.text(label, { value, placeholder })`

Each returns a handle with `.value` and `.set(value)`.

## Drag, Hover, and Click

### Draggable Shapes

`interact.draggable(shape, { onDrag })` makes a shape draggable. The callback receives the world-space position:

<ClientOnly>
  <VizzyExample :code="draggableExample" />
</ClientOnly>

### Hover and Click

`interact.hoverable()` fires callbacks on mouse enter/leave. `interact.clickable()` fires on click. Hit testing automatically pierces through non-interactive shapes:

<ClientOnly>
  <VizzyExample :code="hoverClickExample" />
</ClientOnly>

### Constrained Dragging

Use `constrainX` and `constrainY` to restrict drag movement to a range:

<ClientOnly>
  <VizzyExample :code="constrainedDrag" />
</ClientOnly>

import type { Example } from '../types';

export const draggable: Example = {
    name: 'Draggable',
    source: `export default function({ add, interact, grid, render }) {
    grid();

    // Draggable dot with coordinate label
    const dot = circle({ radius: 0.2, style: { fill: sky, stroke: null } });
    const label = text({
        content: '(0.0, 0.0)',
        position: [0, 0.5],
        style: { fill: white, fontSize: 0.25 },
    });
    add(dot, label);

    interact.draggable(dot, {
        onDrag(pos) {
            dot.moveTo(pos);
            label.position = [pos[0], pos[1] + 0.5];
            label.content = '(' + pos[0].toFixed(1) + ', ' + pos[1].toFixed(1) + ')';
        },
    });

    // Hoverable rectangle
    const r = rect({
        width: 2, height: 1.5,
        style: { stroke: emerald, fill: null },
    }).shift(-4, -2);
    add(r);

    interact.hoverable(r, {
        onEnter() { r.style = { ...r.style, fill: emerald[900] }; },
        onLeave() { r.style = { ...r.style, fill: null }; },
    });

    // Clickable circle that toggles fill
    let filled = false;
    const btn = circle({
        radius: 0.6,
        style: { stroke: violet, fill: null },
    }).shift(4, -2);
    const btnLabel = text({
        content: 'click me',
        position: [4, -2],
        style: { fill: white, fontSize: 0.18 },
    });
    add(btn, btnLabel);

    interact.clickable(btn, {
        onClick() {
            filled = !filled;
            btn.style = { ...btn.style, fill: filled ? violet[800] : null };
            btnLabel.content = filled ? 'filled!' : 'click me';
        },
    });

    // Constrained horizontal drag
    const slider = circle({
        radius: 0.15,
        style: { fill: orange, stroke: null },
    }).shift(0, -2);
    const track = line({
        start: [-3, -2], end: [3, -2],
        style: { stroke: neutral[600], strokeWidth: 0.02 },
    });
    const sliderLabel = text({
        content: '0.0',
        position: [0, -1.5],
        style: { fill: white, fontSize: 0.2 },
    });
    add(track, slider, sliderLabel);

    interact.draggable(slider, {
        onDrag(pos) {
            slider.setPosition(pos[0], -2);
            sliderLabel.position = [pos[0], -1.5];
            sliderLabel.content = pos[0].toFixed(1);
        },
        constrainX: [-3, 3],
        constrainY: [-2, -2],
    });

    render();
}
`,
};

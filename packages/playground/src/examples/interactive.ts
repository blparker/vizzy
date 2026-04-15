import type { Example } from '../types';

export const interactive: Example = {
    name: 'Interactive',
    source: `export default function({ add, controls, grid, render }) {
    controls.panel();

    const radius = controls.slider('Radius', { min: 0.1, max: 3, value: 1, step: 0.1 });
    const showGrid = controls.checkbox('Show Grid', { value: true });
    const fillColor = controls.color('Fill', { value: '#0ea5e9' });
    const strokeColor = controls.select('Stroke', {
        options: ['white', 'red', 'green', 'blue', 'yellow'],
        value: 'white',
    });
    const sides = controls.slider('Sides', { min: 3, max: 12, value: 0, step: 1 });

    let g = grid();

    const c = circle({ radius: radius.value, style: { fill: fillColor.value, stroke: strokeColor.value } });
    const p = regularPolygon({ sides: sides.value || 6, radius: 2, style: { stroke: emerald } }).shift(-3.5, 0);
    add(c, p);
    render();

    controls.onUpdate(() => {
        // Update circle
        c.radius = radius.value;
        c.style = { ...c.style, fill: fillColor.value, stroke: strokeColor.value };

        // Update polygon sides
        const s = sides.value || 6;
        p.points = regularPolygonPoints([-3.5, 0], 2, s);

        // Toggle grid
        g.visible = showGrid.value;
    });
}
`,
};

import type { Example } from '../types';

export const moreShapes: Example = {
    name: 'More Shapes',
    source: `export default function({ add, grid, render }) {
    grid();

    // --- Row 1: Basic shapes ---

    const sq = add(square({ size: 1.2, style: { stroke: sky } }).shift(-5, 2.5));
    add(label(sq, 'square', DOWN));

    const el = add(ellipse({ rx: 1, ry: 0.6, style: { stroke: emerald } }).shift(-2.5, 2.5));
    add(label(el, 'ellipse', DOWN));

    const st = add(star({ points: 5, outerRadius: 0.8, innerRadius: 0.35, style: { stroke: yellow, fill: yellow[900] } }).shift(0, 2.5));
    add(label(st, 'star', DOWN));

    // Surrounding rectangle
    const inner = add(circle({ radius: 0.5, style: { stroke: violet } }).shift(2.5, 2.5));
    const sr = add(surroundingRectangle({ shape: inner, style: { stroke: orange } }));
    add(label(sr, 'surround', DOWN));

    // Right angle
    const v = [5.5, 2];
    const rp1 = [6.5, 2];
    const rp2 = [5.5, 3];
    add(line({ start: v, end: rp1, style: { stroke: neutral[400] } }));
    add(line({ start: v, end: rp2, style: { stroke: neutral[400] } }));
    const ra = add(rightAngle({ vertex: v, point1: rp1, point2: rp2, style: { stroke: sky } }));
    // add(text({ content: 'right angle', position: [5.5, 1.3], style: { fill: white, fontSize: 0.18 } }));
    add(label(ra, 'right angle', DOWN));

    // --- Row 2: Arrows and curves ---

    add(vector({ direction: [1.5, 0.8], style: { stroke: red, fill: red } }).shift(-5.5, -0.3));
    add(text({ content: 'vector', position: [-5, -1.2], style: { fill: white, fontSize: 0.18 } }));

    add(doubleArrow({ start: [-3, 0], end: [-0.5, 0], style: { stroke: emerald, fill: emerald } }));
    add(text({ content: 'double arrow', position: [-1.75, -0.7], style: { fill: white, fontSize: 0.18 } }));

    add(curvedArrow({ start: [1, 0.5], end: [3.5, 0.5], angle: Math.PI / 4, style: { stroke: violet } }));
    add(text({ content: 'curved arrow', position: [2.25, -0.7], style: { fill: white, fontSize: 0.18 } }));

    // Line label
    const lStart = [4.5, 0.3];
    const lEnd = [6.5, -0.5];
    add(line({ start: lStart, end: lEnd, style: { stroke: sky } }));
    add(point({ position: lStart, color: sky }));
    add(point({ position: lEnd, color: sky }));
    add(lineLabel({ start: lStart, end: lEnd, content: 'd = 2.7', offset: 0.3, style: { fill: sky, fontSize: 0.18 } }));

    // --- Row 3: ax.plot convenience ---

    const ax = axes({
        xRange: [-3, 3, 1],
        yRange: [-1.5, 1.5, 1],
        xLength: 5,
        yLength: 2.5,
        includeNumbers: true,
        color: neutral[500],
        autoFrame: false,
    });
    ax.shift(0, -2.8);
    add(ax);

    add(ax.plot((x) => Math.sin(x), { style: { stroke: sky, strokeWidth: 0.04 } }));
    add(ax.plot((x) => 0.5 * Math.cos(2 * x), { style: { stroke: orange, strokeWidth: 0.04 } }));

    render();
}
`,
};

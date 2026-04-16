import type { Example } from '../types';

export const calculus: Example = {
    name: 'Calculus',
    source: `export default function({ add, controls, interact, render }) {
    controls.panel();

    const xVal = controls.slider('x', { min: -4, max: 4, value: 1, step: 0.1 });

    // Axes with labels
    const ax = axes({
        xRange: [-5, 5, 1],
        yRange: [-3, 3, 1],
        xLabel: 'x',
        yLabel: 'y',
        includeNumbers: true,
        includeTip: true,
        color: neutral[400],
    });
    add(ax);

    // Plot f(x) = sin(x)
    const fn = (x) => Math.sin(x);
    const graph = functionGraph({
        fn,
        axes: ax,
        style: { stroke: sky, strokeWidth: 0.05 },
    });
    add(graph);

    // Tangent line at x
    let tLine = tangentLine({
        fn,
        axes: ax,
        x: xVal.value,
        length: 3,
        style: { stroke: yellow, strokeWidth: 0.03 },
    });
    add(tLine);

    // Point on curve
    const y = fn(xVal.value);
    const p = point({ position: ax.c2p([xVal.value, y]), color: red, radius: 0.1 });
    add(p);

    // Angle between tangent and x-axis
    const slope = (fn(xVal.value + 0.0001) - fn(xVal.value - 0.0001)) / 0.0002;
    const tangentAngle = Math.atan(slope);
    const vertex = ax.c2p([xVal.value, y]);
    const pRight = [vertex[0] + 1, vertex[1]];
    const pTangent = [vertex[0] + Math.cos(tangentAngle), vertex[1] + Math.sin(tangentAngle)];

    let ang = angleShape({
        vertex,
        point1: pRight,
        point2: pTangent,
        radius: 0.3,
        label: tangentAngle.toFixed(1) + ' rad',
        style: { stroke: orange, strokeWidth: 0.02 },
    });
    add(ang);

    // A line through two arbitrary points (demo)
    const through = lineThrough({
        p1: ax.c2p([-3, -2]),
        p2: ax.c2p([2, 1]),
        extend: 1,
        style: { stroke: emerald, strokeWidth: 0.02, lineDash: [0.1, 0.05] },
    });
    add(through);

    render();

    controls.onUpdate(() => {
        const x = xVal.value;
        const yv = fn(x);

        // Update tangent line
        const idx = ax.children.indexOf(tLine);
        if (idx !== -1) ax.remove(tLine);
        else { /* search root */ }
        tLine.parent?.remove(tLine);
        tLine = tangentLine({ fn, axes: ax, x, length: 3, style: { stroke: yellow, strokeWidth: 0.03 } });
        add(tLine);

        // Update point
        const pos = ax.c2p([x, yv]);
        p.moveTo(pos);

        // Update angle
        ang.parent?.remove(ang);
        const s = (fn(x + 0.0001) - fn(x - 0.0001)) / 0.0002;
        const ta = Math.atan(s);
        const v = ax.c2p([x, yv]);
        const pr = [v[0] + 1, v[1]];
        const pt = [v[0] + Math.cos(ta), v[1] + Math.sin(ta)];
        ang = angleShape({ vertex: v, point1: pr, point2: pt, radius: 0.3, label: ta.toFixed(1) + ' rad', style: { stroke: orange, strokeWidth: 0.02 } });
        add(ang);
    });
}
`,
};

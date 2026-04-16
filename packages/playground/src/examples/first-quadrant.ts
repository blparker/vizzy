import type { Example } from '../types';

export const firstQuadrant: Example = {
    name: 'First Quadrant',
    source: `export default function({ add, render }) {
    const ax = axes({
        xRange: [0, 10, 1],
        yRange: [0, 6, 1],
        xLabel: 'x',
        yLabel: 'y',
        includeNumbers: true,
        color: neutral[400],
    });
    add(ax);

    const graph = functionGraph({
        fn: (x) => Math.sqrt(x) * 2,
        axes: ax,
        style: { stroke: sky, strokeWidth: 0.05 },
    });
    add(graph);

    // A few labeled points
    const p1 = point({ position: ax.c2p([4, 4]), color: red, radius: 0.1 });
    const p2 = point({ position: ax.c2p([9, 5.5]), color: emerald, radius: 0.1 });
    add(p1, p2);

    // Dashed line between the points
    add(dashedLine({
        start: ax.c2p([4, 4]),
        end: ax.c2p([9, 5.5]),
        style: { stroke: orange, strokeWidth: 0.03 },
    }));

    // Labels — offset to avoid overlapping the curve
    const p1Pos = ax.c2p([4, 4]);
    const p2Pos = ax.c2p([9, 5.5]);
    add(text({ content: '(4, 4)', position: [p1Pos[0] - 0.3, p1Pos[1] + 0.4], style: { fill: red, fontSize: 0.22 } }));
    add(text({ content: '(9, 5.5)', position: [p2Pos[0] + 0.3, p2Pos[1] + 0.3], style: { fill: emerald, fontSize: 0.22, textAlign: 'left' } }));

    render();
}
`,
};

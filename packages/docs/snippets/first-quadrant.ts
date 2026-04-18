import type { Snippet } from './types';

const snippet: Snippet = {
    title: 'First Quadrant',
    description: 'Custom axis ranges with labeled points and dashed lines.',
    category: 'Math',
    code: `const ax = axes({
    xRange: [0, 10, 1],
    yRange: [0, 6, 1],
    xLabel: 'x',
    yLabel: 'y',
    includeNumbers: true,
    color: neutral[400],
});
add(ax);

add(functionGraph({
    fn: (x) => Math.sqrt(x) * 2,
    axes: ax,
    style: { stroke: sky, strokeWidth: 0.05 },
}));

const p1 = point({ position: ax.c2p([4, 4]), color: red, radius: 0.1 });
const p2 = point({ position: ax.c2p([9, 5.5]), color: emerald, radius: 0.1 });
add(p1, p2);

add(dashedLine({
    start: ax.c2p([4, 4]),
    end: ax.c2p([9, 5.5]),
    style: { stroke: orange, strokeWidth: 0.03 },
}));
`,
};

export default snippet;

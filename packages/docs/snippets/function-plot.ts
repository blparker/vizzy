import type { Snippet } from './types';

const snippet: Snippet = {
    title: 'Function Plot',
    description: 'Plot a function on axes with labeled ticks.',
    category: 'Math',
    code: `const ax = axes({
    xRange: [-5, 5, 1],
    yRange: [-3, 3, 1],
    includeNumbers: true,
    color: neutral[400],
});
add(ax);

const graph = functionGraph({
    fn: (x) => Math.sin(x),
    axes: ax,
    style: { stroke: sky, strokeWidth: 0.05 },
});
add(graph);
`,
};

export default snippet;

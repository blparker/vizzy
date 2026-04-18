import type { Snippet } from './types';

const snippet: Snippet = {
    title: 'More Shapes',
    description: 'Stars, ellipses, vectors, curved arrows, and more.',
    category: 'Basics',
    code: `grid();
add(
    star({ points: 5, outerRadius: 0.8, color: yellow }).shift(-4, 1.5),
    ellipse({ rx: 1.2, ry: 0.6, style: { stroke: pink } }).shift(-1, 1.5),
    square({ size: 1.2, color: orange }).shift(2, 1.5),
    vector({ direction: [2, 1], style: { stroke: red, fill: red } }).shift(-4, -1.5),
    doubleArrow({ start: [-1, -1.5], end: [2, -1.5], style: { stroke: emerald, fill: emerald } }),
    curvedArrow({ start: [3.5, -1], end: [5.5, -1], style: { stroke: violet } }),
);
`,
};

export default snippet;

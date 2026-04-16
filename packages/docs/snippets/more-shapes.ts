import type { Snippet } from './types';

const snippet: Snippet = {
    title: 'More Shapes',
    description: 'Squares, ellipses, stars, vectors, curved arrows, and arc between points.',
    category: 'Basics',
    playgroundOnly: true,
    code: `export default function({ add, grid, render }) {
    grid();

    const sq = add(square({ size: 1.2, style: { stroke: sky } }).shift(-5, 2.5));
    add(label(sq, 'square', DOWN));

    const el = add(ellipse({ rx: 1, ry: 0.6, style: { stroke: emerald } }).shift(-2.5, 2.5));
    add(label(el, 'ellipse', DOWN));

    const st = add(star({ points: 5, outerRadius: 0.8, innerRadius: 0.35, style: { stroke: yellow, fill: yellow[900] } }).shift(0, 2.5));
    add(label(st, 'star', DOWN));

    const inner = add(circle({ radius: 0.5, style: { stroke: violet } }).shift(2.5, 2.5));
    const sr = add(surroundingRectangle({ shape: inner, style: { stroke: orange } }));
    add(label(sr, 'surround', DOWN));

    add(vector({ direction: [1.5, 0.8], style: { stroke: red, fill: red } }).shift(-5.5, -0.3));
    add(text({ content: 'vector', position: [-5, -1.2], style: { fill: white, fontSize: 0.18 } }));

    add(doubleArrow({ start: [-3, 0], end: [-0.5, 0], style: { stroke: emerald, fill: emerald } }));
    add(text({ content: 'double arrow', position: [-1.75, -0.7], style: { fill: white, fontSize: 0.18 } }));

    add(curvedArrow({ start: [1, 0.5], end: [3.5, 0.5], angle: Math.PI / 4, style: { stroke: violet } }));
    add(text({ content: 'curved arrow', position: [2.25, -0.7], style: { fill: white, fontSize: 0.18 } }));

    render();
}`,
};

export default snippet;

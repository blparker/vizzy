import type { Snippet } from './types';

const snippet: Snippet = {
    title: 'Annotations',
    description: 'Edge labels, braces, and discontinuity markers.',
    category: 'Math',
    playgroundOnly: true,
    code: `export default function({ add, render }) {
    const r = rect({ width: 2, height: 1.5, style: { stroke: emerald } }).shift(-4, 2);
    add(r);
    add(edgeLabel({ shape: r, edge: 'top', content: 'width = 2' }));
    add(edgeLabel({ shape: r, edge: 'right', content: 'h = 1.5', style: { fill: emerald, fontSize: 0.18 } }));

    const c = circle({ radius: 1, style: { stroke: sky } }).shift(0, 2);
    add(c);
    add(edgeLabel({ shape: c, edge: 'top', content: 'r = 1' }));

    add(braceOver({ shape: r, edge: 'bottom', label: '2 units', style: { fill: yellow }, labelStyle: { fill: yellow } }));

    const s1 = rect({ width: 1, height: 1, style: { stroke: violet } }).shift(3, 2.5);
    const s2 = rect({ width: 1, height: 1, style: { stroke: violet } }).shift(5.5, 2.5);
    add(s1, s2);
    add(braceBetween({ from: s1, to: s2, edge: 'top', label: 'gap', style: { fill: orange }, labelStyle: { fill: orange } }));

    const ax = axes({ xRange: [-4, 4, 1], yRange: [-2, 4, 1], includeNumbers: true, color: neutral[500], autoFrame: false });
    ax.shift(0, -2.5);
    add(ax);

    add(functionGraph({
        fn: (x) => x < 1 ? x + 1 : 3,
        axes: ax,
        discontinuities: [{ x: 1, openAt: 2, closedAt: 3 }],
        style: { stroke: sky, strokeWidth: 0.04 },
    }));

    render();
}`,
};

export default snippet;

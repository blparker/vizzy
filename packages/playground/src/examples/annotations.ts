import type { Example } from '../types';

export const annotations: Example = {
    name: 'Annotations',
    source: `export default function({ add, render }) {
    // --- Edge labels on shapes ---
    const r = rect({ width: 2, height: 1.5, style: { stroke: emerald } }).shift(-4, 2);
    add(r);
    add(edgeLabel({ shape: r, edge: 'top', content: 'width = 2' }));
    add(edgeLabel({ shape: r, edge: 'right', content: 'h = 1.5', style: { fill: emerald, fontSize: 0.18 } }));

    const c = circle({ radius: 1, style: { stroke: sky } }).shift(0, 2);
    add(c);
    add(edgeLabel({ shape: c, edge: 'top', content: 'r = 1' }));

    // --- Brace over a shape ---
    add(braceOver({
        shape: r,
        edge: 'bottom',
        label: '2 units',
        style: { fill: yellow },
        labelStyle: { fill: yellow },
    }));

    // --- Brace between two shapes ---
    const s1 = rect({ width: 1, height: 1, style: { stroke: violet } }).shift(3, 2.5);
    const s2 = rect({ width: 1, height: 1, style: { stroke: violet } }).shift(5.5, 2.5);
    add(s1, s2);
    add(braceBetween({
        from: s1,
        to: s2,
        edge: 'top',
        label: 'gap',
        style: { fill: orange },
        labelStyle: { fill: orange },
    }));

    // --- Wide brace to test scaling ---
    const wideRect = rect({ width: 8, height: 0.8, style: { stroke: sky } }).shift(0, -0.5);
    add(wideRect);
    add(braceOver({
        shape: wideRect,
        edge: 'top',
        label: '8 units wide',
        style: { fill: sky },
        labelStyle: { fill: sky },
    }));

    // --- Discontinuity markers ---
    const ax = axes({
        xRange: [-4, 4, 1],
        yRange: [-2, 4, 1],
        includeNumbers: true,
        color: neutral[500],
        autoFrame: false,
    });
    ax.shift(0, -2.5);
    add(ax);

    // Piecewise function: f(x) = x+1 for x < 1, f(x) = 3 for x >= 1
    // Removable discontinuity at x=1: open at y=2, closed at y=3
    const graph = functionGraph({
        fn: (x) => x < 1 ? x + 1 : 3,
        axes: ax,
        discontinuities: [
            { x: 1, openAt: 2, closedAt: 3 },
        ],
        style: { stroke: sky, strokeWidth: 0.04 },
    });
    add(graph);

    render();
}
`,
};

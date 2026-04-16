import type { Snippet } from './types';

const snippet: Snippet = {
    title: 'Number Lines',
    description: 'Number lines with ticks, labels, and mapped points.',
    category: 'Math',
    code: `export default function({ add, grid }) {
    grid();

    const nl = numberLine({
        range: [-5, 5, 1],
        includeNumbers: true,
        color: sky,
    });
    nl.shift(0, 1.5);

    const nl2 = numberLine({
        range: [0, 10, 2],
        includeTip: true,
        includeNumbers: true,
        bigTickValues: [0, 5, 10],
        color: violet,
    });
    nl2.shift(0, -1.5);

    const dot = circle({ radius: 0.12, style: { fill: red, stroke: null } });
    dot.moveTo(nl.numberToPoint(3));

    add(nl, nl2, dot);
}`,
};

export default snippet;

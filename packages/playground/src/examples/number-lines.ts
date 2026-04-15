import type { Example } from '../types';

export const numberLines: Example = {
    name: 'Number Lines',
    source: `export default function({ add, grid }) {
    grid();

    // Basic number line with labels
    const nl = numberLine({
        range: [-5, 5, 1],
        includeNumbers: true,
        color: sky,
    });
    nl.shift(0, 1.5);

    // Number line with tips and custom range
    const nl2 = numberLine({
        range: [0, 10, 2],
        includeTip: true,
        includeNumbers: true,
        bigTickValues: [0, 5, 10],
        color: violet,
    });
    nl2.shift(0, -1.5);

    // A dot at value 3 on the first number line
    const dot = circle({
        radius: 0.12,
        style: { fill: red, stroke: null },
    });
    dot.moveTo(nl.numberToPoint(3));

    add(nl, nl2, dot);
}
`,
};

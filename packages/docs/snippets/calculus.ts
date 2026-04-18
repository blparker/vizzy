import type { Snippet } from './types';

const snippet: Snippet = {
    title: 'Calculus',
    description: 'Tangent line, angle visualization, and interactive derivative.',
    category: 'Math',
    code: `controls.panel();
const xVal = controls.slider('x', { min: -4, max: 4, value: 1, step: 0.1 });

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

const fn = (x) => Math.sin(x);
add(functionGraph({ fn, axes: ax, style: { stroke: sky, strokeWidth: 0.05 } }));

let tLine = tangentLine({ fn, axes: ax, x: xVal.value, length: 3, style: { stroke: yellow, strokeWidth: 0.03 } });
add(tLine);

const p = point({ position: ax.c2p([xVal.value, fn(xVal.value)]), color: red, radius: 0.1 });
add(p);

controls.onUpdate(() => {
    const x = xVal.value;
    tLine.parent?.remove(tLine);
    tLine = tangentLine({ fn, axes: ax, x, length: 3, style: { stroke: yellow, strokeWidth: 0.03 } });
    add(tLine);
    p.moveTo(ax.c2p([x, fn(x)]));
});
`,
};

export default snippet;

import type { Snippet } from './types';

const snippet: Snippet = {
    title: 'Function Plot (Interactive)',
    description: 'Switch between functions with sliders for frequency and amplitude.',
    category: 'Math',
    code: `export default function({ add, controls, render }) {
    controls.panel();

    const freq = controls.slider('Frequency', { min: 0.1, max: 5, value: 1, step: 0.1 });
    const amp = controls.slider('Amplitude', { min: 0.1, max: 3, value: 1, step: 0.1 });
    const fnType = controls.select('Function', {
        options: ['sin(x)', 'cos(x)', 'tan(x)', '1/x', 'x^2'],
        value: 'sin(x)',
    });

    const ax = axes({
        xRange: [-5, 5, 1],
        yRange: [-3, 3, 1],
        includeNumbers: true,
        includeTip: true,
        color: neutral[400],
    });
    add(ax);

    const fns = {
        'sin(x)': (x) => Math.sin(x),
        'cos(x)': (x) => Math.cos(x),
        'tan(x)': (x) => Math.tan(x),
        '1/x': (x) => 1 / x,
        'x^2': (x) => x * x,
    };

    const graph = functionGraph({
        fn: (x) => amp.value * fns[fnType.value](freq.value * x),
        axes: ax,
        style: { stroke: sky, strokeWidth: 0.05 },
    });
    add(graph);
    render();

    controls.onUpdate(() => {
        graph.setFunction((x) => amp.value * fns[fnType.value](freq.value * x));
    });
}`,
};

export default snippet;

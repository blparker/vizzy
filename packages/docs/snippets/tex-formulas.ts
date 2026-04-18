import type { Snippet } from './types';

const snippet: Snippet = {
    title: 'TeX Formulas',
    description: 'LaTeX rendering with KaTeX.',
    category: 'Math',
    code: `grid();

const c = circle({ radius: 0.8, style: { stroke: sky } });
const area = tex({ content: 'A = \\\\pi r^2', style: { fill: white, fontSize: 0.35 } });
area.nextTo(c, UP);

add(
    c, area,
    tex({ content: 'E = mc^2', position: [-4, 2.5], style: { fill: white, fontSize: 0.5 } }),
    tex({
        content: '\\\\int_{0}^{\\\\infty} e^{-x^2} dx = \\\\frac{\\\\sqrt{\\\\pi}}{2}',
        position: [-3.5, -2],
        style: { fill: violet[300], fontSize: 0.35 },
    }),
    tex({
        content: '\\\\sum_{n=1}^{\\\\infty} \\\\frac{1}{n^2} = \\\\frac{\\\\pi^2}{6}',
        position: [3.5, -2],
        style: { fill: sky[300], fontSize: 0.35 },
    }),
);
`,
};

export default snippet;

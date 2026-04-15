import type { Example } from '../types';

export const texFormulas: Example = {
    name: 'TeX Formulas',
    source: `export default function({ add, grid }) {
    grid();

    // Circle with area formula
    const c = circle({ radius: 0.8, style: { stroke: sky } });
    const area = tex({ content: 'A = \\\\pi r^2', style: { fill: white, fontSize: 0.35 } });
    area.nextTo(c, UP);

    // Famous formulas
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
}
`,
};

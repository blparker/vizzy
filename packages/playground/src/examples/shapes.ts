import type { Example } from '../types';

export const shapes: Example = {
    name: 'Shapes',
    source: `export default function({ add, grid }) {
    grid();

    add(
        circle({ radius: 0.8, style: { stroke: sky } }).shift(-4, 2),
        rect({ width: 2, height: 1.2, style: { stroke: emerald } }).shift(-1, 2),
        rect({ width: 1.5, height: 1.5, cornerRadius: 0.2, style: { stroke: violet, fill: violet[900] } }).shift(2, 2),
        line({ start: [4, 2.8], end: [6, 1.2], style: { stroke: orange } }),
        triangle({ radius: 0.9, style: { stroke: red } }).shift(-4, -1),
        regularPolygon({ sides: 6, radius: 0.9, style: { stroke: yellow } }).shift(-1, -1),
        regularPolygon({ sides: 5, radius: 0.9, style: { stroke: green } }).shift(2, -1),
        arc({ radius: 0.8, startAngle: 0, endAngle: Math.PI * 1.5, style: { stroke: pink } }).shift(5, -1),
        arrow({ start: [-4, -3], end: [-1, -3], style: { stroke: sky, fill: sky } }),
        text({ content: 'vizzy', position: [2, -3], style: { fill: white, fontSize: 0.4 } }),
    );
}
`,
};

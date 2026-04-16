import type { Snippet } from './types';

const snippet: Snippet = {
    title: 'Logo',
    description: 'The Vizzy logo built with shapes and TeX.',
    category: 'Basics',
    playgroundOnly: true,
    code: `const logoGreen = fromHex('#87c2a5');
const logoBlue = fromHex('#525893');
const logoRed = fromHex('#e07a5f');
const logoBlack = fromHex('#343434');

renderScene(canvas, { background: white }, ({ add, grid }) => {
    grid();

    const c = circle({ radius: 1, style: { fill: logoGreen, stroke: null } }).shift(LEFT);
    const sq = rect({ width: 2, height: 2, style: { fill: logoBlue, stroke: null } }).shift(UP);
    const tri = triangle({ radius: 1.15, style: { fill: logoRed, stroke: null } }).shift(RIGHT);
    const v = tex({ content: '\\\\mathbb{V}', style: { fill: logoBlack, fontSize: 2.8 } }).shift(-2.25, 1.5);

    const logo = group(tri, sq, c, v);
    logo.moveTo(ORIGIN);
    add(logo);
});`,
};

export default snippet;

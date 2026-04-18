import type { Snippet } from './types';

const snippet: Snippet = {
    title: 'Annotations',
    description: 'Edge labels and braces for annotating shapes.',
    category: 'Basics',
    code: `grid();

const r = rect({ width: 3, height: 2, color: emerald }).shift(-3, 0);
add(r);
add(edgeLabel({ shape: r, edge: 'top', content: 'width = 3' }));
add(edgeLabel({ shape: r, edge: 'right', content: 'h = 2', style: { fill: emerald, fontSize: 0.18 } }));
add(braceOver({ shape: r, edge: 'bottom', label: '3 units', style: { fill: yellow }, labelStyle: { fill: yellow } }));

const c = circle({ radius: 1, color: sky }).shift(3, 0);
add(c);
add(label(c, 'r = 1', UP));
`,
};

export default snippet;

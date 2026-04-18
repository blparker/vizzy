import type { Snippet } from './types';

const snippet: Snippet = {
    title: 'Shapes',
    description: 'Basic shapes with a single line each.',
    category: 'Basics',
    code: `grid();
add(
    circle({ color: sky }).shift(-3, 0),
    rect({ width: 1.5, height: 1.5, color: emerald }),
    triangle({ color: red }).shift(3, 0),
);
`,
};

export default snippet;

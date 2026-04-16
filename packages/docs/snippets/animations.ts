import type { Snippet } from './types';

const snippet: Snippet = {
    title: 'Animations',
    description: 'Fade, shift, rotate, and color animations with async/await.',
    category: 'Basics',
    code: `export default async function({ add, play, wait }) {
    const c = circle({ color: sky });

    await play(fadeIn(c));
    await play(animateShift(c, [3, 0]));
    await play(animateRotate(c, Math.PI * 2));
    await play(animateColor(c, { stroke: violet }));
    await play(fadeOut(c));
}`,
};

export default snippet;

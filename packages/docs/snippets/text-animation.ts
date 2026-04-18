import type { Snippet } from './types';

const snippet: Snippet = {
    title: 'Text + Animation',
    description: 'Coordinate labels that update live during animation.',
    category: 'Basics',
    code: `grid();

const dot = circle({ radius: 0.15, style: { fill: sky, stroke: null } });
const label = text({
    content: '(0.0, 0.0)',
    position: [0, 0.5],
    style: { fill: white, fontSize: 0.25 },
});

await wait(0.5);
await play(fadeIn(dot), fadeIn(label));

await play(
    animateShift(dot, [3, 2]),
    animateShift(label, [3, 2]),
    during(() => {
        const [x, y] = dot.center;
        label.content = '(' + x.toFixed(1) + ', ' + y.toFixed(1) + ')';
    }),
    { duration: 2 },
);
`,
};

export default snippet;

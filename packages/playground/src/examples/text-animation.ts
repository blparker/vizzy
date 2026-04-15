import type { Example } from '../types';

export const textAnimation: Example = {
    name: 'Text + Animation',
    source: `export default async function({ add, play, wait, grid, render }) {
    grid();

    // A dot that we'll move around
    const dot = circle({ radius: 0.15, style: { fill: sky, stroke: null } });

    // A text label that shows coordinates
    const label = text({
        content: '(0.0, 0.0)',
        position: [0, 0.5],
        style: { fill: white, fontSize: 0.25 },
    });

    render();
    await wait(0.5);

    // Fade in both
    await play(fadeIn(dot), fadeIn(label));

    // Move the dot to (3, 2) — label follows and updates its content
    await play(
        animateShift(dot, [3, 2]),
        animateShift(label, [3, 2]),
        during(() => {
            const [x, y] = dot.center;
            label.content = '(' + x.toFixed(1) + ', ' + y.toFixed(1) + ')';
        }),
        { duration: 2 },
    );

    await wait(0.5);

    // Move to (-3, 2) — label keeps tracking
    await play(
        animateShift(dot, [-6, 0]),
        animateShift(label, [-6, 0]),
        during(() => {
            const [x, y] = dot.center;
            label.content = '(' + x.toFixed(1) + ', ' + y.toFixed(1) + ')';
        }),
        { duration: 2 },
    );

    await wait(0.5);

    // Back to origin
    await play(
        animateMoveTo(dot, [0, 0]),
        animateMoveTo(label, [0, 0.5]),
        during(() => {
            const [x, y] = dot.center;
            label.content = '(' + x.toFixed(1) + ', ' + y.toFixed(1) + ')';
        }),
        { duration: 2 },
    );

    await wait(1);
}
`,
};

import type { Example } from '../types';

export const animations: Example = {
    name: 'Animations',
    source: `export default async function({ add, play, wait, grid, render }) {
    grid();
    render();

    const c = circle({ radius: 0.8, style: { stroke: sky, fill: sky[900] } });
    const r = rect({ width: 2, height: 1.2, style: { stroke: emerald, fill: emerald[900] } });
    const t = triangle({ radius: 0.9, style: { stroke: red } });

    // Fade in the circle
    await play(fadeIn(c));

    // Shift it to the right
    await play(animateShift(c, [3, 0]), { duration: 1.5 });

    // Create (draw-on) the rectangle and triangle simultaneously
    r.shift(-3, 0);
    t.shift(-3, -2.5);
    await play(create(r), create(t));

    await wait(0.5);

    // Move and rotate at the same time
    await play(
        animateShift(r, [0, -2.5]),
        animateRotate(c, Math.PI * 2),
    );

    // Color change
    await play(animateColor(c, { fill: violet[900], stroke: violet }));

    await wait(0.5);

    // Scale up then fade everything out
    await play(animateScale(c, 1.5), { duration: 0.8 });
    await play(fadeOut(c), fadeOut(r), fadeOut(t));

    await wait(0.3);

    // Bring them back
    await play(fadeIn(c), fadeIn(r), fadeIn(t));
}
`,
};

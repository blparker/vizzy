import type { Example } from '../types';

export const secantTangent: Example = {
    name: 'Secant → Tangent',
    source: `export default async function({ add, remove, play, wait, render }) {
    const ax = axes({
        xRange: [-1, 5, 1],
        yRange: [-1, 5, 1],
        includeNumbers: true,
        includeTip: true,
        color: neutral[400],
    });
    add(ax);

    // Plot f(x) = 0.3x^2 + 0.5
    const fn = (x) => 0.3 * x * x + 0.5;
    add(functionGraph({
        fn,
        axes: ax,
        style: { stroke: sky, strokeWidth: 0.04 },
    }));

    // Secant line (added before dots so dots render on top)
    const px = 1;
    const py = fn(px);
    let qx = 4;
    let qy = fn(qx);
    let secant = lineThrough({
        p1: ax.c2p([px, py]),
        p2: ax.c2p([qx, qy]),
        extend: 1.5,
        style: { stroke: yellow, strokeWidth: 0.03 },
    });
    add(secant);

    // Points (added after line so they render on top)
    const pDot = point({ position: ax.c2p([px, py]), color: red, radius: 0.1 });
    const pLabel = text({ content: 'P', position: [ax.c2p([px, py])[0] - 0.3, ax.c2p([px, py])[1] + 0.3], style: { fill: red, fontSize: 0.25 } });
    add(pDot, pLabel);

    const qDot = point({ position: ax.c2p([qx, qy]), color: emerald, radius: 0.1 });
    const qLabel = text({ content: 'Q', position: [ax.c2p([qx, qy])[0] + 0.3, ax.c2p([qx, qy])[1] + 0.3], style: { fill: emerald, fontSize: 0.25 } });
    add(qDot, qLabel);

    // Slope label
    const slopeLabel = text({
        content: 'slope = ' + ((qy - py) / (qx - px)).toFixed(2),
        position: [ax.c2p([3.5, 0.5])[0], ax.c2p([3.5, 0.5])[1]],
        style: { fill: yellow, fontSize: 0.22 },
    });
    add(slopeLabel);

    render();
    await wait(1);

    // Animate Q approaching P
    await play(
        during((t) => {
            // Q approaches P but never quite equals it
            qx = 4 - t * 3;
            if (Math.abs(qx - px) < 0.001) qx = px + 0.001;
            qy = fn(qx);
            const qPos = ax.c2p([qx, qy]);
            qDot.moveTo(qPos);
            qLabel.position = [qPos[0] + 0.3, qPos[1] + 0.3];

            // Update secant line
            remove(secant);
            secant = lineThrough({
                p1: ax.c2p([px, py]),
                p2: ax.c2p([qx, qy]),
                extend: 1.5,
                style: { stroke: yellow, strokeWidth: 0.03 },
            });
            // Insert before dots for z-order
            remove(pDot); remove(pLabel); remove(qDot); remove(qLabel);
            add(secant);
            add(pDot, pLabel, qDot, qLabel);

            // Update slope
            const s = (qy - py) / (qx - px);
            slopeLabel.content = 'slope = ' + s.toFixed(2);
        }),
        { duration: 5 },
    );

    await wait(0.5);

    // Fade out Q, transition secant to tangent color
    await play(fadeOut(qDot), fadeOut(qLabel));
    await play(animateColor(secant, { stroke: orange }));

    // Update slope label
    const deriv = (fn(px + 0.0001) - fn(px - 0.0001)) / 0.0002;
    slopeLabel.content = 'slope = ' + deriv.toFixed(2) + ' (tangent)';
    slopeLabel.style = { ...slopeLabel.style, fill: orange };

    await wait(2);
}
`,
};

import type { Snippet } from './types';

const snippet: Snippet = {
    title: 'Secant to Tangent',
    description: 'Animated limit — Q approaches P to reveal the derivative.',
    category: 'Math',
    code: `const ax = axes({
    xRange: [-1, 5, 1],
    yRange: [-1, 5, 1],
    includeNumbers: true,
    includeTip: true,
    color: neutral[400],
});
add(ax);

const fn = (x) => 0.3 * x * x + 0.5;
add(functionGraph({ fn, axes: ax, style: { stroke: sky, strokeWidth: 0.04 } }));

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

const pDot = point({ position: ax.c2p([px, py]), color: red, radius: 0.1 });
const pLabel = text({ content: 'P', position: [ax.c2p([px, py])[0] - 0.3, ax.c2p([px, py])[1] + 0.3], style: { fill: red, fontSize: 0.25 } });
const qDot = point({ position: ax.c2p([qx, qy]), color: emerald, radius: 0.1 });
const qLabel = text({ content: 'Q', position: [ax.c2p([qx, qy])[0] + 0.3, ax.c2p([qx, qy])[1] + 0.3], style: { fill: emerald, fontSize: 0.25 } });
const slopeLabel = text({ content: 'slope = ' + ((qy - py) / (qx - px)).toFixed(2), position: ax.c2p([3.5, 0.5]), style: { fill: yellow, fontSize: 0.22 } });
add(pDot, pLabel, qDot, qLabel, slopeLabel);

await wait(1);

await play(
    during((t) => {
        qx = 4 - t * 3;
        if (Math.abs(qx - px) < 0.001) qx = px + 0.001;
        qy = fn(qx);
        const qPos = ax.c2p([qx, qy]);
        qDot.moveTo(qPos);
        qLabel.position = [qPos[0] + 0.3, qPos[1] + 0.3];
        remove(secant);
        secant = lineThrough({ p1: ax.c2p([px, py]), p2: ax.c2p([qx, qy]), extend: 1.5, style: { stroke: yellow, strokeWidth: 0.03 } });
        remove(pDot); remove(pLabel); remove(qDot); remove(qLabel);
        add(secant); add(pDot, pLabel, qDot, qLabel);
        slopeLabel.content = 'slope = ' + ((qy - py) / (qx - px)).toFixed(2);
    }),
    { duration: 5 },
);

await wait(0.5);
await play(fadeOut(qDot), fadeOut(qLabel));
await play(animateColor(secant, { stroke: orange }));
const deriv = (fn(px + 0.0001) - fn(px - 0.0001)) / 0.0002;
slopeLabel.content = 'slope = ' + deriv.toFixed(2) + ' (tangent)';
slopeLabel.style = { ...slopeLabel.style, fill: orange };
await wait(2);
`,
};

export default snippet;

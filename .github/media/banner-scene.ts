// vizzy README banner scene.
//
// Paste the body of this file (the part after the imports block) into the
// Hub editor at https://hub.vizzyjs.dev or the local playground. Run it,
// then record the canvas with Kap/Gifski at ~640x320 for a ~4s loop.
//
// The scene is intentionally a single, composed calculus visual:
//   - cubic curve on muted axes
//   - a point sliding along the curve (ping-pong, loop-seamless)
//   - a tangent line that updates as the point moves
//   - a live KaTeX label showing f'(x)
//   - a cursor icon telegraphing interactivity
//   - "vizzy" wordmark bottom-left
//
// Everything is pure vizzy. No raw canvas was needed.

// --- snippet body (paste below this line into the Hub) ---

const ax = axes({
    xRange: [-3, 3, 1],
    yRange: [-2, 2, 1],
    includeNumbers: false,
    includeTicks: false,
    includeTip: false,
    color: neutral[700],
    style: { strokeWidth: 0.025 },
});
add(ax);

const fn = (x) => 0.15 * x * x * x - x;
const fnPrime = (x) => 0.45 * x * x - 1;

add(
    functionGraph({
        fn,
        axes: ax,
        style: { stroke: emerald[400], strokeWidth: 0.055 },
    })
);

const HALF = 1.6;
const frame = (x) => {
    const y = fn(x);
    const m = fnPrime(x);
    return {
        pos: ax.c2p([x, y]),
        p1: ax.c2p([x - HALF, y - m * HALF]),
        p2: ax.c2p([x + HALF, y + m * HALF]),
        m,
    };
};

const cursorPoints = (cx: number, cy: number): Vec2[] => [
    [cx, cy],
    [cx + 0.04, cy - 0.26],
    [cx + 0.11, cy - 0.18],
    [cx + 0.2, cy - 0.18],
];

let s = frame(-2);

const tangent = line(s.p1, s.p2, {
    color: sky[400],
    style: { strokeWidth: 0.04 },
});
add(tangent);

const dot = point({
    position: s.pos,
    radius: 0.14,
    style: { fill: sky[300], stroke: white, strokeWidth: 0.03 },
});
add(dot);

const cursor = polygon({
    points: cursorPoints(s.pos[0] + 0.06, s.pos[1] - 0.03),
    style: { fill: white, stroke: neutral[900], strokeWidth: 0.018 },
});
add(cursor);

// Top-right: never overlaps the dot, which sweeps through the middle and
// spends its extremes at (-2, 0.8) and (2, -0.8).
const label = tex({
    content: "f'(x) = " + s.m.toFixed(2),
    position: [1.5, 1.6],
    style: { fill: white, fontSize: 0.4 },
});
add(label);

// Bottom-left, away from the curve's downward arc around x=1..2.
const word = text({
    content: 'vizzy',
    position: [-2.5, -1.65],
    style: { fill: white, fontSize: 0.55, fontFamily: 'system-ui' },
});
add(word);

// Smooth ping-pong from x=-2 to x=2 and back. Cosine means first and last
// frames match for seamless looping as a GIF.
await play(
    during((t) => {
        const u = 0.5 - 0.5 * Math.cos(t * Math.PI * 2);
        const x = -2 + u * 4;
        s = frame(x);
        tangent.start = s.p1;
        tangent.end = s.p2;
        dot.moveTo(s.pos);
        cursor.points = cursorPoints(s.pos[0] + 0.06, s.pos[1] - 0.03);
        label.content = "f'(x) = " + s.m.toFixed(2);
    }),
    { duration: 4 }
);

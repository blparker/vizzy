import type { Vec2 } from '../math/vec2';
import { sub, add as addVec, scale as scaleVec, length, angle as vecAngle } from '../math/vec2';
import type { Style } from '../style/types';
import { PathShape } from './path';

export interface BraceProps {
    start?: Vec2;
    end?: Vec2;
    direction?: number;
    sharpness?: number;
    style?: Style;
}

export class BraceShape extends PathShape {
    constructor(props: BraceProps = {}) {
        const start = props.start ?? [0, 0];
        const end = props.end ?? [2, 0];
        const direction = props.direction ?? 1;
        const sharpness = props.sharpness ?? 2;

        super({
            style: {
                fill: { r: 1, g: 1, b: 1, a: 1 },
                stroke: null,
                ...props.style,
            },
        });
        (this as { type: string }).type = 'brace';

        buildBraceCommands(this, start, end, direction, sharpness);
    }
}

function buildBraceCommands(
    path: PathShape,
    start: Vec2,
    end: Vec2,
    direction: number,
    _sharpness: number,
): void {
    const totalLen = length(sub(end, start));
    if (totalLen < 1e-10) return;

    const mid = addVec(start, scaleVec(sub(end, start), 0.5));
    const angle = vecAngle(sub(end, start));

    const halfLen = totalLen / 2;

    const standoff = 0.15;
    const braceWidth = Math.min(0.3 + totalLen * 0.06, 0.7);
    const thickness = Math.min(0.03 + totalLen * 0.008, 0.08);

    // Local coordinate system:
    //   x: along the brace (left = -halfLen, right = +halfLen)
    //   y: perpendicular. y>0 = direction the tip points (away from the shape)
    //
    // direction=1: tip points in the +normal direction (above for horizontal)
    // direction=-1: tip points in the -normal direction (below for horizontal)

    function transform(lx: number, ly: number): Vec2 {
        // Flip y by direction so tip always points the right way
        ly = ly * direction;
        // Add standoff (push brace away from shape in the tip direction)
        ly = ly + standoff * direction;
        // Rotate to match the start→end angle
        const cos = Math.cos(angle);
        const sin = Math.sin(angle);
        const rx = lx * cos - ly * sin;
        const ry = lx * sin + ly * cos;
        return [mid[0] + rx, mid[1] + ry];
    }

    // Key points in local space (before direction flip):
    // Left end:  (-halfLen, 0)
    // Right end: (+halfLen, 0)
    // Tip:       (0, braceWidth)  — the pointy part, extends away from shape

    const tipPt = transform(0, braceWidth);
    const leftPt = transform(-halfLen, 0);
    const rightPt = transform(halfLen, 0);

    // Start at tip
    path.M(tipPt[0], tipPt[1]);

    // Segment 1: outer curve, tip → left end
    let cp1 = transform(0, 0);
    let cp2 = transform(-halfLen, braceWidth);
    path.C(cp1[0], cp1[1], cp2[0], cp2[1], leftPt[0], leftPt[1]);

    // Segment 2: inner curve, left end → tip
    cp1 = transform(-halfLen, braceWidth + thickness);
    cp2 = transform(-braceWidth * 0.4, thickness);
    path.C(cp1[0], cp1[1], cp2[0], cp2[1], tipPt[0], tipPt[1]);

    // Segment 3: outer curve, tip → right end
    cp1 = transform(0, 0);
    cp2 = transform(halfLen, braceWidth);
    path.C(cp1[0], cp1[1], cp2[0], cp2[1], rightPt[0], rightPt[1]);

    // Segment 4: inner curve, right end → tip
    cp1 = transform(halfLen, braceWidth + thickness);
    cp2 = transform(braceWidth * 0.4, thickness);
    path.C(cp1[0], cp1[1], cp2[0], cp2[1], tipPt[0], tipPt[1]);

    path.Z();
}

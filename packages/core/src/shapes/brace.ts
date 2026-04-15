import type { Vec2 } from '../math/vec2';
import { sub, add as addVec, scale as scaleVec, length, normalize } from '../math/vec2';
import type { Style } from '../style/types';
import { PolygonShape } from './polygon';

export interface BraceProps {
    start?: Vec2;
    end?: Vec2;
    direction?: number;
    curveHeight?: number;
    style?: Style;
}

export class BraceShape extends PolygonShape {
    constructor(props: BraceProps = {}) {
        const start = props.start ?? [0, 0];
        const end = props.end ?? [2, 0];
        const direction = props.direction ?? 1;
        const curveHeight = props.curveHeight ?? 0.2;

        const points = buildBracePoints(start, end, direction, curveHeight);

        super({
            points,
            closed: false,
            style: {
                stroke: { r: 1, g: 1, b: 1, a: 1 },
                fill: null,
                strokeWidth: 0.03,
                ...props.style,
            },
        });
        (this as { type: string }).type = 'brace';
    }
}

function buildBracePoints(
    start: Vec2,
    end: Vec2,
    direction: number,
    curveHeight: number,
): Vec2[] {
    const diff = sub(end, start);
    const len = length(diff);
    if (len < 1e-10) return [start, end];

    const tangent = normalize(diff);
    // Perpendicular (rotated 90 degrees in the given direction)
    const normal: Vec2 = [-tangent[1] * direction, tangent[0] * direction];

    const mid = addVec(start, scaleVec(diff, 0.5));
    const q1 = addVec(start, scaleVec(diff, 0.25));
    const q3 = addVec(start, scaleVec(diff, 0.75));

    const h = curveHeight;
    const tipH = h * 1.5;

    // Build the brace as a series of points approximating the curly shape
    const numPoints = 20;
    const points: Vec2[] = [];

    for (let i = 0; i <= numPoints; i++) {
        const t = i / numPoints;
        let offset: number;

        if (t <= 0.5) {
            // First half: curve up to the tip
            const s = t * 2; // 0 to 1
            // Smooth rise: starts flat, curves to peak
            offset = tipH * Math.sin(s * Math.PI / 2) * Math.sin(s * Math.PI / 2);
            // Add extra bump at midpoint
            if (s > 0.8) {
                const bump = (s - 0.8) / 0.2;
                offset = tipH + (tipH * 0.3) * Math.sin(bump * Math.PI);
            }
        } else {
            // Second half: mirror
            const s = (1 - t) * 2; // 1 to 0
            offset = tipH * Math.sin(s * Math.PI / 2) * Math.sin(s * Math.PI / 2);
            if (s > 0.8) {
                const bump = (s - 0.8) / 0.2;
                offset = tipH + (tipH * 0.3) * Math.sin(bump * Math.PI);
            }
        }

        const basePoint = addVec(start, scaleVec(diff, t));
        points.push(addVec(basePoint, scaleVec(normal, offset)));
    }

    return points;
}

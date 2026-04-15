import type { Vec2 } from '../math/vec2';
import { distance } from '../math/vec2';
import type { BoundingBox } from '../math/bbox';
import { bboxFromPoints } from '../math/bbox';
import type { Style } from '../style/types';
import { Shape } from './shape';

export interface PolygonProps {
    points?: Vec2[];
    closed?: boolean;
    style?: Style;
}

export class PolygonShape extends Shape {
    points: Vec2[];
    closed: boolean;

    constructor(props: PolygonProps = {}) {
        super('polygon', props.style);
        this.points = props.points ?? [];
        this.closed = props.closed ?? true;
    }

    getPathLength(): number {
        if (this.points.length < 2) return 0;
        let len = 0;
        for (let i = 1; i < this.points.length; i++) {
            len += distance(this.points[i - 1]!, this.points[i]!);
        }
        if (this.closed && this.points.length > 2) {
            len += distance(this.points[this.points.length - 1]!, this.points[0]!);
        }
        return len;
    }

    getBounds(): BoundingBox {
        if (this.points.length === 0) return { min: [0, 0], max: [0, 0] };
        return bboxFromPoints(this.points);
    }
}

export interface RegularPolygonProps {
    center?: Vec2;
    radius?: number;
    sides?: number;
    style?: Style;
}

export function regularPolygonPoints(
    center: Vec2,
    radius: number,
    sides: number,
): Vec2[] {
    const points: Vec2[] = [];
    for (let i = 0; i < sides; i++) {
        // Start from top (π/2) and go counter-clockwise
        const angle = Math.PI / 2 + (2 * Math.PI * i) / sides;
        points.push([
            center[0] + radius * Math.cos(angle),
            center[1] + radius * Math.sin(angle),
        ]);
    }
    return points;
}

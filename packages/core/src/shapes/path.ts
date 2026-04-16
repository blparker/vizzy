import type { Vec2 } from '../math/vec2';
import type { BoundingBox } from '../math/bbox';
import { bboxFromPoints } from '../math/bbox';
import type { Style } from '../style/types';
import { Shape } from './shape';

export type PathCommand =
    | { type: 'M'; to: Vec2 }
    | { type: 'L'; to: Vec2 }
    | { type: 'C'; cp1: Vec2; cp2: Vec2; to: Vec2 }
    | { type: 'Z' };

export interface PathProps {
    commands?: PathCommand[];
    style?: Style;
}

export class PathShape extends Shape {
    commands: PathCommand[];

    constructor(props: PathProps = {}) {
        super('path', props.style);
        this.commands = props.commands ?? [];
    }

    getBounds(): BoundingBox {
        const points: Vec2[] = [];
        for (const cmd of this.commands) {
            if (cmd.type === 'Z') continue;
            points.push(cmd.to);
            if (cmd.type === 'C') {
                points.push(cmd.cp1);
                points.push(cmd.cp2);
            }
        }
        if (points.length === 0) return { min: [0, 0], max: [0, 0] };
        return bboxFromPoints(points);
    }

    // Builder API for path construction
    M(x: number, y: number): this {
        this.commands.push({ type: 'M', to: [x, y] });
        return this;
    }

    L(x: number, y: number): this {
        this.commands.push({ type: 'L', to: [x, y] });
        return this;
    }

    C(cp1x: number, cp1y: number, cp2x: number, cp2y: number, x: number, y: number): this {
        this.commands.push({ type: 'C', cp1: [cp1x, cp1y], cp2: [cp2x, cp2y], to: [x, y] });
        return this;
    }

    Z(): this {
        this.commands.push({ type: 'Z' });
        return this;
    }
}

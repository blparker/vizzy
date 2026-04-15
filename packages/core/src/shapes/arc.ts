import type { Vec2 } from '../math/vec2';
import type { BoundingBox } from '../math/bbox';
import type { Style } from '../style/types';
import { Shape } from './shape';

export interface ArcProps {
    center?: Vec2;
    radius?: number;
    startAngle?: number;
    endAngle?: number;
    style?: Style;
}

export class ArcShape extends Shape {
    localCenter: Vec2;
    radius: number;
    startAngle: number;
    endAngle: number;

    constructor(props: ArcProps = {}) {
        super('arc', props.style);
        this.localCenter = props.center ?? [0, 0];
        this.radius = props.radius ?? 1;
        this.startAngle = props.startAngle ?? 0;
        this.endAngle = props.endAngle ?? Math.PI * 2;
    }

    getPathLength(): number {
        return this.radius * Math.abs(this.endAngle - this.startAngle);
    }

    getBounds(): BoundingBox {
        // Conservative: use full circle bounds
        return {
            min: [this.localCenter[0] - this.radius, this.localCenter[1] - this.radius],
            max: [this.localCenter[0] + this.radius, this.localCenter[1] + this.radius],
        };
    }
}

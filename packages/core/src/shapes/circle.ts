import type { Vec2 } from '../math/vec2';
import type { BoundingBox } from '../math/bbox';
import type { Style } from '../style/types';
import { Shape } from './shape';

export interface CircleProps {
    center?: Vec2;
    radius?: number;
    style?: Style;
}

export class CircleShape extends Shape {
    localCenter: Vec2;
    radius: number;

    constructor(props: CircleProps = {}) {
        super('circle', props.style);
        this.localCenter = props.center ?? [0, 0];
        this.radius = props.radius ?? 1;
    }

    getPathLength(): number {
        return 2 * Math.PI * this.radius;
    }

    getBounds(): BoundingBox {
        return {
            min: [this.localCenter[0] - this.radius, this.localCenter[1] - this.radius],
            max: [this.localCenter[0] + this.radius, this.localCenter[1] + this.radius],
        };
    }
}

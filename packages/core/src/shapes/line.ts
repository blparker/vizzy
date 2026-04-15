import type { Vec2 } from '../math/vec2';
import { distance } from '../math/vec2';
import type { BoundingBox } from '../math/bbox';
import type { Style } from '../style/types';
import { Shape } from './shape';

export interface LineProps {
    start?: Vec2;
    end?: Vec2;
    style?: Style;
}

export class LineShape extends Shape {
    start: Vec2;
    end: Vec2;

    constructor(props: LineProps = {}) {
        super('line', props.style);
        this.start = props.start ?? [-1, 0];
        this.end = props.end ?? [1, 0];
    }

    getPathLength(): number {
        return distance(this.start, this.end);
    }

    getBounds(): BoundingBox {
        return {
            min: [Math.min(this.start[0], this.end[0]), Math.min(this.start[1], this.end[1])],
            max: [Math.max(this.start[0], this.end[0]), Math.max(this.start[1], this.end[1])],
        };
    }
}

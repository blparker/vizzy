import type { Vec2 } from '../math/vec2';
import type { BoundingBox } from '../math/bbox';
import type { Style } from '../style/types';
import { Shape } from './shape';

export interface RectProps {
    center?: Vec2;
    width?: number;
    height?: number;
    cornerRadius?: number;
    style?: Style;
}

export class RectShape extends Shape {
    localCenter: Vec2;
    localWidth: number;
    localHeight: number;
    cornerRadius: number;

    constructor(props: RectProps = {}) {
        super('rect', props.style);
        this.localCenter = props.center ?? [0, 0];
        this.localWidth = props.width ?? 2;
        this.localHeight = props.height ?? 1;
        this.cornerRadius = props.cornerRadius ?? 0;
    }

    getPathLength(): number {
        return 2 * (this.localWidth + this.localHeight);
    }

    getBounds(): BoundingBox {
        const hw = this.localWidth / 2;
        const hh = this.localHeight / 2;
        return {
            min: [this.localCenter[0] - hw, this.localCenter[1] - hh],
            max: [this.localCenter[0] + hw, this.localCenter[1] + hh],
        };
    }
}

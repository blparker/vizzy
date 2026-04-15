import type { Vec2 } from '../math/vec2';
import type { BoundingBox } from '../math/bbox';
import type { Style } from '../style/types';
import { Shape } from './shape';

export interface TexProps {
    content?: string;
    position?: Vec2;
    style?: Style;
}

export class TexShape extends Shape {
    content: string;
    position: Vec2;

    /** Set by the renderer after rasterization for accurate bounds */
    measuredBounds: BoundingBox | null = null;

    constructor(props: TexProps = {}) {
        super('tex', {
            stroke: null,
            fill: props.style?.fill ?? { r: 1, g: 1, b: 1, a: 1 },
            fontSize: 0.4,
            ...props.style,
        });
        this.content = props.content ?? '';
        this.position = props.position ?? [0, 0];
    }

    getBounds(): BoundingBox {
        if (this.measuredBounds) return this.measuredBounds;

        // Fallback estimate: strip TeX commands to approximate rendered length
        const fontSize = this.style.fontSize ?? 0.4;
        const stripped = this.content
            .replace(/\\[a-zA-Z]+/g, 'X')  // \mathbb → X
            .replace(/[{}\\^_]/g, '');       // strip braces, escapes, super/subscript markers
        const charCount = Math.max(stripped.length, 1);
        const hw = (charCount * fontSize * 0.45) / 2;
        const hh = fontSize * 0.6;
        return {
            min: [this.position[0] - hw, this.position[1] - hh],
            max: [this.position[0] + hw, this.position[1] + hh],
        };
    }
}

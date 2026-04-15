import type { Vec2 } from '../math/vec2';
import type { BoundingBox } from '../math/bbox';
import type { Style } from '../style/types';
import { Shape } from './shape';

export interface TextProps {
    content?: string;
    position?: Vec2;
    style?: Style;
}

// Shared offscreen canvas for text measurement
let measureCtx: OffscreenCanvasRenderingContext2D | null = null;

function getMeasureCtx(): OffscreenCanvasRenderingContext2D {
    if (!measureCtx) {
        measureCtx = new OffscreenCanvas(1, 1).getContext('2d')!;
    }
    return measureCtx;
}

export class TextShape extends Shape {
    content: string;
    position: Vec2;

    constructor(props: TextProps = {}) {
        super('text', {
            stroke: null,
            fill: props.style?.fill ?? { r: 1, g: 1, b: 1, a: 1 },
            fontSize: 0.3,
            fontFamily: 'monospace',
            ...props.style,
        });
        this.content = props.content ?? '';
        this.position = props.position ?? [0, 0];
    }

    getBounds(): BoundingBox {
        const fontSize = this.style.fontSize ?? 0.3;
        const fontFamily = this.style.fontFamily ?? 'monospace';
        const ctx = getMeasureCtx();

        ctx.font = `${fontSize}px ${fontFamily}`;
        const metrics = ctx.measureText(this.content);

        const w = metrics.width;
        const ascent = metrics.actualBoundingBoxAscent ?? fontSize * 0.8;
        const descent = metrics.actualBoundingBoxDescent ?? fontSize * 0.2;
        const h = ascent + descent;

        // Adjust for textAlign — default is center
        const align = this.style.textAlign ?? 'center';
        let xOffset = 0;
        if (align === 'center') xOffset = -w / 2;
        else if (align === 'right') xOffset = -w;

        return {
            min: [this.position[0] + xOffset, this.position[1] - descent],
            max: [this.position[0] + xOffset + w, this.position[1] + ascent],
        };
    }
}

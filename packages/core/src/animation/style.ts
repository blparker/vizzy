import type { Color } from '../math/color';
import { fromHex, lerpColor } from '../math/color';
import { lerp } from '../math/lerp';
import type { Shape } from '../shapes/shape';
import type { AnimationOptions, Animation } from './types';
import { makeAnimation } from './types';

function toColor(c: Color | string | null | undefined): Color {
    if (!c) return { r: 0, g: 0, b: 0, a: 0 };
    if (typeof c === 'string') return fromHex(c);
    return c;
}

export interface ColorChangeOptions extends AnimationOptions {
    fill?: Color | string;
    stroke?: Color | string;
}

export function animateColor(shape: Shape, opts: ColorChangeOptions): Animation {
    let startFill: Color;
    let startStroke: Color;
    let targetFill: Color | null;
    let targetStroke: Color | null;

    return makeAnimation([shape], opts, {
        begin() {
            startFill = toColor(shape.style.fill);
            startStroke = toColor(shape.style.stroke);
            targetFill = opts.fill ? toColor(opts.fill) : null;
            targetStroke = opts.stroke ? toColor(opts.stroke) : null;
        },

        update(t) {
            const updates: Record<string, unknown> = {};
            if (targetFill) updates.fill = lerpColor(startFill, targetFill, t);
            if (targetStroke) updates.stroke = lerpColor(startStroke, targetStroke, t);
            shape.style = { ...shape.style, ...updates };
        },

        finish() {
            const updates: Record<string, unknown> = {};
            if (targetFill) updates.fill = targetFill;
            if (targetStroke) updates.stroke = targetStroke;
            shape.style = { ...shape.style, ...updates };
        },
    });
}

export function animateOpacity(shape: Shape, target: number, opts?: AnimationOptions): Animation {
    let startOpacity: number;

    return makeAnimation([shape], opts, {
        begin() {
            startOpacity = shape.style.opacity ?? 1;
        },

        update(t) {
            shape.style = { ...shape.style, opacity: lerp(startOpacity, target, t) };
        },

        finish() {
            shape.style = { ...shape.style, opacity: target };
        },
    });
}

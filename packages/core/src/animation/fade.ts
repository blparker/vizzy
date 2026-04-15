import type { Shape } from '../shapes/shape';
import { lerp } from '../math/lerp';
import type { AnimationOptions, Animation } from './types';
import { makeAnimation } from './types';

export interface FadeInOptions extends AnimationOptions {
    targetOpacity?: number;
}

export function fadeIn(shape: Shape, opts?: FadeInOptions): Animation {
    const targetOpacity = opts?.targetOpacity ?? 1;

    return makeAnimation([shape], opts, {
        begin() {
            shape.visible = true;
            shape.style = { ...shape.style, opacity: 0 };
        },

        update(t) {
            shape.style = { ...shape.style, opacity: lerp(0, targetOpacity, t) };
        },

        finish() {
            shape.style = { ...shape.style, opacity: targetOpacity };
        },
    });
}

export function fadeOut(shape: Shape, opts?: AnimationOptions): Animation {
    let startOpacity: number;

    return makeAnimation([shape], opts, {
        begin() {
            startOpacity = shape.style.opacity ?? 1;
        },

        update(t) {
            shape.style = { ...shape.style, opacity: lerp(startOpacity, 0, t) };
        },

        finish() {
            shape.style = { ...shape.style, opacity: 0 };
            shape.visible = false;
        },
    });
}

import type { Vec2 } from '../math/vec2';
import type { Shape } from '../shapes/shape';
import { lerp } from '../math/lerp';
import type { AnimationOptions, Animation } from './types';
import { makeAnimation } from './types';

export function animateShift(shape: Shape, delta: Vec2, opts?: AnimationOptions): Animation {
    let startX: number;
    let startY: number;

    return makeAnimation([shape], opts, {
        begin() {
            startX = shape.transform[6]!;
            startY = shape.transform[7]!;
        },

        update(t) {
            shape.transform[6] = lerp(startX, startX + delta[0], t);
            shape.transform[7] = lerp(startY, startY + delta[1], t);
        },

        finish() {
            shape.transform[6] = startX + delta[0];
            shape.transform[7] = startY + delta[1];
        },
    });
}

export function animateMoveTo(shape: Shape, target: Vec2, opts?: AnimationOptions): Animation {
    let startX: number;
    let startY: number;
    let endX: number;
    let endY: number;

    return makeAnimation([shape], opts, {
        begin() {
            startX = shape.transform[6]!;
            startY = shape.transform[7]!;
            // Compute what transform position would place center at target
            const current = shape.center;
            endX = startX + (target[0] - current[0]);
            endY = startY + (target[1] - current[1]);
        },

        update(t) {
            shape.transform[6] = lerp(startX, endX, t);
            shape.transform[7] = lerp(startY, endY, t);
        },

        finish() {
            shape.transform[6] = endX;
            shape.transform[7] = endY;
        },
    });
}

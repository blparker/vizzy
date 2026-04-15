import type { Shape } from '../shapes/shape';
import { lerp } from '../math/lerp';
import * as M from '../math/mat3';
import type { AnimationOptions, Animation } from './types';
import { makeAnimation } from './types';

export function animateScale(shape: Shape, factor: number, opts?: AnimationOptions): Animation {
    let start: M.TransformComponents;

    return makeAnimation([shape], opts, {
        begin() {
            start = M.decompose(shape.transform);
        },

        update(t) {
            const sx = lerp(start.scaleX, start.scaleX * factor, t);
            const sy = lerp(start.scaleY, start.scaleY * factor, t);
            shape.transform = M.compose({
                ...start,
                scaleX: sx,
                scaleY: sy,
            });
        },

        finish() {
            shape.transform = M.compose({
                ...start,
                scaleX: start.scaleX * factor,
                scaleY: start.scaleY * factor,
            });
        },
    });
}

export function animateRotate(shape: Shape, angle: number, opts?: AnimationOptions): Animation {
    let start: M.TransformComponents;

    return makeAnimation([shape], opts, {
        begin() {
            start = M.decompose(shape.transform);
        },

        update(t) {
            shape.transform = M.compose({
                ...start,
                rotation: lerp(start.rotation, start.rotation + angle, t),
            });
        },

        finish() {
            shape.transform = M.compose({
                ...start,
                rotation: start.rotation + angle,
            });
        },
    });
}

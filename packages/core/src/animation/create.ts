import type { Shape } from '../shapes/shape';
import { lerp } from '../math/lerp';
import type { AnimationOptions, Animation } from './types';
import { makeAnimation } from './types';

export function create(shape: Shape, opts?: AnimationOptions): Animation {
    let pathLength: number;
    let savedLineDash: number[] | undefined;
    let savedLineDashOffset: number | undefined;

    return makeAnimation([shape], opts, {
        begin() {
            pathLength = shape.getPathLength();
            savedLineDash = shape.style.lineDash;
            savedLineDashOffset = shape.style.lineDashOffset;
            shape.visible = true;
            shape.style = {
                ...shape.style,
                lineDash: [pathLength, pathLength],
                lineDashOffset: pathLength,
            };
        },

        update(t) {
            shape.style = {
                ...shape.style,
                lineDashOffset: lerp(pathLength, 0, t),
            };
        },

        finish() {
            shape.style = {
                ...shape.style,
                lineDash: savedLineDash,
                lineDashOffset: savedLineDashOffset,
            };
        },
    });
}

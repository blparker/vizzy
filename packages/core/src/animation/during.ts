import type { AnimationOptions, Animation } from './types';
import { makeAnimation } from './types';

export function during(callback: (t: number) => void, opts?: AnimationOptions): Animation {
    return makeAnimation([], opts, {
        begin() {},

        update(t) {
            callback(t);
        },

        finish() {
            callback(1);
        },
    });
}

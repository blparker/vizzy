import type { EasingFn } from '../math/easing';
import type { Shape } from '../shapes/shape';
import { smooth } from '../math/easing';

export interface AnimationOptions {
    duration?: number;
    easing?: EasingFn;
}

/**
 * An animation is a function that transforms a shape over time.
 *
 * @param begin - The function to call when the animation starts.
 * @param update - The function to call when the animation is updated.
 * @param finish - The function to call when the animation finishes.
 * @param duration - The duration of the animation in seconds.
 * @param easing - The easing function to use for the animation.
 * @param targets - The shapes to animate.
 */
export interface Animation {
    begin(): void;
    update(t: number): void;
    finish(): void;
    readonly duration: number;
    readonly easing: EasingFn;
    readonly targets: ReadonlyArray<Shape>;
}

export const DEFAULT_DURATION = 1;
export const DEFAULT_EASING: EasingFn = smooth;

export function makeAnimation(
    targets: Shape[],
    opts: AnimationOptions | undefined,
    callbacks: {
        begin: () => void;
        update: (t: number) => void;
        finish: () => void;
    }
): Animation {
    return {
        duration: opts?.duration ?? DEFAULT_DURATION,
        easing: opts?.easing ?? DEFAULT_EASING,
        targets,
        ...callbacks,
    };
}

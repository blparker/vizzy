export type EasingFn = (t: number) => number;

export const linear: EasingFn = (t) => t;

export const easeInQuad: EasingFn = (t) => t * t;
export const easeOutQuad: EasingFn = (t) => t * (2 - t);
export const easeInOutQuad: EasingFn = (t) =>
    t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;

export const easeInCubic: EasingFn = (t) => t * t * t;
export const easeOutCubic: EasingFn = (t) => --t * t * t + 1;
export const easeInOutCubic: EasingFn = (t) =>
    t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1;

export const easeInSine: EasingFn = (t) => 1 - Math.cos((t * Math.PI) / 2);
export const easeOutSine: EasingFn = (t) => Math.sin((t * Math.PI) / 2);
export const easeInOutSine: EasingFn = (t) => -(Math.cos(Math.PI * t) - 1) / 2;

export const smooth: EasingFn = (t) => t * t * (3 - 2 * t);
export const smoother: EasingFn = (t) => t * t * t * (t * (t * 6 - 15) + 10);

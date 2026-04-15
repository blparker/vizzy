export function lerp(a: number, b: number, t: number): number {
    return a + (b - a) * t;
}

export function clamp(value: number, min: number, max: number): number {
    return Math.min(Math.max(value, min), max);
}

export function remap(
    value: number,
    inLow: number,
    inHigh: number,
    outLow: number,
    outHigh: number,
): number {
    const t = (value - inLow) / (inHigh - inLow);
    return outLow + (outHigh - outLow) * t;
}

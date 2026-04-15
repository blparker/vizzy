export type Vec2 = readonly [number, number];

export function vec2(x: number, y: number): Vec2 {
    return [x, y];
}

export function add(a: Vec2, b: Vec2): Vec2 {
    return [a[0] + b[0], a[1] + b[1]];
}

export function sub(a: Vec2, b: Vec2): Vec2 {
    return [a[0] - b[0], a[1] - b[1]];
}

export function scale(v: Vec2, s: number): Vec2 {
    return [v[0] * s, v[1] * s];
}

export function dot(a: Vec2, b: Vec2): number {
    return a[0] * b[0] + a[1] * b[1];
}

export function length(v: Vec2): number {
    return Math.sqrt(v[0] * v[0] + v[1] * v[1]);
}

export function normalize(v: Vec2): Vec2 {
    const len = length(v);
    if (len === 0) return [0, 0];
    return [v[0] / len, v[1] / len];
}

export function distance(a: Vec2, b: Vec2): number {
    return length(sub(a, b));
}

export function rotate(v: Vec2, angle: number): Vec2 {
    const c = Math.cos(angle);
    const s = Math.sin(angle);
    return [v[0] * c - v[1] * s, v[0] * s + v[1] * c];
}

export function lerpVec2(a: Vec2, b: Vec2, t: number): Vec2 {
    return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
}

export function angle(v: Vec2): number {
    return Math.atan2(v[1], v[0]);
}

export const ORIGIN: Vec2 = [0, 0];
export const UP: Vec2 = [0, 1];
export const DOWN: Vec2 = [0, -1];
export const LEFT: Vec2 = [-1, 0];
export const RIGHT: Vec2 = [1, 0];

const S = Math.SQRT1_2;
export const UP_LEFT: Vec2 = [-S, S];
export const UP_RIGHT: Vec2 = [S, S];
export const DOWN_LEFT: Vec2 = [-S, -S];
export const DOWN_RIGHT: Vec2 = [S, -S];

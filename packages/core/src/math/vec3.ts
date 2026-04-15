export type Vec3 = readonly [number, number, number];

export function vec3(x: number, y: number, z: number): Vec3 {
    return [x, y, z];
}

export function addVec3(a: Vec3, b: Vec3): Vec3 {
    return [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
}

export function subVec3(a: Vec3, b: Vec3): Vec3 {
    return [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
}

export function scaleVec3(v: Vec3, s: number): Vec3 {
    return [v[0] * s, v[1] * s, v[2] * s];
}

export function lerpVec3(a: Vec3, b: Vec3, t: number): Vec3 {
    return [
        a[0] + (b[0] - a[0]) * t,
        a[1] + (b[1] - a[1]) * t,
        a[2] + (b[2] - a[2]) * t,
    ];
}

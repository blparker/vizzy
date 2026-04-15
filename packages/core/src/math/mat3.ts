import type { Vec2 } from './vec2';

/**
 * 3x3 matrix stored as Float64Array(9) in column-major order.
 *
 * Layout: [m00, m10, m20, m01, m11, m21, m02, m12, m22]
 *
 * As a matrix:
 *   | m00  m01  m02 |     indices: | 0  3  6 |
 *   | m10  m11  m12 |              | 1  4  7 |
 *   | m20  m21  m22 |              | 2  5  8 |
 *
 * Translation components are at indices 6 (tx) and 7 (ty).
 */
export type Mat3 = Float64Array;

export function create(
    m00: number, m01: number, m02: number,
    m10: number, m11: number, m12: number,
    m20: number, m21: number, m22: number,
): Mat3 {
    const m = new Float64Array(9);
    m[0] = m00; m[1] = m10; m[2] = m20;
    m[3] = m01; m[4] = m11; m[5] = m21;
    m[6] = m02; m[7] = m12; m[8] = m22;
    return m;
}

export function identity(): Mat3 {
    return create(
        1, 0, 0,
        0, 1, 0,
        0, 0, 1,
    );
}

export function translation(tx: number, ty: number): Mat3 {
    return create(
        1, 0, tx,
        0, 1, ty,
        0, 0, 1,
    );
}

export function rotation(radians: number): Mat3 {
    const c = Math.cos(radians);
    const s = Math.sin(radians);
    return create(
        c, -s, 0,
        s,  c, 0,
        0,  0, 1,
    );
}

export function scaling(sx: number, sy: number): Mat3 {
    return create(
        sx, 0, 0,
        0, sy, 0,
        0,  0, 1,
    );
}

export function multiply(a: Mat3, b: Mat3): Mat3 {
    const out = new Float64Array(9);
    for (let col = 0; col < 3; col++) {
        for (let row = 0; row < 3; row++) {
            out[col * 3 + row] =
                a[0 * 3 + row]! * b[col * 3 + 0]! +
                a[1 * 3 + row]! * b[col * 3 + 1]! +
                a[2 * 3 + row]! * b[col * 3 + 2]!;
        }
    }
    return out;
}

export function transformPoint(m: Mat3, p: Vec2): Vec2 {
    const x = m[0]! * p[0] + m[3]! * p[1] + m[6]!;
    const y = m[1]! * p[0] + m[4]! * p[1] + m[7]!;
    return [x, y];
}

export function getTranslation(m: Mat3): Vec2 {
    return [m[6]!, m[7]!];
}

export function getScaleX(m: Mat3): number {
    return Math.sqrt(m[0]! * m[0]! + m[1]! * m[1]!);
}

export function getScaleY(m: Mat3): number {
    return Math.sqrt(m[3]! * m[3]! + m[4]! * m[4]!);
}

export function getRotation(m: Mat3): number {
    return Math.atan2(m[1]!, m[0]!);
}

export interface TransformComponents {
    tx: number;
    ty: number;
    rotation: number;
    scaleX: number;
    scaleY: number;
}

export function decompose(m: Mat3): TransformComponents {
    return {
        tx: m[6]!,
        ty: m[7]!,
        rotation: Math.atan2(m[1]!, m[0]!),
        scaleX: Math.sqrt(m[0]! * m[0]! + m[1]! * m[1]!),
        scaleY: Math.sqrt(m[3]! * m[3]! + m[4]! * m[4]!),
    };
}

export function compose(c: TransformComponents): Mat3 {
    const cos = Math.cos(c.rotation);
    const sin = Math.sin(c.rotation);
    return create(
        cos * c.scaleX, -sin * c.scaleY, c.tx,
        sin * c.scaleX,  cos * c.scaleY, c.ty,
        0,               0,              1,
    );
}

export function invert(m: Mat3): Mat3 | null {
    const a = m[0]!, b = m[1]!, c = m[2]!;
    const d = m[3]!, e = m[4]!, f = m[5]!;
    const g = m[6]!, h = m[7]!, i = m[8]!;

    const det = a * (e * i - f * h) - d * (b * i - c * h) + g * (b * f - c * e);
    if (Math.abs(det) < 1e-12) return null;

    const invDet = 1 / det;
    const out = new Float64Array(9);
    out[0] = (e * i - f * h) * invDet;
    out[1] = (c * h - b * i) * invDet;
    out[2] = (b * f - c * e) * invDet;
    out[3] = (f * g - d * i) * invDet;
    out[4] = (a * i - c * g) * invDet;
    out[5] = (c * d - a * f) * invDet;
    out[6] = (d * h - e * g) * invDet;
    out[7] = (b * g - a * h) * invDet;
    out[8] = (a * e - b * d) * invDet;
    return out;
}

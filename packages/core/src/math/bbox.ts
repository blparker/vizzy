import type { Vec2 } from './vec2';

/**
 * A bounding box is a rectangle defined by its minimum and maximum coordinates. The minimum coordinates are the left and top coordinates,
 * and the maximum coordinates are the right and bottom coordinates.
 */
export interface BoundingBox {
    /**
     * The minimum coordinates of the bounding box.
     */
    min: Vec2;
    /**
     * The maximum coordinates of the bounding box.
     */
    max: Vec2;
}

/**
 * Returns the center of the bounding box.
 *
 * @param b - The bounding box.
 * @returns The center of the bounding box.
 */
export function bboxCenter(b: BoundingBox): Vec2 {
    return [(b.min[0] + b.max[0]) / 2, (b.min[1] + b.max[1]) / 2];
}

/**
 * Returns the width of the bounding box.
 *
 * @param b - The bounding box.
 * @returns The width of the bounding box.
 */
export function bboxWidth(b: BoundingBox): number {
    return b.max[0] - b.min[0];
}

/**
 * Returns the height of the bounding box.
 *
 * @param b - The bounding box.
 * @returns The height of the bounding box.
 */
export function bboxHeight(b: BoundingBox): number {
    return b.max[1] - b.min[1];
}

/**
 * Returns the top center of the bounding box.
 *
 * @param b - The bounding box.
 * @returns The top center of the bounding box.
 */
export function bboxTop(b: BoundingBox): Vec2 {
    return [(b.min[0] + b.max[0]) / 2, b.max[1]];
}

/**
 * Returns the bottom center of the bounding box.
 *
 * @param b - The bounding box.
 * @returns The bottom center of the bounding box.
 */
export function bboxBottom(b: BoundingBox): Vec2 {
    return [(b.min[0] + b.max[0]) / 2, b.min[1]];
}

/**
 * Returns the left center of the bounding box.
 *
 * @param b - The bounding box.
 * @returns The left center of the bounding box.
 */
export function bboxLeft(b: BoundingBox): Vec2 {
    return [b.min[0], (b.min[1] + b.max[1]) / 2];
}

/**
 * Returns the right center of the bounding box.
 *
 * @param b - The bounding box.
 * @returns The right center of the bounding box.
 */
export function bboxRight(b: BoundingBox): Vec2 {
    return [b.max[0], (b.min[1] + b.max[1]) / 2];
}

/**
 * Returns the bounding box from an array of points.
 *
 * @param points - The points.
 * @returns The bounding box.
 */
export function bboxFromPoints(points: Vec2[]): BoundingBox {
    let minX = Infinity,
        minY = Infinity;
    let maxX = -Infinity,
        maxY = -Infinity;
    for (const p of points) {
        if (p[0] < minX) minX = p[0];
        if (p[1] < minY) minY = p[1];
        if (p[0] > maxX) maxX = p[0];
        if (p[1] > maxY) maxY = p[1];
    }
    return { min: [minX, minY], max: [maxX, maxY] };
}

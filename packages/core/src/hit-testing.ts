import type { Vec2 } from './math/vec2';
import type { Mat3 } from './math/mat3';
import * as M from './math/mat3';
import type { BoundingBox } from './math/bbox';
import { bboxFromPoints } from './math/bbox';
import { Shape } from './shapes/shape';
import { CircleShape } from './shapes/circle';
import { RectShape } from './shapes/rect';
import { Group } from './shapes/group';

export function pointInBounds(point: Vec2, bbox: BoundingBox): boolean {
    return (
        point[0] >= bbox.min[0] &&
        point[0] <= bbox.max[0] &&
        point[1] >= bbox.min[1] &&
        point[1] <= bbox.max[1]
    );
}

export function pointInCircle(point: Vec2, shape: CircleShape, worldTransform: Mat3): boolean {
    const inv = M.invert(worldTransform);
    if (!inv) return false;
    const local = M.transformPoint(inv, point);
    const dx = local[0] - shape.localCenter[0];
    const dy = local[1] - shape.localCenter[1];
    return dx * dx + dy * dy <= shape.radius * shape.radius;
}

export function pointInRect(point: Vec2, shape: RectShape, worldTransform: Mat3): boolean {
    const inv = M.invert(worldTransform);
    if (!inv) return false;
    const local = M.transformPoint(inv, point);
    return pointInBounds(local, shape.getBounds());
}

export function pointInShape(point: Vec2, shape: Shape, worldTransform: Mat3): boolean {
    if (shape instanceof CircleShape) return pointInCircle(point, shape, worldTransform);
    if (shape instanceof RectShape) return pointInRect(point, shape, worldTransform);

    // Fallback: world-space AABB test
    const bounds = shape.getBounds();
    const corners: Vec2[] = [
        M.transformPoint(worldTransform, bounds.min),
        M.transformPoint(worldTransform, [bounds.max[0], bounds.min[1]]),
        M.transformPoint(worldTransform, bounds.max),
        M.transformPoint(worldTransform, [bounds.min[0], bounds.max[1]]),
    ];
    return pointInBounds(point, bboxFromPoints(corners));
}

export interface HitTestResult {
    shape: Shape;
    worldTransform: Mat3;
}

export function hitTestAll(root: Group, cameraTransform: Mat3, worldPoint: Vec2): HitTestResult[] {
    const results: HitTestResult[] = [];

    function walk(shape: Shape, parentTransform: Mat3): void {
        if (!shape.visible) return;

        const worldTransform = M.multiply(parentTransform, shape.transform);

        if (shape instanceof Group) {
            for (const child of shape.children) {
                walk(child, worldTransform);
            }
        } else {
            if (pointInShape(worldPoint, shape, worldTransform)) {
                results.push({ shape, worldTransform });
            }
        }
    }

    for (const child of root.children) {
        walk(child, cameraTransform);
    }

    return results;
}

export function hitTest(root: Group, cameraTransform: Mat3, worldPoint: Vec2): HitTestResult | null {
    const results = hitTestAll(root, cameraTransform, worldPoint);
    return results.length > 0 ? results[results.length - 1]! : null;
}

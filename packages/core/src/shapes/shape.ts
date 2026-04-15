import type { Vec2 } from '../math/vec2';
import { add as addVec, sub as subVec, scale as scaleVec } from '../math/vec2';
import type { Mat3 } from '../math/mat3';
import * as M from '../math/mat3';
import type { BoundingBox } from '../math/bbox';
import {
    bboxCenter, bboxWidth, bboxHeight,
    bboxTop, bboxBottom, bboxLeft, bboxRight,
} from '../math/bbox';
import type { Style } from '../style/types';
import type { ShapeType } from './types';
import { uid, type ShapeId } from '../uid';
import type { Group } from './group';

export abstract class Shape {
    readonly id: ShapeId;
    readonly type: ShapeType;
    style: Style;
    transform: Mat3;
    parent: Group | null = null;
    visible: boolean = true;

    constructor(type: ShapeType, style: Style = {}) {
        this.id = uid();
        this.type = type;
        this.style = style;
        this.transform = M.identity();
    }

    // --- Abstract: each shape defines its local-space bounding box ---

    abstract getBounds(): BoundingBox;

    getPathLength(): number {
        const b = this.getBounds();
        return 2 * (bboxWidth(b) + bboxHeight(b));
    }

    // --- Bounding box getters (world space) ---

    get center(): Vec2 {
        return M.transformPoint(this.transform, bboxCenter(this.getBounds()));
    }

    get top(): Vec2 {
        return M.transformPoint(this.transform, bboxTop(this.getBounds()));
    }

    get bottom(): Vec2 {
        return M.transformPoint(this.transform, bboxBottom(this.getBounds()));
    }

    get left(): Vec2 {
        return M.transformPoint(this.transform, bboxLeft(this.getBounds()));
    }

    get right(): Vec2 {
        return M.transformPoint(this.transform, bboxRight(this.getBounds()));
    }

    get width(): number {
        return bboxWidth(this.getBounds()) * M.getScaleX(this.transform);
    }

    get height(): number {
        return bboxHeight(this.getBounds()) * M.getScaleY(this.transform);
    }

    // --- Positioning (world space) ---

    moveTo(target: Vec2): this {
        const current = this.center;
        const delta = subVec(target, current);
        this.transform[6]! += delta[0];
        this.transform[7]! += delta[1];
        return this;
    }

    shift(...args: [Vec2] | [number, number]): this {
        const delta: Vec2 = args.length === 1 ? args[0] : [args[0], args[1]];
        this.transform[6]! += delta[0];
        this.transform[7]! += delta[1];
        return this;
    }

    nextTo(other: Shape, direction: Vec2, buffer: number = 0.2): this {
        const otherBounds = other.getBounds();
        const thisBounds = this.getBounds();

        // Get world-space centers
        const otherCenter = other.center;

        // Compute the edge point on the other shape in the given direction
        const otherHalfW = bboxWidth(otherBounds) * M.getScaleX(other.transform) / 2;
        const otherHalfH = bboxHeight(otherBounds) * M.getScaleY(other.transform) / 2;
        const thisHalfW = bboxWidth(thisBounds) * M.getScaleX(this.transform) / 2;
        const thisHalfH = bboxHeight(thisBounds) * M.getScaleY(this.transform) / 2;

        // Offset = edge-to-edge distance + buffer, in the given direction
        const offset: Vec2 = [
            direction[0] * (otherHalfW + thisHalfW + buffer),
            direction[1] * (otherHalfH + thisHalfH + buffer),
        ];

        const target = addVec(otherCenter, offset);
        return this.moveTo(target);
    }

    // --- Low-level transform operations ---

    translate(x: number, y: number): this {
        this.transform = M.multiply(this.transform, M.translation(x, y));
        return this;
    }

    rotate(angle: number): this {
        this.transform = M.multiply(this.transform, M.rotation(angle));
        return this;
    }

    scale(sx: number, sy?: number): this {
        this.transform = M.multiply(this.transform, M.scaling(sx, sy ?? sx));
        return this;
    }

    setPosition(x: number, y: number): this {
        this.transform[6] = x;
        this.transform[7] = y;
        return this;
    }
}

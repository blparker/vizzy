import type { Vec2 } from '../math/vec2';
import type { BoundingBox } from '../math/bbox';
import * as M from '../math/mat3';
import type { Style } from '../style/types';
import { Shape } from './shape';

export class Group extends Shape {
    private _children: Shape[] = [];

    constructor(style: Style = {}) {
        super('group', style);
    }

    get children(): ReadonlyArray<Shape> {
        return this._children;
    }

    add(...shapes: Shape[]): this {
        for (const shape of shapes) {
            if (shape.parent) {
                throw new Error(`Shape ${shape.id} already has a parent`);
            }
            shape.parent = this;
            this._children.push(shape);
        }
        return this;
    }

    remove(shape: Shape): this {
        const idx = this._children.indexOf(shape);
        if (idx !== -1) {
            this._children.splice(idx, 1);
            shape.parent = null;
        }
        return this;
    }

    moveToFront(shape: Shape): this {
        const idx = this._children.indexOf(shape);
        if (idx !== -1 && idx !== this._children.length - 1) {
            this._children.splice(idx, 1);
            this._children.push(shape);
        }
        return this;
    }

    moveToBack(shape: Shape): this {
        const idx = this._children.indexOf(shape);
        if (idx > 0) {
            this._children.splice(idx, 1);
            this._children.unshift(shape);
        }
        return this;
    }

    clear(): this {
        for (const child of this._children) {
            child.parent = null;
        }
        this._children.length = 0;
        return this;
    }

    arrange(direction: Vec2 = [1, 0], buff: number = 0.5): this {
        if (this._children.length <= 1) return this;

        const isHorizontal = Math.abs(direction[0]) > Math.abs(direction[1]);

        // Compute total size and position each child sequentially
        let cursor = 0;
        for (const child of this._children) {
            if (isHorizontal) {
                const hw = child.width / 2;
                const targetX = cursor + hw;
                const currentCenter = child.center;
                child.shift(targetX - currentCenter[0], -currentCenter[1]);
                cursor = targetX + hw + buff;
            } else {
                const hh = child.height / 2;
                const targetY = cursor - hh;
                const currentCenter = child.center;
                child.shift(-currentCenter[0], targetY - currentCenter[1]);
                cursor = targetY - hh - buff;
            }
        }

        // Center the group at origin
        const bounds = this.getBounds();
        const cx = (bounds.min[0] + bounds.max[0]) / 2;
        const cy = (bounds.min[1] + bounds.max[1]) / 2;
        for (const child of this._children) {
            child.shift(-cx, -cy);
        }

        return this;
    }

    getBounds(): BoundingBox {
        if (this._children.length === 0) {
            return { min: [0, 0], max: [0, 0] };
        }

        let minX = Infinity, minY = Infinity;
        let maxX = -Infinity, maxY = -Infinity;

        for (const child of this._children) {
            const cb = child.getBounds();
            // Transform child bounds corners into group-local space
            const corners = [
                M.transformPoint(child.transform, cb.min),
                M.transformPoint(child.transform, cb.max),
                M.transformPoint(child.transform, [cb.min[0], cb.max[1]]),
                M.transformPoint(child.transform, [cb.max[0], cb.min[1]]),
            ];
            for (const c of corners) {
                if (c[0] < minX) minX = c[0];
                if (c[1] < minY) minY = c[1];
                if (c[0] > maxX) maxX = c[0];
                if (c[1] > maxY) maxY = c[1];
            }
        }

        return { min: [minX, minY], max: [maxX, maxY] };
    }
}

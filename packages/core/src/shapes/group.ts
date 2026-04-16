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

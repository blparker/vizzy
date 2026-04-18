import type { Vec2 } from '../math/vec2';
import type { Mat3 } from '../math/mat3';
import * as M from '../math/mat3';

export interface CameraOptions {
    worldWidth?: number;
    worldHeight?: number;
    pixelWidth?: number;
    pixelHeight?: number;
    center?: Vec2;
}

export class Camera {
    worldWidth: number;
    worldHeight: number;
    pixelWidth: number;
    pixelHeight: number;
    center: Vec2;

    constructor(opts: CameraOptions = {}) {
        this.worldWidth = opts.worldWidth ?? 14;
        this.worldHeight = opts.worldHeight ?? 8;
        this.pixelWidth = opts.pixelWidth ?? 800;
        this.pixelHeight = opts.pixelHeight ?? 600;
        this.center = opts.center ?? [0, 0];
    }

    setPixelSize(width: number, height: number): void {
        this.pixelWidth = width;
        this.pixelHeight = height;
    }

    getWorldToPixel(): Mat3 {
        // Fit the entire world inside the canvas: uniform scale, no clipping
        const sx = this.pixelWidth / this.worldWidth;
        const sy = this.pixelHeight / this.worldHeight;
        const s = Math.min(sx, sy);

        const tx = this.pixelWidth / 2 - this.center[0] * s;
        const ty = this.pixelHeight / 2 + this.center[1] * s;

        return M.create(
            s,  0, tx,
            0, -s, ty,
            0,  0, 1,
        );
    }

    getPixelToWorld(): Mat3 {
        const wtp = this.getWorldToPixel();
        const inv = M.invert(wtp);
        if (!inv) throw new Error('Camera transform is not invertible');
        return inv;
    }

    /** Visible world width accounting for letterboxing */
    get visibleWidth(): number {
        const s = Math.min(this.pixelWidth / this.worldWidth, this.pixelHeight / this.worldHeight);
        return this.pixelWidth / s;
    }

    /** Visible world height accounting for letterboxing */
    get visibleHeight(): number {
        const s = Math.min(this.pixelWidth / this.worldWidth, this.pixelHeight / this.worldHeight);
        return this.pixelHeight / s;
    }
}

import type { Vec2 } from '../math/vec2';
import type { Style } from '../style/types';
import { Group } from './group';
import { PolygonShape } from './polygon';
import { CircleShape } from './circle';
import type { Axes } from './axes';

export interface Discontinuity {
    x: number;
    openAt?: number;
    closedAt?: number;
}

export interface FunctionGraphProps {
    fn: (x: number) => number;
    axes: Axes;
    xRange?: [number, number];
    step?: number;
    discontinuityThreshold?: number;
    discontinuities?: Discontinuity[];
    style?: Style;
}

export class FunctionGraph extends Group {
    private _axes: Axes;
    private _fn: (x: number) => number;
    private _xRange: [number, number];
    private _step: number;
    private _discontinuityThreshold: number;
    private _discontinuities: Discontinuity[];
    private _style: Style;

    constructor(props: FunctionGraphProps) {
        super();
        (this as { type: string }).type = 'function-graph';

        this._axes = props.axes;
        this._fn = props.fn;
        this._xRange = props.xRange ?? [props.axes.xMin, props.axes.xMax];
        this._step = props.step ?? 0.05;
        this._discontinuityThreshold = props.discontinuityThreshold ?? 100;
        this._discontinuities = props.discontinuities ?? [];
        this._style = {
            stroke: { r: 0.33, g: 0.63, b: 0.96, a: 1 },
            strokeWidth: 0.04,
            fill: null,
            ...props.style,
        };

        this.buildSegments();
    }

    setFunction(fn: (x: number) => number): void {
        this._fn = fn;
        this.buildSegments();
    }

    setXRange(xRange: [number, number]): void {
        this._xRange = xRange;
        this.buildSegments();
    }

    private buildSegments(): void {
        this.clear();

        const [xMin, xMax] = this._xRange;
        const step = this._step;
        const threshold = this._discontinuityThreshold;

        // Build a set of x-values where we should break segments
        const breakPoints = new Set<number>();
        for (const disc of this._discontinuities) {
            breakPoints.add(disc.x);
        }

        let currentSegment: Vec2[] = [];

        for (let x = xMin; x <= xMax; x += step) {
            // Check if we're at or crossing a break point
            let hitBreak = false;
            for (const bx of breakPoints) {
                if (Math.abs(x - bx) < step * 0.5) {
                    // We're at a discontinuity — flush current segment and skip this sample
                    if (currentSegment.length >= 2) {
                        this.addSegment(currentSegment);
                    }
                    currentSegment = [];
                    hitBreak = true;
                    break;
                }
            }
            if (hitBreak) continue;

            const y = this._fn(x);

            if (!isFinite(y)) {
                if (currentSegment.length >= 2) {
                    this.addSegment(currentSegment);
                }
                currentSegment = [];
                continue;
            }

            const pt = this._axes.coordToPoint([x, y]);

            if (currentSegment.length > 0) {
                const prev = currentSegment[currentSegment.length - 1]!;
                const dy = Math.abs(pt[1] - prev[1]);
                if (dy > threshold) {
                    if (currentSegment.length >= 2) {
                        this.addSegment(currentSegment);
                    }
                    currentSegment = [];
                    continue;
                }
            }

            currentSegment.push(pt);
        }

        // Flush final segment
        if (currentSegment.length >= 2) {
            this.addSegment(currentSegment);
        }

        // Add discontinuity markers
        for (const disc of this._discontinuities) {
            const markerRadius = 0.08;
            const strokeColor = this._style.stroke ?? { r: 0.33, g: 0.63, b: 0.96, a: 1 };

            // Open circle (hollow) — where the function is NOT defined
            if (disc.openAt !== undefined) {
                const pos = this._axes.coordToPoint([disc.x, disc.openAt]);
                const open = new CircleShape({
                    radius: markerRadius,
                    style: {
                        stroke: strokeColor,
                        fill: { r: 0.1, g: 0.1, b: 0.1, a: 1 },
                        strokeWidth: (this._style.strokeWidth ?? 0.03) * 1.5,
                    },
                });
                open.shift(pos[0], pos[1]);
                super.add(open);
            }

            // Closed circle (filled) — where the function IS defined
            if (disc.closedAt !== undefined) {
                const pos = this._axes.coordToPoint([disc.x, disc.closedAt]);
                const closed = new CircleShape({
                    radius: markerRadius,
                    style: {
                        fill: strokeColor,
                        stroke: null,
                    },
                });
                closed.shift(pos[0], pos[1]);
                super.add(closed);
            }
        }
    }

    private addSegment(points: Vec2[]): void {
        const seg = new PolygonShape({
            points,
            closed: false,
            style: this._style,
        });
        super.add(seg);
    }
}

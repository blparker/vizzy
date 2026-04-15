import type { Vec2 } from '../math/vec2';
import type { Style } from '../style/types';
import { Group } from './group';
import { PolygonShape } from './polygon';
import type { Axes } from './axes';

export interface FunctionGraphProps {
    fn: (x: number) => number;
    axes: Axes;
    xRange?: [number, number];
    step?: number;
    discontinuityThreshold?: number;
    style?: Style;
}

export class FunctionGraph extends Group {
    private _axes: Axes;
    private _fn: (x: number) => number;
    private _xRange: [number, number];
    private _step: number;
    private _discontinuityThreshold: number;
    private _style: Style;

    constructor(props: FunctionGraphProps) {
        super();
        (this as { type: string }).type = 'function-graph';

        this._axes = props.axes;
        this._fn = props.fn;
        this._xRange = props.xRange ?? [props.axes.xMin, props.axes.xMax];
        this._step = props.step ?? 0.05;
        this._discontinuityThreshold = props.discontinuityThreshold ?? 100;
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

        let currentSegment: Vec2[] = [];

        for (let x = xMin; x <= xMax; x += step) {
            const y = this._fn(x);

            if (!isFinite(y)) {
                // NaN or Infinity — end current segment
                if (currentSegment.length >= 2) {
                    this.addSegment(currentSegment);
                }
                currentSegment = [];
                continue;
            }

            const point = this._axes.coordToPoint([x, y]);

            if (currentSegment.length > 0) {
                const prev = currentSegment[currentSegment.length - 1]!;
                const dy = Math.abs(point[1] - prev[1]);
                if (dy > threshold) {
                    // Discontinuity — break the segment
                    if (currentSegment.length >= 2) {
                        this.addSegment(currentSegment);
                    }
                    currentSegment = [];
                    continue;
                }
            }

            currentSegment.push(point);
        }

        // Flush final segment
        if (currentSegment.length >= 2) {
            this.addSegment(currentSegment);
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

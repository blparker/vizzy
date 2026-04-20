import type { Vec2 } from '../math/vec2';
import * as M from '../math/mat3';
import type { Style } from '../style/types';
import type { Color } from '../math/color';
import type { Camera } from '../scene/camera';
import { Group } from './group';
import { TextShape } from './text';
import { NumberLine, type NumberLineProps } from './number-line';
import { FunctionGraph, type FunctionGraphProps } from './function-graph';

export interface AxesProps {
    xRange?: [number, number] | [number, number, number];
    yRange?: [number, number] | [number, number, number];
    xLength?: number;
    yLength?: number;
    color?: Color | string;
    style?: Style;
    includeNumbers?: boolean;
    includeTicks?: boolean;
    includeTip?: boolean;
    xLabel?: string;
    yLabel?: string;
    labelFontSize?: number;
    xAxis?: Partial<NumberLineProps>;
    yAxis?: Partial<NumberLineProps>;
    autoFrame?: boolean;
    padding?: number;
}

export class Axes extends Group {
    readonly xAxis: NumberLine;
    readonly yAxis: NumberLine;

    private _xMin: number;
    private _xMax: number;
    private _xLength: number;
    private _yMin: number;
    private _yMax: number;
    private _yLength: number;
    private _xOriginOffset: number;
    private _yOriginOffset: number;
    readonly autoFrame: boolean;
    readonly framePadding: number;

    constructor(props: AxesProps = {}) {
        super();
        (this as { type: string }).type = 'axes';

        const xRange = props.xRange ?? [-5, 5, 1];
        const yRange = props.yRange ?? [-3, 3, 1];

        this._xMin = xRange[0];
        this._xMax = xRange[1];
        this._yMin = yRange[0];
        this._yMax = yRange[1];
        this._xLength = props.xLength ?? this._xMax - this._xMin;
        this._yLength = props.yLength ?? this._yMax - this._yMin;
        this.autoFrame = props.autoFrame ?? true;
        this.framePadding = props.padding ?? 1;

        const color = props.color;
        const style = props.style;
        const includeNumbers = props.includeNumbers ?? false;
        const includeTicks = props.includeTicks ?? true;
        const includeTip = props.includeTip ?? false;

        // X axis: horizontal, shifted so that coordinate 0 is at local x=0
        this.xAxis = new NumberLine({
            range: xRange,
            length: this._xLength,
            includeNumbers,
            includeTicks,
            includeTip,
            ...(color !== undefined ? { color } : {}),
            ...(style !== undefined ? { style } : {}),
            labelDirection: 1,
            labelsToExclude: [0],
            ...props.xAxis,
        });
        this._xOriginOffset = -this.xAxis.numberToLocal(0);
        this.xAxis.shift(this._xOriginOffset, 0);
        const xOriginOffset = this._xOriginOffset;

        // Y axis: vertical (rotated 90 degrees CCW), shifted so that coordinate 0 is at local y=0
        this.yAxis = new NumberLine({
            range: yRange,
            length: this._yLength,
            includeNumbers,
            includeTicks,
            includeTip,
            ...(color !== undefined ? { color } : {}),
            ...(style !== undefined ? { style } : {}),
            labelDirection: -1,
            labelsToExclude: [0],
            labelRotation: -Math.PI / 2,
            ...props.yAxis,
        });
        this._yOriginOffset = -this.yAxis.numberToLocal(0);
        const yOriginOffset = this._yOriginOffset;
        // Rotation + shift: first shift along the number line's local axis, then rotate
        this.yAxis.transform = M.multiply(M.rotation(Math.PI / 2), M.translation(yOriginOffset, 0));

        super.add(this.xAxis, this.yAxis);

        // Axis labels (placed near the arrow tips)
        // Position adapts based on where the axis sits in the range:
        // - x-label goes above the axis if origin is at bottom (yMin ~= 0), below otherwise
        // - y-label goes to the right if origin is at left (xMin ~= 0), left otherwise
        const labelColor = color ?? { r: 1, g: 1, b: 1, a: 1 };
        const labelFontSize = props.labelFontSize ?? 0.3;

        if (props.xLabel) {
            const xTipX = this.xAxis.numberToLocal(this._xMax) + xOriginOffset + (includeTip ? 0.4 : 0.2);
            // If axis is at the bottom of the range, label goes above; otherwise below
            const yRatio = (0 - this._yMin) / (this._yMax - this._yMin);
            const labelAbove = yRatio < 0.3;
            const yOffset = labelAbove ? 0.35 : -0.35;
            const xLabelShape = new TextShape({
                content: props.xLabel,
                position: [xTipX, yOffset],
                style: {
                    fill: labelColor,
                    stroke: null,
                    fontSize: labelFontSize,
                    textAlign: 'left',
                },
            });
            super.add(xLabelShape);
        }

        if (props.yLabel) {
            const yTipY = this.yAxis.numberToLocal(this._yMax) + yOriginOffset + (includeTip ? 0.4 : 0.2);
            // If axis is at the left of the range, label goes right; otherwise left
            const xRatio = (0 - this._xMin) / (this._xMax - this._xMin);
            const labelRight = xRatio < 0.3;
            const xOffset = labelRight ? 0.35 : -0.35;
            const textAlign = labelRight ? ('left' as const) : ('right' as const);
            const yLabelShape = new TextShape({
                content: props.yLabel,
                position: [xOffset, yTipY],
                style: {
                    fill: labelColor,
                    stroke: null,
                    fontSize: labelFontSize,
                    textAlign,
                },
            });
            super.add(yLabelShape);
        }
    }

    /** Convert an (x, y) coordinate to a local-space point */
    private coordToLocal(coord: [number, number]): Vec2 {
        const x = this.xAxis.numberToLocal(coord[0]) + this._xOriginOffset;
        const y = this.yAxis.numberToLocal(coord[1]) + this._yOriginOffset;
        return [x, y];
    }

    /** Convert an (x, y) coordinate to a world-space point */
    coordToPoint(coord: [number, number]): Vec2 {
        const local = this.coordToLocal(coord);
        return M.transformPoint(this.transform, local);
    }

    /** Shorthand for coordToPoint */
    c2p(coord: [number, number]): Vec2 {
        return this.coordToPoint(coord);
    }

    /** Convert a world-space point back to (x, y) coordinates */
    pointToCoord(point: Vec2): [number, number] {
        const inv = M.invert(this.transform);
        if (!inv) return [0, 0];
        const local = M.transformPoint(inv, point);

        // Reverse the origin offsets, then convert local position to range value
        const localX = local[0] - this._xOriginOffset;
        const localY = local[1] - this._yOriginOffset;
        const xT = (localX + this._xLength / 2) / this._xLength;
        const yT = (localY + this._yLength / 2) / this._yLength;

        return [this._xMin + xT * (this._xMax - this._xMin), this._yMin + yT * (this._yMax - this._yMin)];
    }

    /** Shorthand for pointToCoord */
    p2c(point: Vec2): [number, number] {
        return this.pointToCoord(point);
    }

    plot(fn: (x: number) => number, opts?: Omit<FunctionGraphProps, 'fn' | 'axes'>): FunctionGraph {
        const graph = new FunctionGraph({ fn, axes: this, ...opts });
        return graph;
    }

    get xMin(): number {
        return this._xMin;
    }
    get xMax(): number {
        return this._xMax;
    }
    get yMin(): number {
        return this._yMin;
    }
    get yMax(): number {
        return this._yMax;
    }

    frameCamera(camera: Camera, padding?: number): void {
        // Center the camera on the midpoint of the axes ranges
        const cx = (this._xMin + this._xMax) / 2;
        const cy = (this._yMin + this._yMax) / 2;
        camera.center = this.coordToPoint([cx, cy]);

        // Set world dimensions to show the full axes range plus padding
        const pad = padding ?? this.framePadding;
        camera.worldWidth = this._xLength + pad * 2;
        camera.worldHeight = this._yLength + pad * 2;
    }
}

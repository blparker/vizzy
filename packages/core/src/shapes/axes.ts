import type { Vec2 } from '../math/vec2';
import * as M from '../math/mat3';
import type { Style } from '../style/types';
import type { Color } from '../math/color';
import { Group } from './group';
import { NumberLine, type NumberLineProps } from './number-line';

export interface AxesProps {
    xRange?: [number, number] | [number, number, number];
    yRange?: [number, number] | [number, number, number];
    xLength?: number;
    yLength?: number;
    color?: Color | string;
    style?: Style;
    includeNumbers?: boolean;
    includeTip?: boolean;
    xAxis?: Partial<NumberLineProps>;
    yAxis?: Partial<NumberLineProps>;
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

    constructor(props: AxesProps = {}) {
        super();
        (this as { type: string }).type = 'axes';

        const xRange = props.xRange ?? [-5, 5, 1];
        const yRange = props.yRange ?? [-3, 3, 1];

        this._xMin = xRange[0];
        this._xMax = xRange[1];
        this._yMin = yRange[0];
        this._yMax = yRange[1];
        this._xLength = props.xLength ?? (this._xMax - this._xMin);
        this._yLength = props.yLength ?? (this._yMax - this._yMin);

        const color = props.color;
        const style = props.style;
        const includeNumbers = props.includeNumbers ?? false;
        const includeTip = props.includeTip ?? false;

        // X axis — horizontal
        this.xAxis = new NumberLine({
            range: xRange,
            length: this._xLength,
            includeNumbers,
            includeTip,
            ...color !== undefined ? { color } : {},
            ...style !== undefined ? { style } : {},
            labelDirection: 1,
            ...props.xAxis,
        });

        // Y axis — vertical (rotated 90 degrees CCW)
        this.yAxis = new NumberLine({
            range: yRange,
            length: this._yLength,
            includeNumbers,
            includeTip,
            ...color !== undefined ? { color } : {},
            ...style !== undefined ? { style } : {},
            labelDirection: -1,
            labelsToExclude: [0],
            ...props.yAxis,
        });
        // Rotate the y-axis 90 degrees counter-clockwise
        this.yAxis.transform = M.rotation(Math.PI / 2);

        super.add(this.xAxis, this.yAxis);
    }

    /** Convert an (x, y) coordinate to a local-space point */
    private coordToLocal(coord: [number, number]): Vec2 {
        const x = this.xAxis.numberToLocal(coord[0]);
        const y = this.yAxis.numberToLocal(coord[1]);
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

        const xT = (local[0] + this._xLength / 2) / this._xLength;
        const yT = (local[1] + this._yLength / 2) / this._yLength;

        return [
            this._xMin + xT * (this._xMax - this._xMin),
            this._yMin + yT * (this._yMax - this._yMin),
        ];
    }

    /** Shorthand for pointToCoord */
    p2c(point: Vec2): [number, number] {
        return this.pointToCoord(point);
    }

    get xMin(): number { return this._xMin; }
    get xMax(): number { return this._xMax; }
    get yMin(): number { return this._yMin; }
    get yMax(): number { return this._yMax; }
}

import type { Vec2 } from '../math/vec2';
import * as M from '../math/mat3';
import type { Style } from '../style/types';
import type { Color } from '../math/color';
import { Group } from './group';
import { LineShape } from './line';
import { TextShape } from './text';
import { PolygonShape } from './polygon';

export interface NumberLineProps {
    /** [min, max] or [min, max, step] */
    range?: [number, number] | [number, number, number];
    /** Total length in world units (default: max - min) */
    length?: number;
    /** Line color */
    color?: Color | string;
    style?: Style;

    // Ticks
    includeTicks?: boolean;
    tickSize?: number;
    /** Values that get longer ticks */
    bigTickValues?: number[];
    bigTickMultiple?: number;

    // Numbers / labels
    includeNumbers?: boolean;
    /** Which side of the line to place labels: 1 = below/right, -1 = above/left */
    labelDirection?: number;
    labelOffset?: number;
    labelFontSize?: number;
    labelsToExclude?: number[];
    decimalPlaces?: number;

    // Tips (arrow ends)
    includeTip?: boolean;
    tipSize?: number;
}

export class NumberLine extends Group {
    private _min: number;
    private _max: number;
    private _step: number;
    private _length: number;
    private _unitSize: number;

    constructor(props: NumberLineProps = {}) {
        const range = props.range ?? [-5, 5, 1];
        const min = range[0];
        const max = range[1];
        const step = range[2] ?? 1;
        const length = props.length ?? (max - min);
        const unitSize = length / (max - min);

        const color = props.color ?? { r: 1, g: 1, b: 1, a: 1 };
        const lineStyle: Style = {
            stroke: color,
            strokeWidth: 0.03,
            fill: null,
            ...props.style,
        };

        super(lineStyle);
        (this as { type: string }).type = 'number-line';

        this._min = min;
        this._max = max;
        this._step = step;
        this._length = length;
        this._unitSize = unitSize;

        const halfLen = length / 2;

        // Main line
        const mainLine = new LineShape({
            start: [-halfLen, 0],
            end: [halfLen, 0],
            style: lineStyle,
        });
        super.add(mainLine);

        // Arrow tips — offset past the last tick so they don't overlap
        if (props.includeTip) {
            const tipSize = props.tipSize ?? 0.15;
            const tipHW = tipSize * 0.4;
            const tipGap = tipSize * 0.6;

            const leftBase = -halfLen - tipGap;
            const rightBase = halfLen + tipGap;

            const leftTip = new PolygonShape({
                points: [
                    [leftBase - tipSize, 0],
                    [leftBase, tipHW],
                    [leftBase, -tipHW],
                ],
                style: { fill: color, stroke: null },
            });
            const rightTip = new PolygonShape({
                points: [
                    [rightBase + tipSize, 0],
                    [rightBase, tipHW],
                    [rightBase, -tipHW],
                ],
                style: { fill: color, stroke: null },
            });
            mainLine.start = [leftBase, 0];
            mainLine.end = [rightBase, 0];
            super.add(leftTip, rightTip);
        }

        // Ticks
        const includeTicks = props.includeTicks ?? true;
        const tickSize = props.tickSize ?? 0.1;
        const bigTickValues = new Set(props.bigTickValues ?? [0]);
        const bigMult = props.bigTickMultiple ?? 1.5;

        if (includeTicks) {
            for (let v = min; v <= max; v = +(v + step).toFixed(10)) {
                const x = this.numberToLocal(v);
                const isBig = bigTickValues.has(v);
                const ts = isBig ? tickSize * bigMult : tickSize;
                super.add(new LineShape({
                    start: [x, -ts],
                    end: [x, ts],
                    style: lineStyle,
                }));
            }
        }

        // Number labels
        if (props.includeNumbers) {
            const dir = props.labelDirection ?? 1;
            const offset = props.labelOffset ?? 0.25;
            const fontSize = props.labelFontSize ?? 0.2;
            const exclude = new Set(props.labelsToExclude ?? []);
            const decimals = props.decimalPlaces ?? (step % 1 === 0 ? 0 : 1);

            for (let v = min; v <= max; v = +(v + step).toFixed(10)) {
                if (exclude.has(v)) continue;
                const x = this.numberToLocal(v);
                const label = new TextShape({
                    content: decimals > 0 ? v.toFixed(decimals) : String(v),
                    position: [x, -dir * offset],
                    style: {
                        fill: color,
                        stroke: null,
                        fontSize,
                    },
                });
                super.add(label);
            }
        }
    }

    get min(): number { return this._min; }
    get max(): number { return this._max; }
    get step(): number { return this._step; }

    /** Convert a number value to a local-space x coordinate */
    numberToLocal(value: number): number {
        const t = (value - this._min) / (this._max - this._min);
        return -this._length / 2 + t * this._length;
    }

    /** Convert a number value to a world-space point (accounting for transform) */
    numberToPoint(value: number): Vec2 {
        const localX = this.numberToLocal(value);
        return M.transformPoint(this.transform, [localX, 0]);
    }

    /** Shorthand */
    n2p(value: number): Vec2 {
        return this.numberToPoint(value);
    }
}

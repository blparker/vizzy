import type { Vec2 } from '../math/vec2';
import { sub, normalize, scale, add, length } from '../math/vec2';
import type { Style } from '../style/types';
import { Group } from './group';
import { LineShape } from './line';
import { PolygonShape } from './polygon';

export interface ArrowProps {
    start?: Vec2;
    end?: Vec2;
    tipSize?: number;
    style?: Style;
}

export class ArrowShape extends Group {
    private _start: Vec2;
    private _end: Vec2;
    private _tipSize: number;
    private _line: LineShape;
    private _tip: PolygonShape;

    constructor(props: ArrowProps = {}) {
        super(props.style);
        (this as { type: string }).type = 'arrow';

        this._start = props.start ?? [-1, 0];
        this._end = props.end ?? [1, 0];
        this._tipSize = props.tipSize ?? 0.2;

        this._line = new LineShape({ style: { fill: null } });
        this._tip = new PolygonShape({ style: { stroke: null } });
        super.add(this._line, this._tip);

        this._rebuild();
    }

    get start(): Vec2 { return this._start; }
    set start(v: Vec2) { this._start = v; this._rebuild(); }

    get end(): Vec2 { return this._end; }
    set end(v: Vec2) { this._end = v; this._rebuild(); }

    get tipSize(): number { return this._tipSize; }
    set tipSize(v: number) { this._tipSize = v; this._rebuild(); }

    private _rebuild(): void {
        const dir = sub(this._end, this._start);
        const len = length(dir);
        if (len === 0) return;

        const unitDir = normalize(dir);
        const perp: Vec2 = [-unitDir[1], unitDir[0]];

        // Line ends before the tip
        const tipBase = sub(this._end, scale(unitDir, this._tipSize));
        this._line.start = this._start;
        this._line.end = tipBase;

        // Triangle tip
        const halfWidth = this._tipSize * 0.4;
        this._tip.points = [
            this._end,
            add(tipBase, scale(perp, halfWidth)),
            add(tipBase, scale(perp, -halfWidth)),
        ];
    }
}

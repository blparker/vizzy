import type { Vec2 } from '../math/vec2';
import { sub, add as addVec, scale as scaleVec, normalize } from '../math/vec2';
import type { Color } from '../math/color';
import type { Style } from '../style/types';
import { CircleShape, type CircleProps } from './circle';
import { RectShape, type RectProps } from './rect';
import { LineShape, type LineProps } from './line';
import { PolygonShape, type PolygonProps, regularPolygonPoints, type RegularPolygonProps } from './polygon';
import { ArcShape, type ArcProps } from './arc';
import { TextShape, type TextProps } from './text';
import { ArrowShape, type ArrowProps } from './arrow';
import { TexShape, type TexProps } from './tex';
import { NumberLine, type NumberLineProps } from './number-line';
import { Axes, type AxesProps } from './axes';
import { FunctionGraph, type FunctionGraphProps } from './function-graph';
import { BraceShape, type BraceProps } from './brace';
import { AngleShape, type AngleProps } from './angle';
import { Group } from './group';
import type { Shape } from './shape';

export function circle(props?: CircleProps): CircleShape {
    return new CircleShape(props);
}

export function rect(props?: RectProps): RectShape {
    return new RectShape(props);
}

export function line(props?: LineProps): LineShape {
    return new LineShape(props);
}

export function polygon(props?: PolygonProps): PolygonShape {
    return new PolygonShape(props);
}

export function regularPolygon(props: RegularPolygonProps = {}): PolygonShape {
    const center = props.center ?? [0, 0];
    const radius = props.radius ?? 1;
    const sides = props.sides ?? 6;
    return new PolygonShape({
        points: regularPolygonPoints(center, radius, sides),
        style: props.style,
    });
}

export function triangle(props: Omit<RegularPolygonProps, 'sides'> = {}): PolygonShape {
    return regularPolygon({ ...props, sides: 3 });
}

export function arc(props?: ArcProps): ArcShape {
    return new ArcShape(props);
}

export function text(props?: TextProps): TextShape {
    return new TextShape(props);
}

export function arrow(props?: ArrowProps): ArrowShape {
    return new ArrowShape(props);
}

export function tex(props?: TexProps): TexShape {
    return new TexShape(props);
}

export function numberLine(props?: NumberLineProps): NumberLine {
    return new NumberLine(props);
}

export function axes(props?: AxesProps): Axes {
    return new Axes(props);
}

export function functionGraph(props: FunctionGraphProps): FunctionGraph {
    return new FunctionGraph(props);
}

export function brace(props?: BraceProps): BraceShape {
    return new BraceShape(props);
}

export interface DotProps {
    position?: Vec2;
    radius?: number;
    color?: Color | string;
    style?: Style;
}

export function point(props: DotProps = {}): CircleShape {
    const color = props.color ?? { r: 1, g: 1, b: 1, a: 1 };
    const c = new CircleShape({
        radius: props.radius ?? 0.08,
        style: {
            fill: color,
            stroke: null,
            ...props.style,
        },
    });
    if (props.position) {
        c.shift(props.position[0], props.position[1]);
    }
    return c;
}

export interface DashedLineProps extends LineProps {
    dashPattern?: number[];
}

export function dashedLine(props: DashedLineProps = {}): LineShape {
    return new LineShape({
        ...props,
        style: {
            lineDash: props.dashPattern ?? [0.1, 0.05],
            ...props.style,
        },
    });
}

export function angleShape(props: AngleProps): AngleShape {
    return new AngleShape(props);
}

export interface LineThroughProps {
    p1: Vec2;
    p2: Vec2;
    extend?: number;
    extendStart?: number;
    extendEnd?: number;
    style?: Style;
}

export function lineThrough(props: LineThroughProps): LineShape {
    const { p1, p2 } = props;
    const dir = normalize(sub(p2, p1));
    const extendStart = props.extendStart ?? props.extend ?? 0.5;
    const extendEnd = props.extendEnd ?? props.extend ?? 0.5;
    const start: Vec2 = addVec(p1, scaleVec(dir, -extendStart));
    const end: Vec2 = addVec(p2, scaleVec(dir, extendEnd));
    return new LineShape({
        start,
        end,
        style: props.style,
    });
}

export interface TangentLineProps {
    fn: (x: number) => number;
    axes: Axes;
    x: number;
    length?: number;
    dx?: number;
    style?: Style;
}

export function tangentLine(props: TangentLineProps): LineShape {
    const { fn, axes, x } = props;
    const halfLength = (props.length ?? 4) / 2;
    const dx = props.dx ?? 0.0001;

    // Numerical derivative
    const slope = (fn(x + dx) - fn(x - dx)) / (2 * dx);
    const y = fn(x);

    // Two points on the tangent line in axes coordinates
    const x1 = x - halfLength;
    const x2 = x + halfLength;
    const y1 = y + slope * (x1 - x);
    const y2 = y + slope * (x2 - x);

    return new LineShape({
        start: axes.coordToPoint([x1, y1]),
        end: axes.coordToPoint([x2, y2]),
        style: {
            stroke: { r: 1, g: 1, b: 0, a: 1 },
            strokeWidth: 0.03,
            ...props.style,
        },
    });
}

// --- Edge Labels ---

export type EdgePosition = 'top' | 'bottom' | 'left' | 'right' | 'center';

export interface EdgeLabelProps {
    shape: Shape;
    edge: EdgePosition;
    content: string;
    offset?: number;
    style?: Style;
}

export function edgeLabel(props: EdgeLabelProps): TextShape {
    const { shape, edge, content } = props;
    const buffer = props.offset ?? 0.25;

    let position: Vec2;
    let textAlign: 'left' | 'center' | 'right' = 'center';

    const edgePoint = shape[edge];

    switch (edge) {
        case 'top':
            position = [edgePoint[0], edgePoint[1] + buffer];
            break;
        case 'bottom':
            position = [edgePoint[0], edgePoint[1] - buffer];
            break;
        case 'left':
            position = [edgePoint[0] - buffer, edgePoint[1]];
            textAlign = 'right';
            break;
        case 'right':
            position = [edgePoint[0] + buffer, edgePoint[1]];
            textAlign = 'left';
            break;
        case 'center':
        default:
            position = [edgePoint[0], edgePoint[1] + buffer];
            break;
    }

    return new TextShape({
        content,
        position,
        style: {
            fill: { r: 1, g: 1, b: 1, a: 1 },
            stroke: null,
            fontSize: 0.22,
            textAlign,
            ...props.style,
        },
    });
}

// --- Line / Segment Labels ---

export interface LineLabelProps {
    start: Vec2;
    end: Vec2;
    content: string;
    offset?: number;
    side?: 1 | -1;
    style?: Style;
}

export function lineLabel(props: LineLabelProps): TextShape {
    const { start, end, content } = props;
    const offset = props.offset ?? 0.2;
    const side = props.side ?? 1;

    // Midpoint of the segment
    const mx = (start[0] + end[0]) / 2;
    const my = (start[1] + end[1]) / 2;

    // Perpendicular direction (rotated 90° from the line direction)
    const dx = end[0] - start[0];
    const dy = end[1] - start[1];
    const len = Math.sqrt(dx * dx + dy * dy);
    if (len < 1e-10) {
        return new TextShape({ content, position: [mx, my + offset], style: props.style });
    }

    // Normal: perpendicular to the line, pointing to the given side
    const nx = (-dy / len) * side;
    const ny = (dx / len) * side;

    const position: Vec2 = [mx + nx * offset, my + ny * offset];

    return new TextShape({
        content,
        position,
        style: {
            fill: { r: 1, g: 1, b: 1, a: 1 },
            stroke: null,
            fontSize: 0.22,
            ...props.style,
        },
    });
}

// --- Brace ergonomic helpers ---

export interface BraceOverProps {
    shape: Shape;
    edge?: EdgePosition;
    label?: string;
    sharpness?: number;
    labelOffset?: number;
    style?: Style;
    labelStyle?: Style;
}

export function braceOver(props: BraceOverProps): Group {
    const { shape } = props;
    const edge = props.edge ?? 'top';

    let start: Vec2;
    let end: Vec2;
    let direction: number;
    let labelEdge: EdgePosition;

    switch (edge) {
        case 'top':
            start = [shape.left[0], shape.top[1]];
            end = [shape.right[0], shape.top[1]];
            direction = 1;
            labelEdge = 'top';
            break;
        case 'bottom':
            start = [shape.left[0], shape.bottom[1]];
            end = [shape.right[0], shape.bottom[1]];
            direction = -1;
            labelEdge = 'bottom';
            break;
        case 'left':
            start = [shape.left[0], shape.bottom[1]];
            end = [shape.left[0], shape.top[1]];
            direction = 1;
            labelEdge = 'left';
            break;
        case 'right':
            start = [shape.right[0], shape.bottom[1]];
            end = [shape.right[0], shape.top[1]];
            direction = -1;
            labelEdge = 'right';
            break;
        default:
            start = [shape.left[0], shape.top[1]];
            end = [shape.right[0], shape.top[1]];
            direction = 1;
            labelEdge = 'top';
    }

    const braceShape = new BraceShape({
        start,
        end,
        direction,
        sharpness: props.sharpness,
        style: props.style,
    });

    const g = new Group();
    g.add(braceShape);

    if (props.label) {
        const labelPos = edgeLabel({
            shape: braceShape,
            edge: labelEdge,
            content: props.label,
            offset: props.labelOffset ?? 0.2,
            style: props.labelStyle,
        });
        g.add(labelPos);
    }

    return g;
}

export interface BraceBetweenProps {
    from: Shape;
    to: Shape;
    edge?: EdgePosition;
    label?: string;
    sharpness?: number;
    labelOffset?: number;
    style?: Style;
    labelStyle?: Style;
}

export function braceBetween(props: BraceBetweenProps): Group {
    const { from, to } = props;
    const edge = props.edge ?? 'bottom';

    let start: Vec2;
    let end: Vec2;
    let direction: number;
    let labelEdge: EdgePosition;

    switch (edge) {
        case 'top':
            start = [from.center[0], Math.max(from.top[1], to.top[1])];
            end = [to.center[0], Math.max(from.top[1], to.top[1])];
            direction = 1;
            labelEdge = 'top';
            break;
        case 'bottom':
            start = [from.center[0], Math.min(from.bottom[1], to.bottom[1])];
            end = [to.center[0], Math.min(from.bottom[1], to.bottom[1])];
            direction = -1;
            labelEdge = 'bottom';
            break;
        case 'left':
            start = [Math.min(from.left[0], to.left[0]), from.center[1]];
            end = [Math.min(from.left[0], to.left[0]), to.center[1]];
            direction = 1;
            labelEdge = 'left';
            break;
        case 'right':
            start = [Math.max(from.right[0], to.right[0]), from.center[1]];
            end = [Math.max(from.right[0], to.right[0]), to.center[1]];
            direction = -1;
            labelEdge = 'right';
            break;
        default:
            start = [from.center[0], Math.min(from.bottom[1], to.bottom[1])];
            end = [to.center[0], Math.min(from.bottom[1], to.bottom[1])];
            direction = -1;
            labelEdge = 'bottom';
    }

    const braceShape = new BraceShape({
        start,
        end,
        direction,
        sharpness: props.sharpness,
        style: props.style,
    });

    const g = new Group();
    g.add(braceShape);

    if (props.label) {
        const labelPos = edgeLabel({
            shape: braceShape,
            edge: labelEdge,
            content: props.label,
            offset: props.labelOffset ?? 0.2,
            style: props.labelStyle,
        });
        g.add(labelPos);
    }

    return g;
}

// --- Label helper (auto-positioned text near a shape) ---

export type Direction = Vec2;

export interface LabelProps {
    content: string;
    direction?: Direction;
    offset?: number;
    style?: Style;
}

export function label(shape: Shape, content: string, direction?: Direction, opts?: { offset?: number; style?: Style }): TextShape {
    const dir = direction ?? [0, 1]; // default: above
    const offset = opts?.offset ?? 0.25;

    // Use the edge point in the given direction as anchor
    let anchor: Vec2;
    if (dir[1] > 0.5 && Math.abs(dir[0]) < 0.5) {
        anchor = shape.top;
    } else if (dir[1] < -0.5 && Math.abs(dir[0]) < 0.5) {
        anchor = shape.bottom;
    } else if (dir[0] > 0.5 && Math.abs(dir[1]) < 0.5) {
        anchor = shape.right;
    } else if (dir[0] < -0.5 && Math.abs(dir[1]) < 0.5) {
        anchor = shape.left;
    } else {
        anchor = shape.center;
    }

    const position: Vec2 = [
        anchor[0] + dir[0] * offset,
        anchor[1] + dir[1] * offset,
    ];

    let textAlign: 'left' | 'center' | 'right' = 'center';
    if (dir[0] > 0.5) textAlign = 'left';
    else if (dir[0] < -0.5) textAlign = 'right';

    return new TextShape({
        content,
        position,
        style: {
            fill: { r: 1, g: 1, b: 1, a: 1 },
            stroke: null,
            fontSize: 0.22,
            textAlign,
            ...opts?.style,
        },
    });
}

// --- Trivial shape factories ---

export interface SquareProps {
    size?: number;
    cornerRadius?: number;
    style?: Style;
}

export function square(props: SquareProps = {}): RectShape {
    const size = props.size ?? 2;
    return new RectShape({
        width: size,
        height: size,
        cornerRadius: props.cornerRadius,
        style: props.style,
    });
}

export interface EllipseProps {
    rx?: number;
    ry?: number;
    style?: Style;
}

export function ellipse(props: EllipseProps = {}): CircleShape {
    const rx = props.rx ?? 1;
    const ry = props.ry ?? 0.6;
    const c = new CircleShape({
        radius: 1,
        style: props.style,
    });
    c.scale(rx, ry);
    return c;
}

export interface DoubleArrowProps {
    start?: Vec2;
    end?: Vec2;
    tipSize?: number;
    style?: Style;
}

export function doubleArrow(props: DoubleArrowProps = {}): Group {
    const start = props.start ?? [-1, 0];
    const end = props.end ?? [1, 0];
    const tipSize = props.tipSize ?? 0.2;
    const dir = normalize(sub(end, start));
    const perp: Vec2 = [-dir[1], dir[0]];
    const halfW = tipSize * 0.4;

    // Line shortened on both ends
    const startBase = addVec(start, scaleVec(dir, tipSize));
    const endBase = addVec(end, scaleVec(dir, -tipSize));
    const l = new LineShape({ start: startBase, end: endBase, style: { fill: null, lineCap: 'butt', ...props.style } });

    // Tip at end
    const tipEnd = new PolygonShape({
        points: [end, addVec(endBase, scaleVec(perp, halfW)), addVec(endBase, scaleVec(perp, -halfW))],
        closed: true,
        style: { fill: props.style?.stroke ?? { r: 1, g: 1, b: 1, a: 1 }, stroke: null },
    });

    // Tip at start (pointing backward)
    const tipStart = new PolygonShape({
        points: [start, addVec(startBase, scaleVec(perp, halfW)), addVec(startBase, scaleVec(perp, -halfW))],
        closed: true,
        style: { fill: props.style?.stroke ?? { r: 1, g: 1, b: 1, a: 1 }, stroke: null },
    });

    const g = new Group(props.style);
    g.add(l, tipEnd, tipStart);
    return g;
}

export interface VectorProps {
    direction?: Vec2;
    style?: Style;
    tipSize?: number;
}

export function vector(props: VectorProps = {}): ArrowShape {
    const dir = props.direction ?? [1, 0];
    return new ArrowShape({
        start: [0, 0],
        end: dir,
        tipSize: props.tipSize,
        style: props.style,
    });
}

export interface StarProps {
    points?: number;
    outerRadius?: number;
    innerRadius?: number;
    center?: Vec2;
    style?: Style;
}

export function star(props: StarProps = {}): PolygonShape {
    const n = props.points ?? 5;
    const outer = props.outerRadius ?? 1;
    const inner = props.innerRadius ?? outer * 0.4;
    const cx = props.center?.[0] ?? 0;
    const cy = props.center?.[1] ?? 0;

    const pts: Vec2[] = [];
    for (let i = 0; i < n * 2; i++) {
        const angle = Math.PI / 2 + (Math.PI * i) / n;
        const r = i % 2 === 0 ? outer : inner;
        pts.push([cx + r * Math.cos(angle), cy + r * Math.sin(angle)]);
    }
    return new PolygonShape({ points: pts, closed: true, style: props.style });
}

export interface RightAngleProps {
    vertex: Vec2;
    point1: Vec2;
    point2: Vec2;
    size?: number;
    style?: Style;
}

export function rightAngle(props: RightAngleProps): PolygonShape {
    const { vertex, point1, point2 } = props;
    const size = props.size ?? 0.25;

    const dir1 = normalize(sub(point1, vertex));
    const dir2 = normalize(sub(point2, vertex));

    const corner1: Vec2 = addVec(vertex, scaleVec(dir1, size));
    const corner2: Vec2 = addVec(vertex, scaleVec(dir2, size));
    const corner3: Vec2 = addVec(addVec(vertex, scaleVec(dir1, size)), scaleVec(dir2, size));

    return new PolygonShape({
        points: [corner1, corner3, corner2],
        closed: false,
        style: {
            stroke: { r: 1, g: 1, b: 1, a: 1 },
            fill: null,
            strokeWidth: 0.03,
            ...props.style,
        },
    });
}

export interface CurvedArrowProps {
    start?: Vec2;
    end?: Vec2;
    angle?: number;
    tipSize?: number;
    style?: Style;
}

export function curvedArrow(props: CurvedArrowProps = {}): Group {
    const start = props.start ?? [-1, 0];
    const end = props.end ?? [1, 0];
    const bendAngle = props.angle ?? Math.PI / 4;
    const tipSize = props.tipSize ?? 0.15;

    const mid = addVec(start, scaleVec(sub(end, start), 0.5));
    const diff = sub(end, start);
    const perp: Vec2 = [-diff[1], diff[0]];
    const perpNorm = normalize(perp);
    const dist = Math.sqrt(diff[0] * diff[0] + diff[1] * diff[1]);
    const arcMid: Vec2 = addVec(mid, scaleVec(perpNorm, dist * Math.tan(bendAngle) * 0.5));

    // Sample a quadratic bezier as points, stopping short of end for the tip
    const n = 20;
    const allPts: Vec2[] = [];
    for (let i = 0; i <= n; i++) {
        const t = i / n;
        const u = 1 - t;
        allPts.push([
            u * u * start[0] + 2 * u * t * arcMid[0] + t * t * end[0],
            u * u * start[1] + 2 * u * t * arcMid[1] + t * t * end[1],
        ]);
    }

    // Compute tip direction from the last two points
    const lastDir = normalize(sub(allPts[n]!, allPts[n - 1]!));
    const tipPerp: Vec2 = [-lastDir[1], lastDir[0]];
    const tipBase = addVec(end, scaleVec(lastDir, -tipSize));

    // Truncate curve at tip base
    const pts = allPts.slice(0, -1);
    pts.push(tipBase);

    const curve = new PolygonShape({
        points: pts,
        closed: false,
        style: {
            stroke: { r: 1, g: 1, b: 1, a: 1 },
            fill: null,
            strokeWidth: 0.04,
            lineCap: 'butt',
            ...props.style,
        },
    });
    const tip = new PolygonShape({
        points: [
            end,
            addVec(tipBase, scaleVec(tipPerp, tipSize * 0.4)),
            addVec(tipBase, scaleVec(tipPerp, -tipSize * 0.4)),
        ],
        closed: true,
        style: { fill: props.style?.stroke ?? { r: 1, g: 1, b: 1, a: 1 }, stroke: null },
    });

    const g = new Group();
    g.add(curve, tip);
    return g;
}

export interface SurroundingRectangleProps {
    shape: Shape;
    padding?: number;
    cornerRadius?: number;
    style?: Style;
}

export function surroundingRectangle(props: SurroundingRectangleProps): RectShape {
    const { shape } = props;
    const padding = props.padding ?? 0.2;

    const w = shape.width + padding * 2;
    const h = shape.height + padding * 2;
    const center = shape.center;

    const r = new RectShape({
        width: w,
        height: h,
        cornerRadius: props.cornerRadius ?? 0.1,
        style: {
            stroke: { r: 1, g: 1, b: 0, a: 1 },
            fill: null,
            strokeWidth: 0.04,
            ...props.style,
        },
    });
    r.moveTo(center);
    return r;
}

export function group(...children: Shape[]): Group {
    const g = new Group();
    if (children.length > 0) {
        g.add(...children);
    }
    return g;
}

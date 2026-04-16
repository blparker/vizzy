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

export function group(...children: Shape[]): Group {
    const g = new Group();
    if (children.length > 0) {
        g.add(...children);
    }
    return g;
}

import type { Vec2 } from '../math/vec2';
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

export function group(...children: Shape[]): Group {
    const g = new Group();
    if (children.length > 0) {
        g.add(...children);
    }
    return g;
}

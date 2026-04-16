import type { Vec2 } from '../math/vec2';
import { sub, angle as vecAngle } from '../math/vec2';
import type { Style } from '../style/types';
import { Group } from './group';
import { ArcShape } from './arc';
import { TextShape } from './text';
import type { LineShape } from './line';

export interface AngleProps {
    vertex: Vec2;
    point1: Vec2;
    point2: Vec2;
    radius?: number;
    label?: string;
    labelFontSize?: number;
    style?: Style;
}

export interface AngleFromLinesProps {
    line1: LineShape;
    line2: LineShape;
    radius?: number;
    label?: string;
    labelFontSize?: number;
    style?: Style;
}

function findIntersection(l1: LineShape, l2: LineShape): Vec2 | null {
    const [x1, y1] = l1.start;
    const [x2, y2] = l1.end;
    const [x3, y3] = l2.start;
    const [x4, y4] = l2.end;

    const denom = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4);
    if (Math.abs(denom) < 1e-10) return null;

    const t = ((x1 - x3) * (y3 - y4) - (y1 - y3) * (x3 - x4)) / denom;
    return [x1 + t * (x2 - x1), y1 + t * (y2 - y1)];
}

export class AngleShape extends Group {
    readonly arc: ArcShape;
    readonly label: TextShape | null;

    static fromLines(props: AngleFromLinesProps): AngleShape {
        const vertex = findIntersection(props.line1, props.line2)
            ?? props.line1.end;
        return new AngleShape({
            vertex,
            point1: props.line1.end,
            point2: props.line2.end,
            radius: props.radius,
            label: props.label,
            labelFontSize: props.labelFontSize,
            style: props.style,
        });
    }

    constructor(props: AngleProps) {
        super();
        (this as { type: string }).type = 'angle';

        const { vertex, point1, point2 } = props;
        const radius = props.radius ?? 0.4;

        // Compute angles from vertex to each point
        const dir1 = sub(point1, vertex);
        const dir2 = sub(point2, vertex);
        let angle1 = vecAngle(dir1);
        let angle2 = vecAngle(dir2);

        // Ensure we draw the smaller angle (counter-clockwise from angle1 to angle2)
        // Normalize so the arc goes the short way
        while (angle2 < angle1) angle2 += Math.PI * 2;
        if (angle2 - angle1 > Math.PI) {
            // Swap to take the shorter arc
            const tmp = angle1;
            angle1 = angle2;
            angle2 = tmp + Math.PI * 2;
        }

        this.arc = new ArcShape({
            center: vertex,
            radius,
            startAngle: angle1,
            endAngle: angle2,
            style: {
                stroke: { r: 1, g: 1, b: 1, a: 1 },
                fill: null,
                strokeWidth: 0.03,
                ...props.style,
            },
        });
        super.add(this.arc);

        // Label at the midpoint of the arc
        if (props.label) {
            const midAngle = (angle1 + angle2) / 2;
            const labelRadius = radius + (props.labelFontSize ?? 0.2) * 0.8;
            const labelPos: Vec2 = [
                vertex[0] + labelRadius * Math.cos(midAngle),
                vertex[1] + labelRadius * Math.sin(midAngle),
            ];
            this.label = new TextShape({
                content: props.label,
                position: labelPos,
                style: {
                    fill: props.style?.stroke ?? { r: 1, g: 1, b: 1, a: 1 },
                    stroke: null,
                    fontSize: props.labelFontSize ?? 0.2,
                },
            });
            super.add(this.label);
        } else {
            this.label = null;
        }
    }
}

import type { Vec2 } from '../math/vec2';
import { sub, normalize, angle as vecAngle } from '../math/vec2';
import type { Style } from '../style/types';
import { Group } from './group';
import { ArcShape } from './arc';
import { TextShape } from './text';

export interface AngleProps {
    vertex: Vec2;
    point1: Vec2;
    point2: Vec2;
    radius?: number;
    label?: string;
    labelFontSize?: number;
    style?: Style;
}

export class AngleShape extends Group {
    readonly arc: ArcShape;
    readonly label: TextShape | null;

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

import type { Style } from '../style/types';
import type { Color } from '../math/color';
import { Group } from './group';
import { LineShape } from './line';
import type { Camera } from '../scene/camera';

export interface GridProps {
    /** Provide the camera to auto-size the grid to the viewport */
    camera?: Camera;
    xMin?: number;
    xMax?: number;
    yMin?: number;
    yMax?: number;
    step?: number;
    style?: Style;
    axisStyle?: Style;
    color?: Color | string;
    axisColor?: Color | string;
}

export function grid(props: GridProps = {}): Group {
    const step = props.step ?? 1;

    // Viewport edges (continuous) — lines extend to these bounds
    // Use visibleWidth/visibleHeight to cover the full canvas including letterbox
    let edgeX: number, edgeY: number;
    if (props.camera) {
        edgeX = props.camera.visibleWidth / 2;
        edgeY = props.camera.visibleHeight / 2;
    } else {
        edgeX = 7;
        edgeY = 4;
    }

    // Grid line positions (snapped to step)
    const xMin = props.xMin ?? -Math.ceil(edgeX / step) * step;
    const xMax = props.xMax ?? Math.ceil(edgeX / step) * step;
    const yMin = props.yMin ?? -Math.ceil(edgeY / step) * step;
    const yMax = props.yMax ?? Math.ceil(edgeY / step) * step;

    // All lines extend to the exact visible edges
    const lineXMin = -edgeX;
    const lineXMax = edgeX;
    const lineYMin = -edgeY;
    const lineYMax = edgeY;

    const color = props.color ?? { r: 0.5, g: 0.5, b: 0.5, a: 0.2 };
    const axisColor = props.axisColor ?? { r: 0.5, g: 0.5, b: 0.5, a: 0.5 };

    const lineStyle: Style = {
        stroke: color,
        strokeWidth: 0.01,
        fill: null,
        ...props.style,
    };

    const axisLineStyle: Style = {
        stroke: axisColor,
        strokeWidth: 0.02,
        fill: null,
        ...props.axisStyle,
    };

    const g = new Group();

    // Vertical lines at step positions, spanning full viewport height
    const drawnX = new Set<number>();
    for (let x = Math.ceil(xMin / step) * step; x <= xMax; x = +(x + step).toFixed(10)) {
        const isAxis = Math.abs(x) < 1e-10;
        g.add(new LineShape({
            start: [x, lineYMin],
            end: [x, lineYMax],
            style: isAxis ? axisLineStyle : lineStyle,
        }));
        drawnX.add(Math.round(x * 1e6));
    }

    // Edge vertical lines at the exact viewport boundary
    for (const ex of [lineXMin, lineXMax]) {
        if (!drawnX.has(Math.round(ex * 1e6))) {
            g.add(new LineShape({
                start: [ex, lineYMin],
                end: [ex, lineYMax],
                style: lineStyle,
            }));
        }
    }

    // Horizontal lines at step positions, spanning full viewport width
    const drawnY = new Set<number>();
    for (let y = Math.ceil(yMin / step) * step; y <= yMax; y = +(y + step).toFixed(10)) {
        const isAxis = Math.abs(y) < 1e-10;
        g.add(new LineShape({
            start: [lineXMin, y],
            end: [lineXMax, y],
            style: isAxis ? axisLineStyle : lineStyle,
        }));
        drawnY.add(Math.round(y * 1e6));
    }

    // Edge horizontal lines at the exact viewport boundary
    for (const ey of [lineYMin, lineYMax]) {
        if (!drawnY.has(Math.round(ey * 1e6))) {
            g.add(new LineShape({
                start: [lineXMin, ey],
                end: [lineXMax, ey],
                style: lineStyle,
            }));
        }
    }

    return g;
}

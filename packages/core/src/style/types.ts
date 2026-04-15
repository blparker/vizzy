import type { Color } from '../math/color';

export interface Style {
    fill?: Color | string | null;
    stroke?: Color | string | null;
    strokeWidth?: number;
    opacity?: number;
    lineCap?: 'butt' | 'round' | 'square';
    lineJoin?: 'miter' | 'round' | 'bevel';
    lineDash?: number[];
    lineDashOffset?: number;
    fontSize?: number;
    fontFamily?: string;
    textAlign?: 'left' | 'center' | 'right';
    textBaseline?: 'top' | 'middle' | 'bottom';
}

export const DEFAULT_STYLE: Readonly<Style> = {
    fill: null,
    stroke: { r: 1, g: 1, b: 1, a: 1 },
    strokeWidth: 0.04,
    opacity: 1,
    lineCap: 'round',
    lineJoin: 'round',
};

export function mergeStyles(base: Style, override: Style): Style {
    const result: Style = { ...base };
    for (const key of Object.keys(override) as (keyof Style)[]) {
        if (override[key] !== undefined) {
            (result as Record<string, unknown>)[key] = override[key];
        }
    }
    return result;
}

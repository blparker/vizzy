import type { Style } from './types';
import { white, black, neutral } from '../math/palette';
import { toHex } from '../math/color';

export interface Theme {
    background: string;
    defaultStyle: Style;
}

export const DARK_THEME: Theme = {
    background: toHex(neutral[900]),
    defaultStyle: {
        fill: null,
        stroke: white,
        strokeWidth: 0.04,
        opacity: 1,
        lineCap: 'round',
        lineJoin: 'round',
    },
};

export const LIGHT_THEME: Theme = {
    background: toHex(white),
    defaultStyle: {
        fill: null,
        stroke: neutral[900],
        strokeWidth: 0.04,
        opacity: 1,
        lineCap: 'round',
        lineJoin: 'round',
    },
};

export const THEMES: Record<string, Theme> = {
    dark: DARK_THEME,
    light: LIGHT_THEME,
};

import type { Example } from '../types';
import { blank } from './blank';
import { shapes } from './shapes';
import { animations } from './animations';
import { textAnimation } from './text-animation';
import { interactive } from './interactive';
import { draggable } from './draggable';
import { functionPlot } from './function-plot';
import { numberLines } from './number-lines';
import { texFormulas } from './tex-formulas';
import { logo } from './logo';

export const examples: Example[] = [
    blank,
    shapes,
    animations,
    textAnimation,
    interactive,
    draggable,
    functionPlot,
    numberLines,
    texFormulas,
    logo,
];

import type { Example } from '../types';
import { blank } from './blank';
import { shapes } from './shapes';
import { animations } from './animations';
import { textAnimation } from './text-animation';
import { interactive } from './interactive';
import { draggable } from './draggable';
import { functionPlot } from './function-plot';
import { calculus } from './calculus';
import { secantTangent } from './secant-tangent';
import { firstQuadrant } from './first-quadrant';
import { annotations } from './annotations';
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
    calculus,
    secantTangent,
    firstQuadrant,
    annotations,
    numberLines,
    texFormulas,
    logo,
];

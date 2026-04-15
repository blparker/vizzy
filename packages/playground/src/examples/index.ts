import type { Example } from '../types';
import { blank } from './blank';
import { shapes } from './shapes';
import { animations } from './animations';
import { textAnimation } from './text-animation';
import { interactive } from './interactive';
import { numberLines } from './number-lines';
import { texFormulas } from './tex-formulas';
import { logo } from './logo';

export const examples: Example[] = [
    blank,
    shapes,
    animations,
    textAnimation,
    interactive,
    numberLines,
    texFormulas,
    logo,
];

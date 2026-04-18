import blank from './blank';
import shapes from './shapes';
import animations from './animations';
import textAnimation from './text-animation';
import interactiveControls from './interactive-controls';
import draggable from './draggable';
import functionPlot from './function-plot';
import functionPlotInteractive from './function-plot-interactive';
import calculus from './calculus';
import secantTangent from './secant-tangent';
import firstQuadrant from './first-quadrant';
import annotations from './annotations';
import moreShapes from './more-shapes';
import numberLines from './number-lines';
import texFormulas from './tex-formulas';
import controls from './controls';
import logo from './logo';
import type { Snippet } from './types';

/** All snippets, used by the playground. */
export const allSnippets = [
    blank,
    shapes,
    animations,
    textAnimation,
    interactiveControls,
    draggable,
    functionPlot,
    functionPlotInteractive,
    calculus,
    secantTangent,
    firstQuadrant,
    annotations,
    moreShapes,
    numberLines,
    texFormulas,
    controls,
    logo,
];

/** Snippets visible in the docs gallery (excludes playgroundOnly) */
export const snippets = allSnippets.filter(s => !s.playgroundOnly);

export function snippetsByCategory(): Record<string, Snippet[]> {
    const grouped: Record<string, Snippet[]> = {};
    for (const s of snippets) {
        if (!grouped[s.category]) grouped[s.category] = [];
        grouped[s.category].push(s);
    }
    return grouped;
}

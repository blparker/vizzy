import type { Example } from '../types';
import { allSnippets } from '../../../docs/snippets/index';

export const examples: Example[] = allSnippets.map(s => ({
    name: s.title,
    source: s.code,
}));

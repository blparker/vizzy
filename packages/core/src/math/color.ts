export interface Color {
    readonly r: number;
    readonly g: number;
    readonly b: number;
    readonly a: number;
}

export function rgba(r: number, g: number, b: number, a: number = 1): Color {
    return { r, g, b, a };
}

export function fromHex(hex: string): Color {
    const h = hex.startsWith('#') ? hex.slice(1) : hex;
    if (h.length === 3 || h.length === 4) {
        const r = parseInt(h[0]! + h[0]!, 16) / 255;
        const g = parseInt(h[1]! + h[1]!, 16) / 255;
        const b = parseInt(h[2]! + h[2]!, 16) / 255;
        const a = h.length === 4 ? parseInt(h[3]! + h[3]!, 16) / 255 : 1;
        return { r, g, b, a };
    }
    const r = parseInt(h.slice(0, 2), 16) / 255;
    const g = parseInt(h.slice(2, 4), 16) / 255;
    const b = parseInt(h.slice(4, 6), 16) / 255;
    const a = h.length === 8 ? parseInt(h.slice(6, 8), 16) / 255 : 1;
    return { r, g, b, a };
}

export function toHex(c: Color): string {
    const r = Math.round(c.r * 255).toString(16).padStart(2, '0');
    const g = Math.round(c.g * 255).toString(16).padStart(2, '0');
    const b = Math.round(c.b * 255).toString(16).padStart(2, '0');
    if (c.a < 1) {
        const a = Math.round(c.a * 255).toString(16).padStart(2, '0');
        return `#${r}${g}${b}${a}`;
    }
    return `#${r}${g}${b}`;
}

export function toCssRgba(c: Color): string {
    return `rgba(${Math.round(c.r * 255)}, ${Math.round(c.g * 255)}, ${Math.round(c.b * 255)}, ${c.a})`;
}

export function lerpColor(a: Color, b: Color, t: number): Color {
    return {
        r: a.r + (b.r - a.r) * t,
        g: a.g + (b.g - a.g) * t,
        b: a.b + (b.b - a.b) * t,
        a: a.a + (b.a - a.a) * t,
    };
}

export function colorToCss(c: Color | string): string {
    if (typeof c === 'string') return c;
    return toCssRgba(c);
}

// Simple named constants — prefer the palette (math/palette.ts) for richer usage
export const WHITE: Color = { r: 1, g: 1, b: 1, a: 1 };
export const BLACK: Color = { r: 0, g: 0, b: 0, a: 1 };

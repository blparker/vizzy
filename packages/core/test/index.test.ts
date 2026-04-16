import { describe, it, expect } from 'vitest';
import { vec2, add, sub, scale, length, normalize, distance } from '../src/math/vec2';
import * as Mat3 from '../src/math/mat3';
import { fromHex, toHex, rgba, lerpColor } from '../src/math/color';
import { lerp, clamp, remap } from '../src/math/lerp';
import { CircleShape } from '../src/shapes/circle';
import { Group } from '../src/shapes/group';
import { circle, group } from '../src/shapes/factories';
import { red, blue, green, sky } from '../src/math/palette';

describe('vec2', () => {
    it('creates a vec2', () => {
        expect(vec2(1, 2)).toEqual([1, 2]);
    });

    it('adds two vectors', () => {
        expect(add([1, 2], [3, 4])).toEqual([4, 6]);
    });

    it('subtracts two vectors', () => {
        expect(sub([3, 4], [1, 2])).toEqual([2, 2]);
    });

    it('scales a vector', () => {
        expect(scale([2, 3], 2)).toEqual([4, 6]);
    });

    it('computes length', () => {
        expect(length([3, 4])).toBe(5);
    });

    it('normalizes a vector', () => {
        const n = normalize([3, 4]);
        expect(n[0]).toBeCloseTo(0.6);
        expect(n[1]).toBeCloseTo(0.8);
    });

    it('computes distance', () => {
        expect(distance([0, 0], [3, 4])).toBe(5);
    });
});

describe('mat3', () => {
    it('identity does not change a point', () => {
        const m = Mat3.identity();
        expect(Mat3.transformPoint(m, [3, 4])).toEqual([3, 4]);
    });

    it('translation moves a point', () => {
        const m = Mat3.translation(10, 20);
        expect(Mat3.transformPoint(m, [1, 2])).toEqual([11, 22]);
    });

    it('scaling scales a point', () => {
        const m = Mat3.scaling(2, 3);
        expect(Mat3.transformPoint(m, [4, 5])).toEqual([8, 15]);
    });

    it('rotation rotates a point 90 degrees', () => {
        const m = Mat3.rotation(Math.PI / 2);
        const p = Mat3.transformPoint(m, [1, 0]);
        expect(p[0]).toBeCloseTo(0);
        expect(p[1]).toBeCloseTo(1);
    });

    it('multiply composes transforms', () => {
        const t = Mat3.translation(5, 0);
        const s = Mat3.scaling(2, 2);
        // Scale then translate: point [1,0] -> [2,0] -> [7,0]
        const m = Mat3.multiply(t, s);
        const p = Mat3.transformPoint(m, [1, 0]);
        expect(p[0]).toBeCloseTo(7);
        expect(p[1]).toBeCloseTo(0);
    });

    it('invert produces an inverse', () => {
        const m = Mat3.translation(3, 7);
        const inv = Mat3.invert(m);
        expect(inv).not.toBeNull();
        const p = Mat3.transformPoint(Mat3.multiply(m, inv!), [5, 9]);
        expect(p[0]).toBeCloseTo(5);
        expect(p[1]).toBeCloseTo(9);
    });
});

describe('color', () => {
    it('parses hex colors', () => {
        const c = fromHex('#ff0000');
        expect(c.r).toBeCloseTo(1);
        expect(c.g).toBeCloseTo(0);
        expect(c.b).toBeCloseTo(0);
        expect(c.a).toBe(1);
    });

    it('converts to hex', () => {
        expect(toHex(rgba(1, 0, 0))).toBe('#ff0000');
    });

    it('lerps colors', () => {
        const c = lerpColor(rgba(0, 0, 0), rgba(1, 1, 1), 0.5);
        expect(c.r).toBeCloseTo(0.5);
        expect(c.g).toBeCloseTo(0.5);
        expect(c.b).toBeCloseTo(0.5);
    });
});

describe('palette', () => {
    it('default shade is 500', () => {
        expect(red.r).toBeCloseTo(red[500].r);
        expect(red.g).toBeCloseTo(red[500].g);
        expect(red.b).toBeCloseTo(red[500].b);
    });

    it('alpha returns a new color with modified opacity', () => {
        const faded = blue.alpha(0.5);
        expect(faded.a).toBe(0.5);
        expect(faded.r).toBeCloseTo(blue.r);
        expect(blue.a).toBe(1);
    });

    it('shade alpha works', () => {
        const c = green[300].alpha(0.3);
        expect(c.a).toBe(0.3);
        expect(c.r).toBeCloseTo(green[300].r);
    });

    it('palette colors are valid Color objects', () => {
        expect(typeof sky.r).toBe('number');
        expect(typeof sky.g).toBe('number');
        expect(typeof sky.b).toBe('number');
        expect(typeof sky.a).toBe('number');
        expect(typeof sky[200].r).toBe('number');
    });
});

describe('lerp utilities', () => {
    it('lerps numbers', () => {
        expect(lerp(0, 10, 0.5)).toBe(5);
    });

    it('clamps values', () => {
        expect(clamp(-1, 0, 10)).toBe(0);
        expect(clamp(15, 0, 10)).toBe(10);
        expect(clamp(5, 0, 10)).toBe(5);
    });

    it('remaps values', () => {
        expect(remap(5, 0, 10, 0, 100)).toBe(50);
    });
});

describe('shapes', () => {
    it('creates a circle with defaults', () => {
        const c = circle();
        expect(c).toBeInstanceOf(CircleShape);
        expect(c.center).toEqual([0, 0]);
        expect(c.radius).toBe(1);
        expect(c.type).toBe('circle');
    });

    it('creates a circle with props', () => {
        const c = circle({ center: [2, 3], radius: 0.5 });
        expect(c.center).toEqual([2, 3]);
        expect(c.radius).toBe(0.5);
    });

    it('shapes have unique ids', () => {
        const a = circle();
        const b = circle();
        expect(a.id).not.toBe(b.id);
    });

    it('group manages children', () => {
        const a = circle();
        const b = circle();
        const g = group(a, b);
        expect(g).toBeInstanceOf(Group);
        expect(g.children).toHaveLength(2);
        expect(a.parent).toBe(g);

        g.remove(a);
        expect(g.children).toHaveLength(1);
        expect(a.parent).toBeNull();
    });

    it('translate returns this for chaining', () => {
        const c = circle().translate(1, 2).scale(2);
        expect(c).toBeInstanceOf(CircleShape);
    });
});

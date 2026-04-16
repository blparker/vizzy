import type { Mat3 } from '../math/mat3';
import * as M from '../math/mat3';
import { mergeStyles, type Style } from '../style/types';
import { type Theme, DARK_THEME, THEMES } from '../style/theme';
import { Shape } from '../shapes/shape';
import { Group } from '../shapes/group';
import { CircleShape } from '../shapes/circle';
import { RectShape } from '../shapes/rect';
import { LineShape } from '../shapes/line';
import { PolygonShape } from '../shapes/polygon';
import { ArcShape } from '../shapes/arc';
import { TextShape } from '../shapes/text';
import { TexShape } from '../shapes/tex';
import { PathShape } from '../shapes/path';
import type { Renderer } from '../renderer/types';
import type { Color } from '../math/color';
import { colorToCss } from '../math/color';
import { Camera, type CameraOptions } from './camera';
import type { ShapeId } from '../uid';

export interface SceneOptions extends CameraOptions {
    theme?: 'dark' | 'light' | Theme;
    background?: string | Color;
}

export class Scene {
    readonly root: Group;
    readonly camera: Camera;
    readonly background: string;
    readonly theme: Theme;

    constructor(opts: SceneOptions = {}) {
        this.root = new Group();
        this.camera = new Camera(opts);

        if (typeof opts.theme === 'string') {
            this.theme = THEMES[opts.theme] ?? DARK_THEME;
        } else {
            this.theme = opts.theme ?? DARK_THEME;
        }

        const bg = opts.background;
        this.background = bg == null
            ? this.theme.background
            : typeof bg === 'string' ? bg : colorToCss(bg);
    }

    add(...shapes: Shape[]): this {
        this.root.add(...shapes);
        return this;
    }

    remove(shape: Shape): this {
        this.root.remove(shape);
        return this;
    }

    findById(id: ShapeId): Shape | null {
        return this._findInGroup(this.root, id);
    }

    render(renderer: Renderer): void {
        renderer.beginFrame(this);
        const worldToPixel = this.camera.getWorldToPixel();
        this._walk(this.root, worldToPixel, this.theme.defaultStyle, renderer);
        renderer.endFrame(this);
    }

    private _walk(
        shape: Shape,
        parentTransform: Mat3,
        parentStyle: Style,
        renderer: Renderer,
    ): void {
        if (!shape.visible) return;

        const worldTransform = M.multiply(parentTransform, shape.transform);
        const computedStyle = mergeStyles(parentStyle, shape.style);

        if (shape instanceof Group) {
            renderer.enterGroup(shape, worldTransform, computedStyle);
            for (const child of shape.children) {
                this._walk(child, worldTransform, computedStyle, renderer);
            }
            renderer.exitGroup(shape);
        } else if (shape instanceof CircleShape) {
            renderer.drawCircle(shape, worldTransform, computedStyle);
        } else if (shape instanceof RectShape) {
            renderer.drawRect(shape, worldTransform, computedStyle);
        } else if (shape instanceof LineShape) {
            renderer.drawLine(shape, worldTransform, computedStyle);
        } else if (shape instanceof PolygonShape) {
            renderer.drawPolygon(shape, worldTransform, computedStyle);
        } else if (shape instanceof ArcShape) {
            renderer.drawArc(shape, worldTransform, computedStyle);
        } else if (shape instanceof TextShape) {
            renderer.drawText(shape, worldTransform, computedStyle);
        } else if (shape instanceof TexShape) {
            renderer.drawTex(shape, worldTransform, computedStyle);
        } else if (shape instanceof PathShape) {
            renderer.drawPath(shape, worldTransform, computedStyle);
        } else {
            renderer.drawShape(shape, worldTransform, computedStyle);
        }
    }

    private _findInGroup(group: Group, id: ShapeId): Shape | null {
        for (const child of group.children) {
            if (child.id === id) return child;
            if (child instanceof Group) {
                const found = this._findInGroup(child, id);
                if (found) return found;
            }
        }
        return null;
    }
}

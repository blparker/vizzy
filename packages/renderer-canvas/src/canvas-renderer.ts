import type {
    Renderer,
    Scene,
    Style,
    Shape,
    CircleShape,
    RectShape,
    LineShape,
    PolygonShape,
    ArcShape,
    TextShape,
    TexShape,
    PathShape,
    Group,
} from '@vizzyjs/core';
import { Mat3, colorToCss } from '@vizzyjs/core';
import katex from 'katex';
import { KATEX_CSS } from './katex-css.generated';

type Mat3Type = ReturnType<typeof Mat3.identity>;

interface TexCacheEntry {
    canvas: HTMLCanvasElement;
    width: number;
    height: number;
}

export class CanvasRenderer implements Renderer {
    private ctx: CanvasRenderingContext2D;
    private dpr: number;
    private texCache = new Map<string, TexCacheEntry>();
    private texPending = new Set<string>();
    onTexReady?: () => void;

    constructor(canvas: HTMLCanvasElement) {
        const ctx = canvas.getContext('2d');
        if (!ctx) throw new Error('Could not get 2d context');
        this.ctx = ctx;

        // Read intended display size from the HTML attributes before DPR scaling.
        // canvas.width/height are the attribute values; clientWidth/clientHeight
        // can be reduced by CSS borders/padding with box-sizing: border-box.
        this.dpr = window.devicePixelRatio || 1;
        const displayWidth = canvas.width;
        const displayHeight = canvas.height;
        canvas.width = displayWidth * this.dpr;
        canvas.height = displayHeight * this.dpr;
        canvas.style.width = `${displayWidth}px`;
        canvas.style.height = `${displayHeight}px`;
    }

    resize(displayWidth: number, displayHeight: number): void {
        this.dpr = window.devicePixelRatio || 1;
        const canvas = this.ctx.canvas;
        canvas.width = displayWidth * this.dpr;
        canvas.height = displayHeight * this.dpr;
        canvas.style.width = `${displayWidth}px`;
        canvas.style.height = `${displayHeight}px`;
    }

    beginFrame(scene: Scene): void {
        const ctx = this.ctx;
        const canvas = ctx.canvas;

        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = scene.background;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    endFrame(_scene: Scene): void {}

    drawCircle(shape: CircleShape, wt: Mat3Type, style: Style): void {
        const ctx = this.ctx;
        ctx.save();
        this.applyTransform(wt);
        this.applyStyle(style);

        ctx.beginPath();
        ctx.arc(shape.localCenter[0], shape.localCenter[1], shape.radius, 0, Math.PI * 2);
        this.fillAndStroke(style);

        ctx.restore();
    }

    drawRect(shape: RectShape, wt: Mat3Type, style: Style): void {
        const ctx = this.ctx;
        ctx.save();
        this.applyTransform(wt);
        this.applyStyle(style);

        const x = shape.localCenter[0] - shape.localWidth / 2;
        const y = shape.localCenter[1] - shape.localHeight / 2;

        ctx.beginPath();
        if (shape.cornerRadius > 0) {
            ctx.roundRect(x, y, shape.localWidth, shape.localHeight, shape.cornerRadius);
        } else {
            ctx.rect(x, y, shape.localWidth, shape.localHeight);
        }
        this.fillAndStroke(style);

        ctx.restore();
    }

    drawLine(shape: LineShape, wt: Mat3Type, style: Style): void {
        const ctx = this.ctx;
        ctx.save();
        this.applyTransform(wt);
        this.applyStyle(style);

        ctx.beginPath();
        ctx.moveTo(shape.start[0], shape.start[1]);
        ctx.lineTo(shape.end[0], shape.end[1]);
        this.fillAndStroke(style);

        ctx.restore();
    }

    drawPolygon(shape: PolygonShape, wt: Mat3Type, style: Style): void {
        const ctx = this.ctx;
        if (shape.points.length < 2) return;

        ctx.save();
        this.applyTransform(wt);
        this.applyStyle(style);

        ctx.beginPath();
        ctx.moveTo(shape.points[0]![0], shape.points[0]![1]);
        for (let i = 1; i < shape.points.length; i++) {
            ctx.lineTo(shape.points[i]![0], shape.points[i]![1]);
        }
        if (shape.closed) ctx.closePath();
        this.fillAndStroke(style);

        ctx.restore();
    }

    drawArc(shape: ArcShape, wt: Mat3Type, style: Style): void {
        const ctx = this.ctx;
        ctx.save();
        this.applyTransform(wt);
        this.applyStyle(style);

        ctx.beginPath();
        // Canvas arc goes clockwise, but our Y is flipped by the camera,
        // so counter-clockwise in canvas space = counter-clockwise in world space
        ctx.arc(
            shape.localCenter[0], shape.localCenter[1],
            shape.radius,
            shape.startAngle, shape.endAngle,
        );
        this.fillAndStroke(style);

        ctx.restore();
    }

    drawText(shape: TextShape, wt: Mat3Type, style: Style): void {
        const ctx = this.ctx;
        ctx.save();
        this.applyTransform(wt);
        if (style.opacity !== undefined) ctx.globalAlpha = style.opacity;

        // Flip Y back for text so it renders right-side up
        ctx.scale(1, -1);

        const fontSize = style.fontSize ?? 0.3;
        const fontFamily = style.fontFamily ?? 'monospace';
        ctx.font = `${fontSize}px ${fontFamily}`;
        ctx.textAlign = style.textAlign ?? 'center';
        ctx.textBaseline = style.textBaseline ?? 'middle';

        // Position is flipped because we scaled Y by -1
        const x = shape.position[0];
        const y = -shape.position[1];

        if (style.fill !== null && style.fill !== undefined) {
            ctx.fillStyle = colorToCss(style.fill);
            ctx.fillText(shape.content, x, y);
        }
        if (style.stroke !== null && style.stroke !== undefined) {
            ctx.strokeStyle = colorToCss(style.stroke);
            ctx.lineWidth = style.strokeWidth ?? 0.04;
            ctx.strokeText(shape.content, x, y);
        }

        ctx.restore();
    }

    drawTex(shape: TexShape, wt: Mat3Type, style: Style): void {
        const fontSize = style.fontSize ?? 0.4;
        const color = style.fill ? colorToCss(style.fill) : '#ffffff';
        const cacheKey = `${shape.content}|${fontSize}|${color}`;

        let entry = this.texCache.get(cacheKey);

        if (!entry && !this.texPending.has(cacheKey)) {
            this.texPending.add(cacheKey);
            this.rasterizeTex(shape.content, fontSize, color, cacheKey);
            return;
        }

        if (!entry) return;

        // Populate measured bounds on the shape for accurate layout
        if (!shape.measuredBounds) {
            const hw = entry.width / 2;
            const hh = entry.height / 2;
            shape.measuredBounds = {
                min: [shape.position[0] - hw, shape.position[1] - hh],
                max: [shape.position[0] + hw, shape.position[1] + hh],
            };
        }

        const ctx = this.ctx;
        ctx.save();
        this.applyTransform(wt);
        if (style.opacity !== undefined) ctx.globalAlpha = style.opacity;
        ctx.scale(1, -1);

        const drawW = entry.width;
        const drawH = entry.height;

        ctx.drawImage(
            entry.canvas,
            shape.position[0] - drawW / 2,
            -shape.position[1] - drawH / 2,
            drawW,
            drawH,
        );

        ctx.restore();
    }

    private async rasterizeTex(
        content: string,
        fontSize: number,
        color: string,
        cacheKey: string,
    ): Promise<void> {
        const pixelFontSize = fontSize * 100;

        const html = katex.renderToString(content, {
            throwOnError: false,
            displayMode: true,
        });

        // Self-contained KaTeX CSS (fonts pre-inlined as base64 data URIs at
        // build time), so we don't need to scrape document.styleSheets or
        // fetch fonts at runtime.
        const cssText = KATEX_CSS;

        // Measure with a hidden DOM element
        const measure = document.createElement('div');
        measure.style.cssText = `
            position: absolute; left: -9999px; top: -9999px;
            font-size: ${pixelFontSize}px; color: ${color};
            display: inline-block; white-space: nowrap;
        `;
        measure.innerHTML = `<style>${cssText}</style>${html}`;
        document.body.appendChild(measure);

        // The HTML insertion triggers font loading for any KaTeX fonts not yet requested.
        // Wait for those fonts to finish, then allow layout to settle.
        await document.fonts.ready;
        await new Promise((r) => requestAnimationFrame(r));
        await document.fonts.ready;
        await new Promise((r) => requestAnimationFrame(r));

        const measuredRect = measure.getBoundingClientRect();
        const pad = 10;
        const svgW = Math.ceil(measuredRect.width) + pad * 2;
        const svgH = Math.ceil(measuredRect.height) + pad * 2;
        document.body.removeChild(measure);

        if (svgW <= pad * 2 || svgH <= pad * 2) {
            this.texPending.delete(cacheKey);
            return;
        }

        // Build the SVG using DOM APIs to avoid XML escaping issues
        // with base64 data URIs in CSS and KaTeX HTML entities
        const svgNs = 'http://www.w3.org/2000/svg';
        const xhtmlNs = 'http://www.w3.org/1999/xhtml';

        const svg = document.createElementNS(svgNs, 'svg');
        svg.setAttribute('width', String(svgW));
        svg.setAttribute('height', String(svgH));

        const fo = document.createElementNS(svgNs, 'foreignObject');
        fo.setAttribute('width', String(svgW));
        fo.setAttribute('height', String(svgH));

        const wrapper = document.createElementNS(xhtmlNs, 'div');
        const styleEl = document.createElementNS(xhtmlNs, 'style');
        // The position:absolute + clip trick KaTeX uses to hide .katex-mathml
        // does not survive SVG foreignObject rasterization, so the MathML text
        // renders alongside the visual output. Force it hidden.
        styleEl.textContent = cssText + '\n.katex-mathml{display:none!important;}';
        wrapper.appendChild(styleEl);

        const contentDiv = document.createElementNS(xhtmlNs, 'div');
        contentDiv.setAttribute('style', `font-size:${pixelFontSize}px;color:${color};padding:${pad}px;`);
        contentDiv.innerHTML = html;
        wrapper.appendChild(contentDiv);

        fo.appendChild(wrapper);
        svg.appendChild(fo);

        const svgContent = new XMLSerializer().serializeToString(svg);
        const blob = new Blob([svgContent], { type: 'image/svg+xml;charset=utf-8' });
        const url = URL.createObjectURL(blob);

        // Load SVG as image and rasterize to offscreen canvas
        let img: HTMLImageElement;
        try {
            img = await new Promise<HTMLImageElement>((resolve, reject) => {
                const image = new Image();
                image.onload = () => resolve(image);
                image.onerror = () => reject(new Error('Failed to load TeX SVG image'));
                image.src = url;
            });
        } catch (_e) {
            this.texPending.delete(cacheKey);
            URL.revokeObjectURL(url);
            return;
        }

        const offscreen = document.createElement('canvas');
        offscreen.width = svgW;
        offscreen.height = svgH;
        const offCtx = offscreen.getContext('2d')!;
        offCtx.drawImage(img, 0, 0);

        // Convert pixel dimensions to world units
        const worldW = svgW / pixelFontSize * fontSize;
        const worldH = svgH / pixelFontSize * fontSize;

        this.texCache.set(cacheKey, {
            canvas: offscreen,
            width: worldW,
            height: worldH,
        });
        this.texPending.delete(cacheKey);
        URL.revokeObjectURL(url);
        this.onTexReady?.();
    }

    enterGroup(_group: Group, _wt: Mat3Type, style: Style): void {
        this.ctx.save();
        if (style.opacity !== undefined && style.opacity < 1) {
            this.ctx.globalAlpha *= style.opacity;
        }
    }

    exitGroup(_group: Group): void {
        this.ctx.restore();
    }

    drawPath(shape: PathShape, wt: Mat3Type, style: Style): void {
        const ctx = this.ctx;
        ctx.save();
        this.applyTransform(wt);
        this.applyStyle(style);

        ctx.beginPath();
        for (const cmd of shape.commands) {
            switch (cmd.type) {
                case 'M':
                    ctx.moveTo(cmd.to[0], cmd.to[1]);
                    break;
                case 'L':
                    ctx.lineTo(cmd.to[0], cmd.to[1]);
                    break;
                case 'C':
                    ctx.bezierCurveTo(
                        cmd.cp1[0], cmd.cp1[1],
                        cmd.cp2[0], cmd.cp2[1],
                        cmd.to[0], cmd.to[1],
                    );
                    break;
                case 'Z':
                    ctx.closePath();
                    break;
            }
        }
        this.fillAndStroke(style);

        ctx.restore();
    }

    drawShape(_shape: Shape, _wt: Mat3Type, _style: Style): void {
        // Generic fallback for custom shapes.
        // Future: call shape.toPath() and draw the bezier path.
    }

    private applyTransform(wt: Mat3Type): void {
        const d = this.dpr;
        this.ctx.setTransform(
            wt[0]! * d, wt[1]! * d,
            wt[3]! * d, wt[4]! * d,
            wt[6]! * d, wt[7]! * d,
        );
    }

    private applyStyle(style: Style): void {
        const ctx = this.ctx;

        if (style.fill && style.fill !== null) {
            ctx.fillStyle = colorToCss(style.fill);
        }

        if (style.stroke && style.stroke !== null) {
            ctx.strokeStyle = colorToCss(style.stroke);
        }

        if (style.strokeWidth !== undefined) {
            ctx.lineWidth = style.strokeWidth;
        }

        if (style.lineCap) ctx.lineCap = style.lineCap;
        if (style.lineJoin) ctx.lineJoin = style.lineJoin;
        if (style.lineDash) ctx.setLineDash(style.lineDash);
        if (style.lineDashOffset !== undefined) ctx.lineDashOffset = style.lineDashOffset;

        if (style.opacity !== undefined) {
            ctx.globalAlpha = style.opacity;
        }
    }

    private fillAndStroke(style: Style): void {
        const ctx = this.ctx;
        if (style.fill && style.fill !== null) {
            ctx.fill();
        }
        if (style.stroke && style.stroke !== null) {
            ctx.stroke();
        }
    }
}

import type { Scene, Shape, Vec2 } from '@vizzyjs/core';
import { Mat3, clamp, hitTestAll } from '@vizzyjs/core';

export interface DraggableOptions {
    onDrag: (worldPos: Vec2) => void;
    onDragStart?: (worldPos: Vec2) => void;
    onDragEnd?: (worldPos: Vec2) => void;
    constrainX?: [number, number];
    constrainY?: [number, number];
}

export interface HoverableOptions {
    onEnter: () => void;
    onLeave: () => void;
}

export interface ClickableOptions {
    onClick: (worldPos: Vec2) => void;
}

export interface InteractionManager {
    draggable(shape: Shape, opts: DraggableOptions): () => void;
    hoverable(shape: Shape, opts: HoverableOptions): () => void;
    clickable(shape: Shape, opts: ClickableOptions): () => void;
    dispose(): void;
}

interface DragState {
    shape: Shape;
    opts: DraggableOptions;
    offsetX: number;
    offsetY: number;
}

export function createInteractionManager(
    canvas: HTMLCanvasElement,
    scene: Scene,
    renderFn: () => void
): InteractionManager {
    const draggables = new Map<Shape, DraggableOptions>();
    const hoverables = new Map<Shape, HoverableOptions>();
    const clickables = new Map<Shape, ClickableOptions>();

    let hoveredShape: Shape | null = null;
    let dragState: DragState | null = null;

    function toWorld(e: MouseEvent): Vec2 {
        const rect = canvas.getBoundingClientRect();
        const displayX = e.clientX - rect.left;
        const displayY = e.clientY - rect.top;
        return Mat3.transformPoint(scene.camera.getPixelToWorld(), [displayX, displayY]);
    }

    function findInteractiveShape(worldPoint: Vec2, ...maps: Map<Shape, unknown>[]): Shape | null {
        const cameraTransform = Mat3.identity();
        const results = hitTestAll(scene.root, cameraTransform, worldPoint);

        // Walk from topmost (last drawn) to bottommost, find first interactive shape
        for (let i = results.length - 1; i >= 0; i--) {
            const shape = results[i]!.shape;
            for (const map of maps) {
                if (map.has(shape)) return shape;
            }
        }
        return null;
    }

    function findAnyInteractiveShape(worldPoint: Vec2): Shape | null {
        return findInteractiveShape(worldPoint, draggables, hoverables, clickables);
    }

    function updateCursor(shape: Shape | null) {
        if (dragState) {
            canvas.style.cursor = 'grabbing';
        } else if (shape && draggables.has(shape)) {
            canvas.style.cursor = 'grab';
        } else if (shape && (hoverables.has(shape) || clickables.has(shape))) {
            canvas.style.cursor = 'pointer';
        } else {
            canvas.style.cursor = '';
        }
    }

    function constrainPos(pos: Vec2, opts: DraggableOptions): Vec2 {
        let x = pos[0];
        let y = pos[1];
        if (opts.constrainX) x = clamp(x, opts.constrainX[0], opts.constrainX[1]);
        if (opts.constrainY) y = clamp(y, opts.constrainY[0], opts.constrainY[1]);
        return [x, y];
    }

    function onMouseDown(e: MouseEvent) {
        const worldPos = toWorld(e);
        const shape = findInteractiveShape(worldPos, draggables);

        if (shape) {
            const opts = draggables.get(shape)!;
            const center = shape.center;
            dragState = {
                shape,
                opts,
                offsetX: center[0] - worldPos[0],
                offsetY: center[1] - worldPos[1],
            };
            canvas.style.cursor = 'grabbing';
            opts.onDragStart?.(worldPos);
        }
    }

    function onMouseMove(e: MouseEvent) {
        const worldPos = toWorld(e);

        if (dragState) {
            const rawPos: Vec2 = [worldPos[0] + dragState.offsetX, worldPos[1] + dragState.offsetY];
            const constrained = constrainPos(rawPos, dragState.opts);
            dragState.opts.onDrag(constrained);
            renderFn();
            return;
        }

        // Hover detection
        const shape = findAnyInteractiveShape(worldPos);

        if (shape !== hoveredShape) {
            if (hoveredShape && hoverables.has(hoveredShape)) {
                hoverables.get(hoveredShape)!.onLeave();
            }
            hoveredShape = shape;
            if (shape && hoverables.has(shape)) {
                hoverables.get(shape)!.onEnter();
            }
            updateCursor(shape);
            renderFn();
        } else {
            updateCursor(shape);
        }
    }

    function onMouseUp(e: MouseEvent) {
        if (dragState) {
            const worldPos = toWorld(e);
            dragState.opts.onDragEnd?.(worldPos);
            dragState = null;

            // Re-check hover state
            const shape = findAnyInteractiveShape(worldPos);
            hoveredShape = shape;
            updateCursor(shape);
            renderFn();
        }
    }

    function onClick(e: MouseEvent) {
        if (dragState) return;
        const worldPos = toWorld(e);
        const shape = findInteractiveShape(worldPos, clickables);
        if (shape) {
            clickables.get(shape)!.onClick(worldPos);
            renderFn();
        }
    }

    canvas.addEventListener('mousedown', onMouseDown);
    canvas.addEventListener('mousemove', onMouseMove);
    canvas.addEventListener('mouseup', onMouseUp);
    canvas.addEventListener('click', onClick);

    const manager: InteractionManager = {
        draggable(shape: Shape, opts: DraggableOptions): () => void {
            draggables.set(shape, opts);
            return () => {
                draggables.delete(shape);
            };
        },

        hoverable(shape: Shape, opts: HoverableOptions): () => void {
            hoverables.set(shape, opts);
            return () => {
                hoverables.delete(shape);
            };
        },

        clickable(shape: Shape, opts: ClickableOptions): () => void {
            clickables.set(shape, opts);
            return () => {
                clickables.delete(shape);
            };
        },

        dispose() {
            canvas.removeEventListener('mousedown', onMouseDown);
            canvas.removeEventListener('mousemove', onMouseMove);
            canvas.removeEventListener('mouseup', onMouseUp);
            canvas.removeEventListener('click', onClick);
            draggables.clear();
            hoverables.clear();
            clickables.clear();
            hoveredShape = null;
            dragState = null;
            canvas.style.cursor = '';
        },
    };

    return manager;
}

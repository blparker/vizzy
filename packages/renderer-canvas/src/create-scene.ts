import {
    Scene,
    Axes,
    grid as createGrid,
    type SceneOptions,
    type Shape,
    type GridProps,
    type Group,
    type Animation,
    type AnimationOptions,
} from '@vizzyjs/core';
import { CanvasRenderer } from './canvas-renderer';
import { AnimationPlayer } from './animation-player';
import { createControlsManager, type ControlsManager } from './controls';
import { createInteractionManager, type InteractionManager } from './interaction';

export interface AutoResizeConfig {
    /**
     * Element whose size the canvas should track. Defaults to the canvas's parent.
     */
    container?: HTMLElement;
    /**
     * Override aspect ratio (width / height). Defaults to the scene's world aspect ratio.
     */
    aspectRatio?: number;
}

export type AutoResizeOption = boolean | AutoResizeConfig;

export interface CreateSceneOptions extends Omit<SceneOptions, 'pixelWidth' | 'pixelHeight'> {
    /**
     * When set, the canvas is resized to fit its container whenever the container changes size.
     * Aspect ratio defaults to the scene's world aspect ratio (letterbox).
     */
    autoResize?: AutoResizeOption;
}

export interface BoundScene {
    scene: Scene;
    add: {
        <A extends Shape>(a: A): A;
        <A extends Shape, B extends Shape>(a: A, b: B): [A, B];
        <A extends Shape, B extends Shape, C extends Shape>(a: A, b: B, c: C): [A, B, C];
        <A extends Shape, B extends Shape, C extends Shape, D extends Shape>(a: A, b: B, c: C, d: D): [A, B, C, D];
        <A extends Shape, B extends Shape, C extends Shape, D extends Shape, E extends Shape>(
            a: A,
            b: B,
            c: C,
            d: D,
            e: E
        ): [A, B, C, D, E];
        (...shapes: Shape[]): Shape[];
    };
    remove: (shape: Shape) => BoundScene;
    moveToFront: (shape: Shape) => void;
    moveToBack: (shape: Shape) => void;
    render: () => void;
    grid: (props?: Omit<GridProps, 'camera'>) => Group;
    play: (...args: (Animation | AnimationOptions)[]) => Promise<void>;
    wait: (seconds: number) => Promise<void>;
    pause: () => void;
    resume: () => void;
    readonly isPaused: boolean;
    resize: (displayWidth: number, displayHeight: number) => void;
    destroy: () => void;
    controls: ControlsManager;
    interact: InteractionManager;
}

export function createScene(
    canvas: HTMLCanvasElement,
    opts: CreateSceneOptions = {}
): BoundScene {
    const { autoResize, ...sceneOpts } = opts;

    // Read the intended display size before the renderer modifies canvas.width/height for DPR.
    // If the canvas hasn't been sized (0x0), autoResize will fill in real dimensions shortly.
    const displayWidth = canvas.width || 1;
    const displayHeight = canvas.height || 1;

    const renderer = new CanvasRenderer(canvas);

    const scene = new Scene({
        ...sceneOpts,
        pixelWidth: displayWidth,
        pixelHeight: displayHeight,
    });

    let renderQueued = false;
    function queueRender() {
        if (!renderQueued) {
            renderQueued = true;
            queueMicrotask(() => {
                renderQueued = false;
                scene.render(renderer);
            });
        }
    }

    function addShapes(...shapes: Shape[]): Shape | Shape[] {
        scene.add(...shapes);
        for (const shape of shapes) {
            if (shape instanceof Axes && shape.autoFrame) {
                shape.frameCamera(scene.camera);
            }
        }
        queueRender();
        return shapes.length === 1 ? shapes[0]! : shapes;
    }

    let destroyed = false;
    let resizeObserver: ResizeObserver | null = null;

    const bound: BoundScene = {
        scene,
        add: addShapes as BoundScene['add'],
        remove(shape: Shape) {
            scene.remove(shape);
            queueRender();
            return bound;
        },
        moveToFront(shape: Shape) {
            scene.root.moveToFront(shape);
        },
        moveToBack(shape: Shape) {
            scene.root.moveToBack(shape);
        },

        render() {
            scene.render(renderer);
        },

        grid(props?: Omit<GridProps, 'camera'>) {
            const g = createGrid({ ...props, camera: scene.camera });
            scene.add(g);
            queueRender();
            return g;
        },

        play(...args: (Animation | AnimationOptions)[]) {
            let options: AnimationOptions | undefined;
            let animations: Animation[];

            const last = args[args.length - 1];
            if (last && !isAnimation(last)) {
                options = last as AnimationOptions;
                animations = args.slice(0, -1) as Animation[];
            } else {
                animations = args as Animation[];
            }

            if (options) {
                animations = animations.map((anim) => ({
                    ...anim,
                    duration: options!.duration ?? anim.duration,
                    easing: options!.easing ?? anim.easing,
                }));
            }

            for (const anim of animations) {
                for (const target of anim.targets) {
                    if (!target.parent) {
                        scene.add(target);
                    }
                }
            }

            return player.play(animations);
        },

        wait(seconds: number) {
            return player.wait(seconds);
        },

        pause() {
            player.pause();
        },

        resume() {
            player.resume();
        },

        get isPaused() {
            return player.isPaused;
        },

        resize(displayWidth: number, displayHeight: number) {
            renderer.resize(displayWidth, displayHeight);
            scene.resize(displayWidth, displayHeight);
            queueRender();
        },

        destroy() {
            if (destroyed) return;
            destroyed = true;
            resizeObserver?.disconnect();
            resizeObserver = null;
            player.dispose();
            bound.controls.dispose();
            bound.interact.dispose();
        },

        controls: null as unknown as ControlsManager,
        interact: null as unknown as InteractionManager,
    };

    const player = new AnimationPlayer(() => bound.render());
    const themeStr = typeof opts.theme === 'string' ? opts.theme : 'dark';
    bound.controls = createControlsManager(canvas, themeStr, () => bound.render());
    bound.interact = createInteractionManager(canvas, scene, () => bound.render());

    renderer.onTexReady = () => bound.render();

    if (autoResize) {
        const config: AutoResizeConfig = typeof autoResize === 'object' ? autoResize : {};
        const container = config.container ?? canvas.parentElement;
        if (container && typeof ResizeObserver !== 'undefined') {
            const measure = (entry?: ResizeObserverEntry): [number, number] => {
                if (entry) {
                    const r = entry.contentRect;
                    return [r.width, r.height];
                }
                const rect = container.getBoundingClientRect();
                const cs = typeof window !== 'undefined' ? window.getComputedStyle(container) : null;
                const padH = cs ? parseFloat(cs.paddingLeft) + parseFloat(cs.paddingRight) : 0;
                const padV = cs ? parseFloat(cs.paddingTop) + parseFloat(cs.paddingBottom) : 0;
                return [rect.width - padH, rect.height - padV];
            };
            // Snapshot the aspect once at setup so scene mutations (e.g. axes auto-framing
            // the camera) don't subsequently resize the canvas underneath the user.
            const aspect =
                config.aspectRatio ?? scene.camera.worldWidth / scene.camera.worldHeight;
            const apply = (cw: number, ch: number) => {
                if (destroyed || cw <= 0 || ch <= 0) return;
                const containerAspect = cw / ch;
                const [w, h] =
                    containerAspect > aspect ? [ch * aspect, ch] : [cw, cw / aspect];
                bound.resize(Math.round(w), Math.round(h));
            };
            resizeObserver = new ResizeObserver((entries) => {
                const [cw, ch] = measure(entries[0]);
                apply(cw, ch);
            });
            resizeObserver.observe(container);
            // Synchronous initial fit so the first render happens at container size,
            // not at the canvas's HTML-attribute default. Fall back to rAF if layout
            // hasn't produced usable dimensions yet.
            const [cw, ch] = measure();
            if (cw > 0 && ch > 0) {
                apply(cw, ch);
            } else {
                requestAnimationFrame(() => {
                    if (destroyed) return;
                    const [cw2, ch2] = measure();
                    apply(cw2, ch2);
                });
            }
        }
    }

    return bound;
}

function isAnimation(obj: unknown): obj is Animation {
    return typeof obj === 'object' && obj !== null && 'begin' in obj && 'update' in obj && 'finish' in obj;
}

export function renderScene(
    canvas: HTMLCanvasElement,
    opts: CreateSceneOptions,
    build: (bound: BoundScene) => void
): BoundScene;
export function renderScene(canvas: HTMLCanvasElement, build: (bound: BoundScene) => void): BoundScene;
export function renderScene(
    canvas: HTMLCanvasElement,
    optsOrBuild: CreateSceneOptions | ((bound: BoundScene) => void),
    maybeBuild?: (bound: BoundScene) => void
): BoundScene {
    const opts = typeof optsOrBuild === 'function' ? {} : optsOrBuild;
    const build = typeof optsOrBuild === 'function' ? optsOrBuild : maybeBuild!;

    const bound = createScene(canvas, opts);
    build(bound);
    bound.render();
    return bound;
}

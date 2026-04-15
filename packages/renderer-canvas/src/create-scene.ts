import { Scene, type SceneOptions, type Shape, type GridProps, grid as createGrid, type Group, type Animation, type AnimationOptions } from '@vimath/core';
import { CanvasRenderer } from './canvas-renderer';
import { AnimationPlayer } from './animation-player';
import { createControlsManager, type ControlsManager } from './controls';

export interface BoundScene {
    scene: Scene;
    add: (...shapes: Shape[]) => BoundScene;
    remove: (shape: Shape) => BoundScene;
    render: () => void;
    grid: (props?: Omit<GridProps, 'camera'>) => Group;
    play: (...args: (Animation | AnimationOptions)[]) => Promise<void>;
    wait: (seconds: number) => Promise<void>;
    controls: ControlsManager;
}

export function createScene(
    canvas: HTMLCanvasElement,
    opts: Omit<SceneOptions, 'pixelWidth' | 'pixelHeight'> = {},
): BoundScene {
    // Read the intended display size before the renderer modifies canvas.width/height for DPR
    const displayWidth = canvas.width;
    const displayHeight = canvas.height;

    const renderer = new CanvasRenderer(canvas);

    const scene = new Scene({
        ...opts,
        pixelWidth: displayWidth,
        pixelHeight: displayHeight,
    });

    const bound: BoundScene = {
        scene,
        add(...shapes: Shape[]) {
            scene.add(...shapes);
            return bound;
        },
        remove(shape: Shape) {
            scene.remove(shape);
            return bound;
        },
        render() {
            scene.render(renderer);
        },
        grid(props?: Omit<GridProps, 'camera'>) {
            const g = createGrid({ ...props, camera: scene.camera });
            scene.add(g);
            return g;
        },
        play(...args: (Animation | AnimationOptions)[]) {
            // Last arg may be options
            let options: AnimationOptions | undefined;
            let animations: Animation[];

            const last = args[args.length - 1];
            if (last && !isAnimation(last)) {
                options = last as AnimationOptions;
                animations = args.slice(0, -1) as Animation[];
            } else {
                animations = args as Animation[];
            }

            // Apply options overrides to each animation
            if (options) {
                animations = animations.map((anim) => ({
                    ...anim,
                    duration: options!.duration ?? anim.duration,
                    easing: options!.easing ?? anim.easing,
                }));
            }

            // Auto-add shapes not yet in the scene
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
        controls: null as unknown as ControlsManager,
    };

    const player = new AnimationPlayer(() => bound.render());
    const themeStr = typeof opts.theme === 'string' ? opts.theme : 'dark';
    bound.controls = createControlsManager(canvas, themeStr, () => bound.render());

    // Auto re-render when TeX images finish loading
    renderer.onTexReady = () => bound.render();

    return bound;
}

function isAnimation(obj: unknown): obj is Animation {
    return typeof obj === 'object' && obj !== null && 'begin' in obj && 'update' in obj && 'finish' in obj;
}

export function renderScene(
    canvas: HTMLCanvasElement,
    opts: Omit<SceneOptions, 'pixelWidth' | 'pixelHeight'>,
    build: (bound: BoundScene) => void,
): BoundScene;
export function renderScene(
    canvas: HTMLCanvasElement,
    build: (bound: BoundScene) => void,
): BoundScene;
export function renderScene(
    canvas: HTMLCanvasElement,
    optsOrBuild: Omit<SceneOptions, 'pixelWidth' | 'pixelHeight'> | ((bound: BoundScene) => void),
    maybeBuild?: (bound: BoundScene) => void,
): BoundScene {
    const opts = typeof optsOrBuild === 'function' ? {} : optsOrBuild;
    const build = typeof optsOrBuild === 'function' ? optsOrBuild : maybeBuild!;

    const bound = createScene(canvas, opts);
    build(bound);
    bound.render();
    return bound;
}

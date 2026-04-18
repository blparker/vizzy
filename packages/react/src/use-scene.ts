import { useEffect, useRef, type DependencyList, type RefObject } from 'react';
import { createScene, type BoundScene, type CreateSceneOptions } from '@vizzyjs/renderer-canvas';

export type SceneSetup = (scene: BoundScene) => void | (() => void);

export type UseSceneOptions = CreateSceneOptions;

export function useScene(
    setup: SceneSetup,
    options?: UseSceneOptions,
    deps: DependencyList = []
): RefObject<HTMLCanvasElement | null> {
    const ref = useRef<HTMLCanvasElement | null>(null);

    useEffect(() => {
        const canvas = ref.current;
        if (!canvas) return;

        // Default autoResize to true for React consumers: they typically render
        // into responsive layouts and expect the canvas to follow.
        const resolvedOptions: UseSceneOptions = {
            autoResize: true,
            ...options,
        };

        const bound = createScene(canvas, resolvedOptions);
        const cleanup = setup(bound);
        bound.render();

        return () => {
            if (typeof cleanup === 'function') cleanup();
            bound.destroy();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, deps);

    return ref;
}

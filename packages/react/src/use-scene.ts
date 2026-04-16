import { useEffect, useRef, type DependencyList, type RefObject } from 'react';
import type { SceneOptions } from '@vizzyjs/core';
import { createScene, type BoundScene } from '@vizzyjs/renderer-canvas';

export type SceneSetup = (scene: BoundScene) => void | (() => void);

export type UseSceneOptions = Omit<SceneOptions, 'pixelWidth' | 'pixelHeight'>;

export function useScene(
    setup: SceneSetup,
    options?: UseSceneOptions,
    deps: DependencyList = []
): RefObject<HTMLCanvasElement | null> {
    const ref = useRef<HTMLCanvasElement | null>(null);

    useEffect(() => {
        const canvas = ref.current;
        if (!canvas) return;

        const bound = createScene(canvas, options);
        const cleanup = setup(bound);
        bound.render();

        return () => {
            if (typeof cleanup === 'function') cleanup();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, deps);

    return ref;
}

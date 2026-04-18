# @vizzyjs/react

React bindings for [vizzy](https://github.com/blparker/vizzy), a TypeScript math visualization library inspired by manim.

A `useScene` hook that wires a vizzy scene to a React-mounted `<canvas>`, handling the ref and lifecycle for you. The imperative `createScene` API from `@vizzyjs/renderer-canvas` remains the source of truth; this is a thin ergonomic wrapper.

- **Docs:** https://vizzyjs.dev
- **Repo:** https://github.com/blparker/vizzy

## Install

```bash
npm install @vizzyjs/core @vizzyjs/renderer-canvas @vizzyjs/react
```

## Usage

```tsx
import { useScene } from '@vizzyjs/react';
import { circle, fadeIn, sky } from '@vizzyjs/core';

export function MyViz() {
    const ref = useScene(({ add, play, grid }) => {
        grid();
        const c = circle({ radius: 1, color: sky });
        add(c);
        play(fadeIn(c));
    });

    return <canvas ref={ref} width={800} height={600} />;
}
```

### Reactive setup

Pass a dependency array to re-run setup when inputs change:

```tsx
import { useScene } from '@vizzyjs/react';
import { circle, sky } from '@vizzyjs/core';

function ReactiveViz({ radius }: { radius: number }) {
    const ref = useScene(
        ({ add }) => {
            add(circle({ radius, color: sky }));
        },
        undefined,
        [radius],
    );
    return <canvas ref={ref} width={800} height={600} />;
}
```

### Cleanup

The setup callback may return a cleanup function. It runs on unmount and before the next run when deps change. Useful for tearing down DOM overlays you created (e.g., `controls.panel()`).

```tsx
useScene(({ controls }) => {
    const panel = controls.panel();
    controls.slider({ label: 'x', min: 0, max: 10 });
    return () => panel.remove();
});
```

### Next.js / SSR

Vizzy renders to a real `<canvas>` and uses browser APIs (`ResizeObserver`, `requestAnimationFrame`). Mount any component that calls `useScene` on the client only. With the Next.js App Router, use `'use client'` at the top of the file, or lazy-load with `next/dynamic({ ssr: false })` for the Pages Router.

## API

```ts
function useScene(
    setup: (scene: BoundScene) => void | (() => void),
    options?: UseSceneOptions,
    deps?: DependencyList,
): RefObject<HTMLCanvasElement | null>;
```

- **`setup`**: runs once the canvas mounts. Receives the same `BoundScene` that `createScene` returns.
- **`options`**: forwarded to `createScene` (e.g., `theme`, `autoResize`). `pixelWidth` / `pixelHeight` are managed by the canvas's size; disable `autoResize` to use fixed dimensions from the canvas `width` / `height` attributes.
- **`deps`**: React-style dependency array. Defaults to `[]` (run once).

### Responsive canvas

`useScene` defaults `autoResize` to `true`. The canvas tracks its parent element's size (via `ResizeObserver`) while preserving the world aspect ratio. Pass `autoResize: false` for a fixed size, or `{ container, aspectRatio }` to override.

### Unmount behavior

On unmount (or when `deps` change), the hook calls `bound.destroy()`. That disconnects the resize observer, disposes controls and interactions, and stops any in-flight animations. React strict mode double-invocation does not leak listeners.

## Peer dependencies

- `react >= 19`
- `@vizzyjs/core`
- `@vizzyjs/renderer-canvas`

## License

[MIT](https://github.com/blparker/vizzy/blob/main/LICENSE)

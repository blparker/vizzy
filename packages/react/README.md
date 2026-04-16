# @vizzyjs/react

React bindings for [vizzy](https://github.com/blparker/vizzy) — a TypeScript math visualization library inspired by manim.

This package provides a `useScene` hook that wires a vizzy scene to a React-mounted `<canvas>` element, handling the ref + lifecycle boilerplate for you. The imperative `createScene` API from `@vizzyjs/renderer-canvas` remains the source of truth — this package is a thin ergonomic wrapper.

## Install

```bash
npm install @vizzyjs/core @vizzyjs/renderer-canvas @vizzyjs/react
```

## Usage

```tsx
import { useScene } from '@vizzyjs/react';
import { circle, fadeIn, sky } from '@vizzyjs/core';

function MyViz() {
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

The setup callback may return a cleanup function. It runs on unmount and before the next run when deps change — useful for tearing down DOM overlays you created (e.g., `controls.panel()`).

```tsx
useScene(({ controls }) => {
    const panel = controls.panel();
    controls.slider({ label: 'x', min: 0, max: 10 });
    return () => panel.remove();
});
```

## API

```ts
function useScene(
    setup: (scene: BoundScene) => void | (() => void),
    options?: UseSceneOptions,
    deps?: DependencyList,
): RefObject<HTMLCanvasElement | null>;
```

- **`setup`** — runs once the canvas mounts. Receives the same `BoundScene` that `createScene` returns.
- **`options`** — forwarded to `createScene` (e.g., `theme`). `pixelWidth`/`pixelHeight` come from the canvas element's `width`/`height` attributes.
- **`deps`** — React-style dependency array. Defaults to `[]` (run once).

## Known limitation: React strict mode

In dev, React strict mode runs effects twice. Each run creates a new scene and attaches canvas event listeners. The first scene's listeners aren't removed today, so interactions may double-fire in dev. Production is unaffected. A proper fix requires a `destroy()` hook on `BoundScene` in `@vizzyjs/renderer-canvas`.

## Peer Dependencies

- `react >= 19`
- `@vizzyjs/core`
- `@vizzyjs/renderer-canvas`

## License

[MIT](https://github.com/blparker/vizzy/blob/main/LICENSE)

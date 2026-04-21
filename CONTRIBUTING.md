# Contributing to vizzy

Thanks for your interest in vizzy. Bug reports, ideas, and PRs are all welcome.

## Before you file

-   **Something broken or unexpected?** Open a [bug report](https://github.com/blparker/vizzy/issues/new?template=bug.yml).
-   **Idea for a new shape, animation, or API?** Open a [feature request](https://github.com/blparker/vizzy/issues/new?template=feature.yml).
-   **Usage question or show-and-tell?** Start a [discussion](https://github.com/blparker/vizzy/discussions).

## Local development

Vizzy is a pnpm workspace. You'll need Node 22+ and pnpm 10+.

```bash
git clone https://github.com/blparker/vizzy.git
cd vizzy
pnpm install
```

Common commands from the repo root:

| Command           | What it does                                                    |
| ----------------- | --------------------------------------------------------------- |
| `pnpm test`       | Run the unit tests (vitest)                                     |
| `pnpm typecheck`  | Typecheck every package (`tsc -b`)                              |
| `pnpm build`      | Build every package                                             |
| `pnpm docs`       | Run the docs site locally (VitePress)                           |
| `pnpm playground` | Run the playground sandbox                                      |
| `pnpm hub`        | Run the hub app (requires `.env` - see `apps/hub/.env.example`) |

## Submitting a PR

1. Fork the repo and create a branch from `main`.
2. Make your change. Keep commits focused.
3. Add or update tests where it makes sense. `pnpm test` must pass.
4. Run `pnpm typecheck` and make sure it passes.
5. For anything that changes runtime behavior, verify it visually in the playground or the docs (`pnpm docs`).
6. Open a PR. The [PR template](.github/PULL_REQUEST_TEMPLATE.md) has a small checklist.

CI runs typecheck, tests, and package/docs builds on every PR.

## Adding a new shape

Shapes live under `packages/core/src/shapes/`. Most shapes extend `Shape` or `PathShape`; composite shapes extend `Group`. If you're adding one:

-   Put the class in its own file (`my-shape.ts`).
-   Add a factory function to `packages/core/src/shapes/factories.ts` so users can call `myShape(props)` instead of `new MyShape(props)`.
-   Export both from `packages/core/src/shapes/index.ts`.
-   If the shape benefits from a docs snippet, add one under `packages/docs/snippets/` and register it in `snippets/index.ts`.

## Adding a new animation

Animations live under `packages/core/src/animation/`. Follow the pattern in `fade.ts` or `transform.ts`: define a factory that returns an `Animation` object with `begin`, `update`, and `finish` hooks. Use `makeAnimation()` to cut boilerplate.

## Style conventions

-   4-space indentation, single quotes, TypeScript strict mode.
-   ESM with bundler module resolution (no `.js` extensions in imports).
-   Factory functions are the primary public API; classes are internal.
-   Prefer small focused PRs over large multi-feature ones.

## License

By contributing, you agree that your contributions will be licensed under the repo's [MIT license](./LICENSE).

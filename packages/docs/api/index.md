# API Reference

A catalog of everything Vizzy exposes. For tutorials and worked examples, see the [Guide](/guide/getting-started). For full type information, your editor's TypeScript autocomplete is authoritative.

## Sections

-   **[Shapes](/api/shapes)** - every shape factory and class (`circle`, `rect`, `axes`, `tex`, ...)
-   **[Animations](/api/animations)** - every animation function (`fadeIn`, `animateShift`, `during`, ...)

## How to import

Everything is re-exported from `@vizzyjs/core`:

```typescript
import { circle, rect, axes, fadeIn, animateShift, play } from '@vizzyjs/core';
```

Inside the [Hub playground](https://hub.vizzyjs.dev), all exports are available as globals - no imports needed.

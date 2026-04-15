export type ShapeId = string & { readonly __brand: unique symbol };

let counter = 0;

export function uid(): ShapeId {
    return `shape_${++counter}` as ShapeId;
}

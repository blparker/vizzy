import type { Mat3 } from '../math/mat3';
import type { Style } from '../style/types';
import type { Shape } from '../shapes/shape';
import type { CircleShape } from '../shapes/circle';
import type { RectShape } from '../shapes/rect';
import type { LineShape } from '../shapes/line';
import type { PolygonShape } from '../shapes/polygon';
import type { ArcShape } from '../shapes/arc';
import type { TextShape } from '../shapes/text';
import type { TexShape } from '../shapes/tex';
import type { PathShape } from '../shapes/path';
import type { Group } from '../shapes/group';
import type { Scene } from '../scene/scene';

export interface Renderer {
    beginFrame(scene: Scene): void;
    endFrame(scene: Scene): void;

    drawCircle(shape: CircleShape, worldTransform: Mat3, computedStyle: Style): void;
    drawRect(shape: RectShape, worldTransform: Mat3, computedStyle: Style): void;
    drawLine(shape: LineShape, worldTransform: Mat3, computedStyle: Style): void;
    drawPolygon(shape: PolygonShape, worldTransform: Mat3, computedStyle: Style): void;
    drawArc(shape: ArcShape, worldTransform: Mat3, computedStyle: Style): void;
    drawText(shape: TextShape, worldTransform: Mat3, computedStyle: Style): void;
    drawTex(shape: TexShape, worldTransform: Mat3, computedStyle: Style): void;
    drawPath(shape: PathShape, worldTransform: Mat3, computedStyle: Style): void;

    enterGroup(group: Group, worldTransform: Mat3, computedStyle: Style): void;
    exitGroup(group: Group): void;

    /** Fallback for custom/unknown shape types */
    drawShape(shape: Shape, worldTransform: Mat3, computedStyle: Style): void;
}

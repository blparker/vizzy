type ShapeId = string & {
	readonly __brand: unique symbol;
};
type Vec2 = readonly [
	number,
	number
];
type Mat3 = Float64Array;
interface BoundingBox {
	/**
	 * The minimum coordinates of the bounding box.
	 */
	min: Vec2;
	/**
	 * The maximum coordinates of the bounding box.
	 */
	max: Vec2;
}
interface Color {
	readonly r: number;
	readonly g: number;
	readonly b: number;
	readonly a: number;
}
type EasingFn = (t: number) => number;
interface Style {
	fill?: Color | string | null;
	stroke?: Color | string | null;
	strokeWidth?: number;
	opacity?: number;
	lineCap?: "butt" | "round" | "square";
	lineJoin?: "miter" | "round" | "bevel";
	lineDash?: number[];
	lineDashOffset?: number;
	fontSize?: number;
	fontFamily?: string;
	textAlign?: "left" | "center" | "right";
	textBaseline?: "top" | "middle" | "bottom";
}
interface Theme {
	background: string;
	defaultStyle: Style;
}
type ShapeType = string;
declare class Group extends Shape {
	private _children;
	constructor(style?: Style);
	get children(): ReadonlyArray<Shape>;
	add(...shapes: Shape[]): this;
	remove(shape: Shape): this;
	moveToFront(shape: Shape): this;
	moveToBack(shape: Shape): this;
	clear(): this;
	arrange(direction?: Vec2, buff?: number): this;
	getBounds(): BoundingBox;
}
declare abstract class Shape {
	readonly id: ShapeId;
	readonly type: ShapeType;
	style: Style;
	transform: Mat3;
	parent: Group | null;
	visible: boolean;
	constructor(type: ShapeType, style?: Style);
	abstract getBounds(): BoundingBox;
	getPathLength(): number;
	get center(): Vec2;
	get top(): Vec2;
	get bottom(): Vec2;
	get left(): Vec2;
	get right(): Vec2;
	get width(): number;
	get height(): number;
	moveTo(target: Vec2): this;
	shift(...args: [
		Vec2
	] | [
		number,
		number
	]): this;
	nextTo(other: Shape, direction: Vec2, buffer?: number): this;
	translate(x: number, y: number): this;
	rotate(angle: number): this;
	scale(sx: number, sy?: number): this;
	setPosition(x: number, y: number): this;
	setStyle(updates: Partial<Style>): this;
}
interface CircleProps {
	center?: Vec2;
	radius?: number;
	style?: Style;
}
declare class CircleShape extends Shape {
	localCenter: Vec2;
	radius: number;
	constructor(props?: CircleProps);
	getPathLength(): number;
	getBounds(): BoundingBox;
}
interface RectProps {
	center?: Vec2;
	width?: number;
	height?: number;
	cornerRadius?: number;
	style?: Style;
}
declare class RectShape extends Shape {
	localCenter: Vec2;
	localWidth: number;
	localHeight: number;
	cornerRadius: number;
	constructor(props?: RectProps);
	getPathLength(): number;
	getBounds(): BoundingBox;
}
interface LineProps {
	start?: Vec2;
	end?: Vec2;
	style?: Style;
}
declare class LineShape extends Shape {
	start: Vec2;
	end: Vec2;
	constructor(props?: LineProps);
	getPathLength(): number;
	getBounds(): BoundingBox;
}
interface PolygonProps {
	points?: Vec2[];
	closed?: boolean;
	style?: Style;
}
declare class PolygonShape extends Shape {
	points: Vec2[];
	closed: boolean;
	constructor(props?: PolygonProps);
	getPathLength(): number;
	getBounds(): BoundingBox;
}
interface ArcProps {
	center?: Vec2;
	radius?: number;
	startAngle?: number;
	endAngle?: number;
	style?: Style;
}
declare class ArcShape extends Shape {
	localCenter: Vec2;
	radius: number;
	startAngle: number;
	endAngle: number;
	constructor(props?: ArcProps);
	getPathLength(): number;
	getBounds(): BoundingBox;
}
interface TextProps {
	content?: string;
	position?: Vec2;
	style?: Style;
}
declare class TextShape extends Shape {
	content: string;
	position: Vec2;
	constructor(props?: TextProps);
	getBounds(): BoundingBox;
}
interface TexProps {
	content?: string;
	position?: Vec2;
	style?: Style;
}
declare class TexShape extends Shape {
	content: string;
	position: Vec2;
	/** Set by the renderer after rasterization for accurate bounds */
	measuredBounds: BoundingBox | null;
	constructor(props?: TexProps);
	getBounds(): BoundingBox;
}
interface CameraOptions {
	worldWidth?: number;
	worldHeight?: number;
	pixelWidth?: number;
	pixelHeight?: number;
	center?: Vec2;
}
declare class Camera {
	worldWidth: number;
	worldHeight: number;
	pixelWidth: number;
	pixelHeight: number;
	center: Vec2;
	constructor(opts?: CameraOptions);
	getWorldToPixel(): Mat3;
	getPixelToWorld(): Mat3;
	/** Visible world width accounting for letterboxing */
	get visibleWidth(): number;
	/** Visible world height accounting for letterboxing */
	get visibleHeight(): number;
}
interface GridProps {
	/** Provide the camera to auto-size the grid to the viewport */
	camera?: Camera;
	xMin?: number;
	xMax?: number;
	yMin?: number;
	yMax?: number;
	step?: number;
	style?: Style;
	axisStyle?: Style;
	color?: Color | string;
	axisColor?: Color | string;
}
type PathCommand = {
	type: "M";
	to: Vec2;
} | {
	type: "L";
	to: Vec2;
} | {
	type: "C";
	cp1: Vec2;
	cp2: Vec2;
	to: Vec2;
} | {
	type: "Z";
};
interface PathProps {
	commands?: PathCommand[];
	style?: Style;
}
declare class PathShape extends Shape {
	commands: PathCommand[];
	constructor(props?: PathProps);
	getBounds(): BoundingBox;
	M(x: number, y: number): this;
	L(x: number, y: number): this;
	C(cp1x: number, cp1y: number, cp2x: number, cp2y: number, x: number, y: number): this;
	Z(): this;
}
interface Renderer {
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
interface SceneOptions extends CameraOptions {
	theme?: "dark" | "light" | Theme;
	background?: string | Color;
}
declare class Scene {
	readonly root: Group;
	readonly camera: Camera;
	readonly background: string;
	readonly theme: Theme;
	constructor(opts?: SceneOptions);
	add(...shapes: Shape[]): this;
	remove(shape: Shape): this;
	findById(id: ShapeId): Shape | null;
	render(renderer: Renderer): void;
	private _walk;
	private _findInGroup;
}
interface AnimationOptions {
	duration?: number;
	easing?: EasingFn;
}
interface Animation$1 {
	begin(): void;
	update(t: number): void;
	finish(): void;
	readonly duration: number;
	readonly easing: EasingFn;
	readonly targets: ReadonlyArray<Shape>;
}
interface SliderOptions {
	min: number;
	max: number;
	value: number;
	step?: number;
}
interface CheckboxOptions {
	value?: boolean;
}
interface SelectOptions {
	options: string[];
	value?: string;
}
interface TextOptions {
	value?: string;
	placeholder?: string;
}
interface ColorOptions {
	value?: string;
}
interface PanelOptions {
	position?: "top-right" | "top-left" | "bottom-right" | "bottom-left";
	title?: string;
	collapsed?: boolean;
}
interface ControlHandle<T> {
	readonly value: T;
	set(value: T): void;
	onChange(fn: (value: T) => void): void;
	dispose(): void;
	readonly element: HTMLElement;
}
interface ControlsManager {
	slider(label: string, opts: SliderOptions): ControlHandle<number>;
	checkbox(label: string, opts?: CheckboxOptions): ControlHandle<boolean>;
	select(label: string, opts: SelectOptions): ControlHandle<string>;
	text(label: string, opts?: TextOptions): ControlHandle<string>;
	color(label: string, opts?: ColorOptions): ControlHandle<string>;
	onUpdate(fn: () => void): void;
	panel(opts?: PanelOptions): HTMLElement;
	dispose(): void;
}
interface DraggableOptions {
	onDrag: (worldPos: Vec2) => void;
	onDragStart?: (worldPos: Vec2) => void;
	onDragEnd?: (worldPos: Vec2) => void;
	constrainX?: [
		number,
		number
	];
	constrainY?: [
		number,
		number
	];
}
interface HoverableOptions {
	onEnter: () => void;
	onLeave: () => void;
}
interface ClickableOptions {
	onClick: (worldPos: Vec2) => void;
}
interface InteractionManager {
	draggable(shape: Shape, opts: DraggableOptions): () => void;
	hoverable(shape: Shape, opts: HoverableOptions): () => void;
	clickable(shape: Shape, opts: ClickableOptions): () => void;
	dispose(): void;
}
interface BoundScene {
	scene: Scene;
	add: {
		<A extends Shape>(a: A): A;
		<A extends Shape, B extends Shape>(a: A, b: B): [
			A,
			B
		];
		<A extends Shape, B extends Shape, C extends Shape>(a: A, b: B, c: C): [
			A,
			B,
			C
		];
		<A extends Shape, B extends Shape, C extends Shape, D extends Shape>(a: A, b: B, c: C, d: D): [
			A,
			B,
			C,
			D
		];
		<A extends Shape, B extends Shape, C extends Shape, D extends Shape, E extends Shape>(a: A, b: B, c: C, d: D, e: E): [
			A,
			B,
			C,
			D,
			E
		];
		(...shapes: Shape[]): Shape[];
	};
	remove: (shape: Shape) => BoundScene;
	moveToFront: (shape: Shape) => void;
	moveToBack: (shape: Shape) => void;
	render: () => void;
	grid: (props?: Omit<GridProps, "camera">) => Group;
	play: (...args: (Animation$1 | AnimationOptions)[]) => Promise<void>;
	wait: (seconds: number) => Promise<void>;
	controls: ControlsManager;
	interact: InteractionManager;
}
declare global {
	const vizzy: typeof import("@vizzyjs/core") & typeof import("@vizzyjs/renderer-canvas");
	const scene: BoundScene;
	const add: BoundScene["add"];
	const play: BoundScene["play"];
	const wait: BoundScene["wait"];
	const grid: BoundScene["grid"];
	const render: BoundScene["render"];
}

export {};

export interface SliderOptions {
    min: number;
    max: number;
    value: number;
    step?: number;
}

export interface CheckboxOptions {
    value?: boolean;
}

export interface SelectOptions {
    options: string[];
    value?: string;
}

export interface TextOptions {
    value?: string;
    placeholder?: string;
}

export interface ColorOptions {
    value?: string;
}

export interface PanelOptions {
    position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
    title?: string;
    collapsed?: boolean;
}

export interface ControlHandle<T> {
    readonly value: T;
    set(value: T): void;
    onChange(fn: (value: T) => void): void;
    dispose(): void;
    readonly element: HTMLElement;
}

export interface ControlsManager {
    slider(label: string, opts: SliderOptions): ControlHandle<number>;
    checkbox(label: string, opts?: CheckboxOptions): ControlHandle<boolean>;
    select(label: string, opts: SelectOptions): ControlHandle<string>;
    text(label: string, opts?: TextOptions): ControlHandle<string>;
    color(label: string, opts?: ColorOptions): ControlHandle<string>;
    onUpdate(fn: () => void): void;
    panel(opts?: PanelOptions): HTMLElement;
    dispose(): void;
}

// --- Styles ---

let stylesInjected = false;

function injectStyles() {
    if (stylesInjected) return;
    stylesInjected = false;

    const style = document.createElement('style');
    style.setAttribute('data-vimath-controls', '');
    style.textContent = `
        .vimath-container {
            position: relative;
            display: inline-block;
        }
        .vimath-panel {
            position: absolute;
            display: flex;
            flex-direction: column;
            border-radius: 6px;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            font-size: 12px;
            z-index: 10;
            max-height: calc(100% - 16px);
            overflow: hidden;
        }
        .vimath-panel[data-theme="dark"] {
            background: rgba(23, 23, 23, 0.85);
            color: #e5e5e5;
            backdrop-filter: blur(8px);
            border: 1px solid #404040;
        }
        .vimath-panel[data-theme="light"] {
            background: rgba(255, 255, 255, 0.85);
            color: #171717;
            backdrop-filter: blur(8px);
            border: 1px solid #d4d4d4;
        }
        .vimath-panel__header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 6px 10px;
            cursor: pointer;
            user-select: none;
        }
        .vimath-panel__header:hover {
            opacity: 0.8;
        }
        .vimath-panel__title {
            font-size: 11px;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            opacity: 0.6;
        }
        .vimath-panel__toggle {
            font-size: 10px;
            opacity: 0.5;
            transition: transform 0.15s ease;
            margin-left: 4px;
        }
        .vimath-panel--collapsed .vimath-panel__toggle {
            transform: rotate(-90deg);
        }
        .vimath-panel__body {
            display: flex;
            flex-direction: column;
            gap: 6px;
            padding: 0 10px 10px;
            overflow-y: auto;
        }
        .vimath-panel--collapsed .vimath-panel__body {
            display: none;
        }
        .vimath-control {
            display: flex;
            flex-direction: column;
            gap: 2px;
        }
        .vimath-control label {
            font-size: 11px;
            font-weight: 500;
            opacity: 0.7;
        }
        .vimath-control__row {
            display: flex;
            align-items: center;
            gap: 6px;
        }
        .vimath-control input[type="range"] {
            flex: 1;
            min-width: 100px;
            accent-color: #3b82f6;
        }
        .vimath-control__value {
            font-size: 11px;
            font-variant-numeric: tabular-nums;
            min-width: 32px;
            text-align: right;
        }
        .vimath-control select,
        .vimath-control input[type="text"] {
            padding: 3px 6px;
            border-radius: 3px;
            font-size: 12px;
            font-family: inherit;
        }
        [data-theme="dark"] .vimath-control select,
        [data-theme="dark"] .vimath-control input[type="text"] {
            background: #2d2d2d;
            color: #e5e5e5;
            border: 1px solid #404040;
        }
        [data-theme="light"] .vimath-control select,
        [data-theme="light"] .vimath-control input[type="text"] {
            background: #ffffff;
            color: #171717;
            border: 1px solid #d4d4d4;
        }
        .vimath-control input[type="color"] {
            width: 32px;
            height: 24px;
            padding: 0;
            border: 1px solid #404040;
            border-radius: 3px;
            cursor: pointer;
        }
        .vimath-control--checkbox label {
            display: flex;
            align-items: center;
            gap: 6px;
            opacity: 1;
            cursor: pointer;
        }
        .vimath-control--checkbox label span {
            font-size: 11px;
            font-weight: 500;
            opacity: 0.7;
        }
    `;
    document.head.appendChild(style);
    stylesInjected = true;
}

// --- Control Handle Factory ---

function createHandle<T>(
    el: HTMLElement,
    initialValue: T,
    emitChange: () => void
): { handle: ControlHandle<T>; setValue: (v: T) => void } {
    let currentValue = initialValue;
    const listeners: ((value: T) => void)[] = [];

    const handle: ControlHandle<T> = {
        get value() {
            return currentValue;
        },
        set(value: T) {
            currentValue = value;
            emitChange();
        },
        onChange(fn: (value: T) => void) {
            listeners.push(fn);
        },
        dispose() {
            el.remove();
            listeners.length = 0;
        },
        get element() {
            return el;
        },
    };

    function setValue(v: T) {
        currentValue = v;
        for (const fn of listeners) fn(v);
        emitChange();
    }

    return { handle, setValue };
}

// --- ControlsManager Implementation ---

export function createControlsManager(canvas: HTMLCanvasElement, theme: string, renderFn: () => void): ControlsManager {
    const globalListeners: (() => void)[] = [];
    const handles: ControlHandle<unknown>[] = [];
    let panelEl: HTMLElement | null = null;
    let panelBodyEl: HTMLElement | null = null;
    let wrapperEl: HTMLElement | null = null;

    function emitChange() {
        for (const fn of globalListeners) fn();
        renderFn();
    }

    function maybeAppendToPanel(el: HTMLElement) {
        if (panelBodyEl) {
            panelBodyEl.appendChild(el);
        }
    }

    function formatNumber(n: number, step?: number): string {
        if (step !== undefined && step >= 1) return String(n);
        const decimals = step !== undefined ? Math.max(0, -Math.floor(Math.log10(step))) : 1;
        return n.toFixed(decimals);
    }

    const manager: ControlsManager = {
        slider(label: string, opts: SliderOptions): ControlHandle<number> {
            injectStyles();

            const el = document.createElement('div');
            el.className = 'vimath-control vimath-control--slider';

            const labelEl = document.createElement('label');
            labelEl.textContent = label;

            const row = document.createElement('div');
            row.className = 'vimath-control__row';

            const input = document.createElement('input');
            input.type = 'range';
            input.min = String(opts.min);
            input.max = String(opts.max);
            input.step = String(opts.step ?? 0.01);
            input.value = String(opts.value);

            const valueEl = document.createElement('span');
            valueEl.className = 'vimath-control__value';
            valueEl.textContent = formatNumber(opts.value, opts.step);

            row.append(input, valueEl);
            el.append(labelEl, row);

            const { handle, setValue } = createHandle<number>(el, opts.value, emitChange);

            input.addEventListener('input', () => {
                const v = parseFloat(input.value);
                valueEl.textContent = formatNumber(v, opts.step);
                setValue(v);
            });

            const originalSet = handle.set;
            handle.set = (v: number) => {
                input.value = String(v);
                valueEl.textContent = formatNumber(v, opts.step);
                originalSet.call(handle, v);
            };

            handles.push(handle as ControlHandle<unknown>);
            maybeAppendToPanel(el);
            return handle;
        },

        checkbox(label: string, opts: CheckboxOptions = {}): ControlHandle<boolean> {
            injectStyles();

            const el = document.createElement('div');
            el.className = 'vimath-control vimath-control--checkbox';

            const labelEl = document.createElement('label');
            const input = document.createElement('input');
            input.type = 'checkbox';
            input.checked = opts.value ?? false;

            const span = document.createElement('span');
            span.textContent = label;
            labelEl.append(input, span);
            el.appendChild(labelEl);

            const { handle, setValue } = createHandle<boolean>(el, opts.value ?? false, emitChange);

            input.addEventListener('change', () => {
                setValue(input.checked);
            });

            const originalSet = handle.set;
            handle.set = (v: boolean) => {
                input.checked = v;
                originalSet.call(handle, v);
            };

            handles.push(handle as ControlHandle<unknown>);
            maybeAppendToPanel(el);
            return handle;
        },

        select(label: string, opts: SelectOptions): ControlHandle<string> {
            injectStyles();

            const el = document.createElement('div');
            el.className = 'vimath-control vimath-control--select';

            const labelEl = document.createElement('label');
            labelEl.textContent = label;

            const selectEl = document.createElement('select');
            for (const opt of opts.options) {
                const optionEl = document.createElement('option');
                optionEl.value = opt;
                optionEl.textContent = opt;
                selectEl.appendChild(optionEl);
            }
            selectEl.value = opts.value ?? opts.options[0] ?? '';

            el.append(labelEl, selectEl);

            const initialValue = opts.value ?? opts.options[0] ?? '';
            const { handle, setValue } = createHandle<string>(el, initialValue, emitChange);

            selectEl.addEventListener('change', () => {
                setValue(selectEl.value);
            });

            const originalSet = handle.set;
            handle.set = (v: string) => {
                selectEl.value = v;
                originalSet.call(handle, v);
            };

            handles.push(handle as ControlHandle<unknown>);
            maybeAppendToPanel(el);
            return handle;
        },

        text(label: string, opts: TextOptions = {}): ControlHandle<string> {
            injectStyles();

            const el = document.createElement('div');
            el.className = 'vimath-control vimath-control--text';

            const labelEl = document.createElement('label');
            labelEl.textContent = label;

            const input = document.createElement('input');
            input.type = 'text';
            input.value = opts.value ?? '';
            if (opts.placeholder) input.placeholder = opts.placeholder;

            el.append(labelEl, input);

            const { handle, setValue } = createHandle<string>(el, opts.value ?? '', emitChange);

            input.addEventListener('input', () => {
                setValue(input.value);
            });

            const originalSet = handle.set;
            handle.set = (v: string) => {
                input.value = v;
                originalSet.call(handle, v);
            };

            handles.push(handle as ControlHandle<unknown>);
            maybeAppendToPanel(el);
            return handle;
        },

        color(label: string, opts: ColorOptions = {}): ControlHandle<string> {
            injectStyles();

            const el = document.createElement('div');
            el.className = 'vimath-control vimath-control--color';

            const labelEl = document.createElement('label');
            labelEl.textContent = label;

            const row = document.createElement('div');
            row.className = 'vimath-control__row';

            const input = document.createElement('input');
            input.type = 'color';
            input.value = opts.value ?? '#ffffff';

            const valueEl = document.createElement('span');
            valueEl.className = 'vimath-control__value';
            valueEl.textContent = opts.value ?? '#ffffff';

            row.append(input, valueEl);
            el.append(labelEl, row);

            const { handle, setValue } = createHandle<string>(el, opts.value ?? '#ffffff', emitChange);

            input.addEventListener('input', () => {
                valueEl.textContent = input.value;
                setValue(input.value);
            });

            const originalSet = handle.set;
            handle.set = (v: string) => {
                input.value = v;
                valueEl.textContent = v;
                originalSet.call(handle, v);
            };

            handles.push(handle as ControlHandle<unknown>);
            maybeAppendToPanel(el);
            return handle;
        },

        onUpdate(fn: () => void) {
            globalListeners.push(fn);
        },

        panel(opts: PanelOptions = {}): HTMLElement {
            if (panelEl) return panelEl;

            injectStyles();

            const position = opts.position ?? 'top-right';
            const title = opts.title ?? 'Controls';
            const collapsed = opts.collapsed ?? false;

            // Wrap canvas in a container
            wrapperEl = document.createElement('div');
            wrapperEl.className = 'vimath-container';
            canvas.parentElement!.insertBefore(wrapperEl, canvas);
            wrapperEl.appendChild(canvas);

            // Create panel
            panelEl = document.createElement('div');
            panelEl.className = 'vimath-panel' + (collapsed ? ' vimath-panel--collapsed' : '');
            panelEl.setAttribute('data-theme', theme);

            // Position
            const positions: Record<string, string> = {
                'top-right': 'top: 8px; right: 8px;',
                'top-left': 'top: 8px; left: 8px;',
                'bottom-right': 'bottom: 8px; right: 8px;',
                'bottom-left': 'bottom: 8px; left: 8px;',
            };
            panelEl.style.cssText = positions[position]!;

            // Header with collapse toggle
            const header = document.createElement('div');
            header.className = 'vimath-panel__header';

            const titleEl = document.createElement('span');
            titleEl.className = 'vimath-panel__title';
            titleEl.textContent = title;

            const toggleEl = document.createElement('span');
            toggleEl.className = 'vimath-panel__toggle';
            toggleEl.textContent = '\u25BC';

            header.append(titleEl, toggleEl);
            header.addEventListener('click', () => {
                panelEl!.classList.toggle('vimath-panel--collapsed');
            });

            // Body for controls
            panelBodyEl = document.createElement('div');
            panelBodyEl.className = 'vimath-panel__body';

            panelEl.append(header, panelBodyEl);
            wrapperEl.appendChild(panelEl);

            // Move existing control elements into body
            for (const handle of handles) {
                panelBodyEl.appendChild(handle.element);
            }

            return panelEl;
        },

        dispose() {
            for (const handle of handles) {
                handle.dispose();
            }
            handles.length = 0;
            globalListeners.length = 0;

            if (panelEl) {
                panelEl.remove();
                panelEl = null;
            }
            if (wrapperEl) {
                // Unwrap canvas
                wrapperEl.parentElement!.insertBefore(canvas, wrapperEl);
                wrapperEl.remove();
                wrapperEl = null;
            }
        },
    };

    return manager;
}

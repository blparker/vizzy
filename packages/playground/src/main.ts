import * as monaco from 'monaco-editor';
import { examples } from './examples/index';
import { runCode } from './runner';

// Configure Monaco workers
self.MonacoEnvironment = {
    getWorker(_workerId: string, label: string) {
        if (label === 'typescript' || label === 'javascript') {
            return new Worker(
                new URL('monaco-editor/esm/vs/language/typescript/ts.worker.js', import.meta.url),
                { type: 'module' },
            );
        }
        return new Worker(
            new URL('monaco-editor/esm/vs/editor/editor.worker.js', import.meta.url),
            { type: 'module' },
        );
    },
};

const select = document.getElementById('examples') as HTMLSelectElement;
const editorContainer = document.getElementById('editor') as HTMLDivElement;
const canvas = document.getElementById('canvas') as HTMLCanvasElement;
const runBtn = document.getElementById('run') as HTMLButtonElement;
const errorEl = document.getElementById('error') as HTMLDivElement;
const themeBtn = document.getElementById('theme-toggle') as HTMLButtonElement;

// Disable TypeScript diagnostics — our code runs via new Function() with injected globals
monaco.languages.typescript.typescriptDefaults.setDiagnosticsOptions({
    noSemanticValidation: true,
    noSyntaxValidation: false,
});

// Create Monaco editor
const editor = monaco.editor.create(editorContainer, {
    value: '',
    language: 'typescript',
    theme: 'vs-dark',
    minimap: { enabled: false },
    fontSize: 13,
    lineNumbers: 'on',
    scrollBeyondLastLine: false,
    automaticLayout: true,
    tabSize: 4,
    padding: { top: 12 },
});

// Cmd/Ctrl+Enter to run
editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, () => run());

// Theme state
let currentTheme: 'dark' | 'light' = 'dark';

function setTheme(theme: 'dark' | 'light') {
    currentTheme = theme;
    monaco.editor.setTheme(theme === 'dark' ? 'vs-dark' : 'vs');
    document.body.setAttribute('data-theme', theme);
    themeBtn.textContent = theme === 'dark' ? '☀️ Light' : '🌙 Dark';
    run();
}

// Populate example selector
examples.forEach((ex, i) => {
    const opt = document.createElement('option');
    opt.value = String(i);
    opt.textContent = ex.name;
    select.appendChild(opt);
});

function loadExample(index: number) {
    const ex = examples[index]!;
    editor.setValue(ex.source);
    run();
}

// Store the original canvas dimensions (before any DPR scaling)
const canvasDisplayWidth = 800;
const canvasDisplayHeight = 457;

function run() {
    errorEl.textContent = '';
    errorEl.style.display = 'none';

    // Clean up previous controls panel (unwrap canvas if it was wrapped)
    const wrapper = canvas.parentElement;
    if (wrapper?.classList.contains('vizzy-container')) {
        wrapper.parentElement!.insertBefore(canvas, wrapper);
        wrapper.remove();
    }

    // Reset to original display dimensions so the renderer can apply DPR fresh
    canvas.width = canvasDisplayWidth;
    canvas.height = canvasDisplayHeight;
    canvas.style.width = '';
    canvas.style.height = '';

    runCode(canvas, editor.getValue(), currentTheme).then((result) => {
        if (result.error) {
            errorEl.textContent = result.error;
            errorEl.style.display = 'block';
        }
    });
}

// Events
select.addEventListener('change', () => loadExample(Number(select.value)));
runBtn.addEventListener('click', run);
themeBtn.addEventListener('click', () => setTheme(currentTheme === 'dark' ? 'light' : 'dark'));

// Load first example on start
loadExample(0);

if (import.meta.hot) {
    import.meta.hot.accept();
}

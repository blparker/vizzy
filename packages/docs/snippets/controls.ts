import type { Snippet } from './types';

const snippet: Snippet = {
    title: 'Controls',
    description: 'Sliders and checkboxes that update the scene in real time.',
    category: 'Interactivity',
    code: `controls.panel();

const radius = controls.slider('Radius', { min: 0.1, max: 3, value: 1, step: 0.1 });
const showGrid = controls.checkbox('Show Grid', { value: true });
const fillColor = controls.color('Fill', { value: '#0ea5e9' });

let g = grid();
const c = circle({ radius: radius.value, style: { fill: fillColor.value } });
add(c);

controls.onUpdate(() => {
    c.radius = radius.value;
    c.setStyle({ fill: fillColor.value });
    g.visible = showGrid.value;
});
`,
};

export default snippet;

import type { Snippet } from './types';

const snippet: Snippet = {
    title: 'Draggable',
    description: 'Drag a point and see its coordinates update live.',
    category: 'Interactivity',
    code: `export default function({ add, interact, grid, render }) {
    grid();

    const dot = circle({ radius: 0.2, style: { fill: sky, stroke: null } });
    const label = text({
        content: '(0.0, 0.0)',
        position: [0, 0.5],
        style: { fill: white, fontSize: 0.25 },
    });
    add(dot, label);

    interact.draggable(dot, {
        onDrag(pos) {
            dot.moveTo(pos);
            label.position = [pos[0], pos[1] + 0.5];
            label.content = '(' + pos[0].toFixed(1) + ', ' + pos[1].toFixed(1) + ')';
        },
    });

    render();
}`,
};

export default snippet;

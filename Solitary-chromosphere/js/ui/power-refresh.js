// Power Panel refresh - Make draggable when it appears
setInterval(() => {
    const panel = document.getElementById('power-panel');
    if (panel && window.draggableUI && !panel._draggableInitialized) {
        const handle = panel.querySelector('.drag-handle');
        if (handle) {
            window.draggableUI.makeDraggable(panel, 'power-panel', '.drag-handle');
            panel._draggableInitialized = true;
            console.log('[PowerUI] Made draggable');
        }
    }
}, 100);

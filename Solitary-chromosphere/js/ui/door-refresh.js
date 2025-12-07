// Door Panel refresh - Make draggable when it appears
setInterval(() => {
    const panel = document.getElementById('door-panel');
    if (panel && window.draggableUI && !panel._draggableInitialized) {
        const handle = panel.querySelector('.drag-handle');
        if (handle) {
            window.draggableUI.makeDraggable(panel, 'door-panel', '.drag-handle');
            panel._draggableInitialized = true;
            console.log('[DoorUI] Made draggable');
        }
    }
}, 100);

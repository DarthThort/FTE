/**
 * DraggableUI - Makes UI panels draggable and saves positions
 * Usage: DraggableUI.makeDraggable(panelElement, panelId)
 */

class DraggableUI {
    constructor() {
        this.positions = this.loadPositions();
    }

    /**
     * Make a panel draggable
     * @param {HTMLElement} panel - The panel element
     * @param {string} panelId - Unique ID for saving position
     * @param {string} handleSelector - CSS selector for drag handle (optional, defaults to entire panel)
     */
    makeDraggable(panel, panelId, handleSelector = null) {
        if (!panel) {
            console.error('[DraggableUI] Panel is null');
            return;
        }

        console.log('[DraggableUI] Making draggable:', panelId, 'with handle:', handleSelector);

        // Set initial position from saved data or current position
        const savedPos = this.positions[panelId];
        if (savedPos) {
            panel.style.left = savedPos.x;
            panel.style.top = savedPos.y;
            console.log('[DraggableUI] Restored position:', savedPos);
        }

        // Ensure panel is absolutely positioned
        if (getComputedStyle(panel).position !== 'absolute') {
            panel.style.position = 'absolute';
        }

        const handle = handleSelector ? panel.querySelector(handleSelector) : panel;
        if (!handle) {
            console.error('[DraggableUI] Handle not found:', handleSelector);
            return;
        }

        console.log('[DraggableUI] Handle found:', handle);

        // Add drag cursor to handle
        handle.style.cursor = 'move';

        // Remove any bottom/right positioning to avoid stretching
        const computedStyle = getComputedStyle(panel);
        if (computedStyle.bottom !== 'auto') {
            // Convert bottom position to top before removing
            const rect = panel.getBoundingClientRect();
            panel.style.top = rect.top + 'px';
            panel.style.bottom = 'auto';
        }
        if (computedStyle.right !== 'auto') {
            const rect = panel.getBoundingClientRect();
            panel.style.left = rect.left + 'px';
            panel.style.right = 'auto';
        }

        let isDragging = false;
        let startX, startY, startLeft, startTop;

        const onMouseDown = (e) => {
            // Only drag on left click
            if (e.button !== 0) return;

            // Don't drag if clicking on buttons or inputs
            if (e.target.tagName === 'BUTTON' || e.target.tagName === 'INPUT' ||
                e.target.tagName === 'SELECT' || e.target.closest('button')) {
                return;
            }

            isDragging = true;
            startX = e.clientX;
            startY = e.clientY;
            startLeft = panel.offsetLeft;
            startTop = panel.offsetTop;

            panel.style.zIndex = '1000'; // Bring to front while dragging
            e.preventDefault();
        };

        const onMouseMove = (e) => {
            if (!isDragging) return;

            const deltaX = e.clientX - startX;
            const deltaY = e.clientY - startY;

            let newLeft = startLeft + deltaX;
            let newTop = startTop + deltaY;

            // Keep panel within viewport bounds
            const maxLeft = window.innerWidth - panel.offsetWidth;
            const maxTop = window.innerHeight - panel.offsetHeight;

            newLeft = Math.max(0, Math.min(newLeft, maxLeft));
            newTop = Math.max(0, Math.min(newTop, maxTop));

            panel.style.left = newLeft + 'px';
            panel.style.top = newTop + 'px';
        };

        const onMouseUp = () => {
            if (isDragging) {
                isDragging = false;
                panel.style.zIndex = ''; // Reset z-index

                // Save position
                this.savePosition(panelId, panel.style.left, panel.style.top);
            }
        };

        handle.addEventListener('mousedown', onMouseDown);
        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);

        // Store cleanup function
        panel._cleanupDraggable = () => {
            handle.removeEventListener('mousedown', onMouseDown);
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseup', onMouseUp);
        };
    }

    /**
     * Save panel position to localStorage
     */
    savePosition(panelId, x, y) {
        this.positions[panelId] = { x, y };
        localStorage.setItem('uiPositions', JSON.stringify(this.positions));
    }

    /**
     * Load all saved positions from localStorage
     */
    loadPositions() {
        // Default positions for panels (matching current user layout)
        const defaultPositions = {
            'weapons-panel': { x: '12px', y: '567px' },
            'power-panel': { x: '1620px', y: '76px' },
            'door-panel': { x: '1399px', y: '734px' },
            'shield-panel': { x: '337px', y: '772px' }
        };

        try {
            const saved = localStorage.getItem('uiPositions');
            if (saved) {
                const parsed = JSON.parse(saved);
                // Merge defaults with saved (saved takes priority)
                return { ...defaultPositions, ...parsed };
            }
            return defaultPositions;
        } catch (e) {
            console.error('[DraggableUI] Error loading positions:', e);
            return defaultPositions;
        }
    }

    /**
     * Reset all positions to defaults
     */
    resetPositions() {
        this.positions = {};
        localStorage.removeItem('uiPositions');
        console.log('[DraggableUI] All positions reset');
    }

    /**
     * Get saved position for a panel
     */
    getPosition(panelId) {
        return this.positions[panelId] || null;
    }
}

// Create global instance
window.draggableUI = new DraggableUI();

// Debug command for resetting UI positions
if (window.debug) {
    window.debug.resetUIPositions = () => {
        window.draggableUI.resetPositions();
        console.log('[Debug] UI positions reset. Refresh page to see effect.');
    };
}

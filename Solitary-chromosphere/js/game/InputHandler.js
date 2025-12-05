class InputHandler {
    constructor(canvas) {
        this.keys = {};
        this.canvas = canvas;
        this.mouseX = 0;
        this.mouseY = 0;
        this.mouseClicked = false;

        window.addEventListener('keydown', (e) => {
            this.keys[e.code] = true;
        });

        window.addEventListener('keyup', (e) => {
            this.keys[e.code] = false;
        });

        // Mouse events
        canvas.addEventListener('mousemove', (e) => {
            const rect = canvas.getBoundingClientRect();
            this.mouseX = e.clientX - rect.left;
            this.mouseY = e.clientY - rect.top;

            // Calculate ship grid coordinates (accounting for ship rendering offset)
            this.updateCoordDisplay(this.mouseX, this.mouseY);
        });

        canvas.addEventListener('click', (e) => {
            const rect = canvas.getBoundingClientRect();
            this.mouseX = e.clientX - rect.left;
            this.mouseY = e.clientY - rect.top;
            this.mouseClicked = true;
        });
    }

    isDown(code) {
        return !!this.keys[code];
    }

    getMousePosition() {
        return { x: this.mouseX, y: this.mouseY };
    }

    wasClicked() {
        const clicked = this.mouseClicked;
        this.mouseClicked = false;
        return clicked;
    }

    updateCoordDisplay(mouseX, mouseY) {
        // Create display element if it doesn't exist
        if (!this.coordDisplay) {
            this.coordDisplay = document.createElement('div');
            this.coordDisplay.id = 'coord-display';
            this.coordDisplay.style.cssText = `
                position: fixed;
                top: 10px;
                left: 10px;
                background: rgba(0,0,0,0.85);
                color: #00f0ff;
                padding: 8px 12px;
                border: 1px solid #00f0ff;
                border-radius: 4px;
                font-family: 'Courier New', monospace;
                font-size: 0.85rem;
                z-index: 9999;
                pointer-events: none;
                box-shadow: 0 0 10px rgba(0,240,255,0.3);
            `;
            document.body.appendChild(this.coordDisplay);
        }

        // Calculate ship layout grid coordinates
        // Need to account for ship rendering offset (ship is centered in canvas)
        const tileSize = 32;

        // Get ship renderer offset (if available)
        let offsetX = 0;
        let offsetY = 0;

        if (window.game && window.game.shipRenderer) {
            offsetX = window.game.shipRenderer.offsetX || 0;
            offsetY = window.game.shipRenderer.offsetY || 0;
        }

        // Calculate position relative to ship layout
        const shipX = mouseX - offsetX;
        const shipY = mouseY - offsetY;
        const gridX = Math.floor(shipX / tileSize);
        const gridY = Math.floor(shipY / tileSize);

        // Update display text
        this.coordDisplay.innerHTML = `
            <div style="margin-bottom: 3px;">Canvas: (${Math.floor(mouseX)}, ${Math.floor(mouseY)})</div>
            <div style="color: #ffaa00; font-weight: bold;">Layout Grid: (${gridX}, ${gridY})</div>
        `;
    }
}

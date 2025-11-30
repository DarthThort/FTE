/**
 * DamageNumbers - Floating damage numbers display
 */

class DamageNumbers {
    constructor(game) {
        this.game = game;
        this.numbers = []; // Array of {x, y, value, color, time, startY}
        this.containerElement = null;
    }

    /**
     * Add a new damage number
     * @param {number} x - X position (screen coordinates)
     * @param {number} y - Y position (screen coordinates)
     * @param {number} value - Damage value to display
     * @param {string} color - Color of the text
     */
    add(x, y, value, color = '#ff0055') {
        this.numbers.push({
            x,
            y,
            value: Math.round(value),
            color,
            time: 1.5, // 1.5 second lifespan
            startY: y,
            id: Date.now() + Math.random()
        });
    }

    /**
     * Update all active damage numbers
     */
    update(dt) {
        this.numbers = this.numbers.filter(n => {
            n.time -= dt;
            // Float upward over time
            n.y = n.startY - (1 - (n.time / 1.5)) * 80; // Float up 80px
            return n.time > 0;
        });
    }

    /**
     * Render all damage numbers as HTML elements
     */
    render() {
        // Create container if doesn't exist
        if (!this.containerElement) {
            this.containerElement = document.getElementById('damage-numbers-container');
            if (!this.containerElement) {
                this.containerElement = document.createElement('div');
                this.containerElement.id = 'damage-numbers-container';
                this.containerElement.style.cssText = `
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    pointer-events: none;
                    z-index: 999;
                `;
                document.body.appendChild(this.containerElement);
            }
        }

        // Render each number
        this.containerElement.innerHTML = this.numbers.map(n => {
            const opacity = Math.min(1, n.time / 0.5); // Fade in first 0.5s, then stay visible
            const scale = 1 + (1 - (n.time / 1.5)) * 0.3; // Grow slightly

            return `
                <div style="
                    position: absolute;
                    left: ${n.x}px;
                    top: ${n.y}px;
                    transform: translate(-50%, -50%) scale(${scale});
                    color: ${n.color};
                    font-size: 24px;
                    font-weight: bold;
                    font-family: var(--font-tech), monospace;
                    text-shadow: 
                        0 0 4px ${n.color}, 
                        0 0 8px ${n.color},
                        2px 2px 0px rgba(0,0,0,0.8);
                    opacity: ${opacity};
                    pointer-events: none;
                    user-select: none;
                ">${n.value}</div>
            `;
        }).join('');
    }

    /**
     * Clear all damage numbers
     */
    clear() {
        this.numbers = [];
        if (this.containerElement) {
            this.containerElement.innerHTML = '';
        }
    }
}

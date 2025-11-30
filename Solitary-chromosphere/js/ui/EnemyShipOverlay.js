/**
 * EnemyShipOverlay - Minimal enemy ship status display
 * 
 * Shows in top-right corner:
 * - Enemy ship sprite/miniature
 * - Hull bar
 * - Shield layers
 * - Name
 */

class EnemyShipOverlay {
    constructor(game) {
        this.game = game;
        this.enemy = null;
    }

    /**
     * Initialize with enemy ship
     */
    initialize(enemy) {
        this.enemy = enemy;
    }

    /**
     * Render enemy ship overlay
     */
    render() {
        if (!this.enemy) return '';

        const hullPercent = (this.enemy.hull / this.enemy.maxHull) * 100;

        return `
            <div id="enemy-ship-overlay" style="
                position: fixed;
                top: 20px;
                left: 280px;
                background: rgba(10, 10, 25, 0.95);
                border: 2px solid var(--warning);
                border-radius: 12px;
                padding: 15px;
                min-width: 250px;
                z-index: 900;
                font-family: var(--font-tech);
                box-shadow: 0 0 20px rgba(255,0,85,0.3);
            ">
                <!-- Enemy Name -->
                <div style="
                    text-align: center;
                    color: var(--warning);
                    font-weight: bold;
                    font-size: 1rem;
                    margin-bottom: 10px;
                    text-transform: uppercase;
                    letter-spacing: 1px;
                ">⚔️ ${this.enemy.name}</div>
                
                <!-- Enemy Ship Visual -->
                <div style="
                    text-align: center;
                    font-size: 3rem;
                    margin: 10px 0;
                    filter: drop-shadow(0 0 8px rgba(255,0,85,0.5));
                ">🚀</div>
                
                <!-- Hull Bar -->
                <div style="margin-bottom: 10px;">
                    <div style="
                        display: flex;
                        justify-content: space-between;
                        font-size: 0.75rem;
                        margin-bottom: 4px;
                        color: #fff;
                    ">
                        <span>❤️ HULL</span>
                        <span>${Math.round(this.enemy.hull)}/${Math.round(this.enemy.maxHull)}</span>
                    </div>
                    <div style="
                        width: 100%;
                        height: 12px;
                        background: rgba(255,255,255,0.1);
                        border-radius: 6px;
                        overflow: hidden;
                        border: 1px solid rgba(255,0,85,0.3);
                    ">
                        <div style="
                            width: ${hullPercent}%;
                            height: 100%;
                            background: linear-gradient(90deg, #ff0055, #aa0033);
                            transition: width 0.3s;
                        "></div>
                    </div>
                </div>
                
                <!-- Shield Layers -->
                <div>
                    <div style="
                        font-size: 0.75rem;
                        margin-bottom: 4px;
                        color: #fff;
                    ">🛡️ SHIELDS: ${this.enemy.shields}</div>
                    <div style="display: flex; gap: 4px;">
                        ${this.renderShieldLayers(this.enemy.shields, this.enemy.maxShields)}
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Render shield layers
     */
    renderShieldLayers(current, max) {
        let html = '';
        for (let i = 0; i < max; i++) {
            const active = i < current;
            html += `
                <div style="
                    width: 20px;
                    height: 20px;
                    border-radius: 50%;
                    border: 2px solid ${active ? '#ff0055' : 'rgba(255,255,255,0.2)'};
                    background: ${active ? 'rgba(255,0,85,0.2)' : 'transparent'};
                    box-shadow: ${active ? '0 0 6px #ff0055' : 'none'};
                    transition: all 0.2s;
                "></div>
            `;
        }
        return html;
    }

    /**
     * Update overlay (called each frame)
     */
    update() {
        const overlay = document.getElementById('enemy-ship-overlay');
        if (overlay && this.enemy) {
            overlay.outerHTML = this.render();
        }
    }
}

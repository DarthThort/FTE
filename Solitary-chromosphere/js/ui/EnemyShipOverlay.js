/**
 * EnemyShipOverlay - Sleek status overlay for the targeted hostile ship
 */
class EnemyShipOverlay {
    constructor(game) {
        this.game = game;
        this.enemy = null;
    }

    initialize(enemy) {
        this.enemy = enemy;
    }

    render() {
        if (!this.enemy) return '';

        const hullPercent = Math.max(0, Math.min(100, (this.enemy.hull / this.enemy.maxHull) * 100));
        const shieldPercent = this.enemy.maxShields > 0 ? (this.enemy.shields / this.enemy.maxShields) * 100 : 0;

        return `
            <div id="enemy-ship-overlay" class="enemy-overlay-panel" style="
                position: fixed;
                top: 75px;
                right: 25px;
                width: 310px;
                background: rgba(10, 16, 31, 0.92);
                border: 1px solid var(--danger);
                border-radius: 8px;
                padding: 14px;
                z-index: 999;
                box-shadow: 0 0 25px rgba(255, 51, 102, 0.35);
                backdrop-filter: blur(8px);
            ">
                <!-- Header / Name -->
                <div style="
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 10px;
                    border-bottom: 1px solid rgba(255, 51, 102, 0.3);
                    padding-bottom: 6px;
                ">
                    <span style="
                        font-family: var(--font-header);
                        color: var(--danger);
                        font-size: 0.95rem;
                        font-weight: 700;
                        letter-spacing: 1px;
                        text-shadow: var(--danger-glow);
                    ">⚠️ ${this.enemy.name || 'HOSTILE VESSEL'}</span>
                    <span style="font-size: 0.8rem; color: var(--text-dim); font-family: var(--font-header);">TARGET</span>
                </div>
                
                <!-- Hull Health Bar -->
                <div style="margin-bottom: 10px;">
                    <div style="display: flex; justify-content: space-between; font-size: 0.8rem; margin-bottom: 4px; font-family: var(--font-header);">
                        <span style="color: var(--text-main);">HULL INTEGRITY</span>
                        <span style="color: var(--danger); font-weight: 700;">${Math.round(this.enemy.hull)} / ${Math.round(this.enemy.maxHull)}</span>
                    </div>
                    <div style="
                        width: 100%;
                        height: 12px;
                        background: rgba(255, 255, 255, 0.08);
                        border-radius: 4px;
                        overflow: hidden;
                        border: 1px solid rgba(255, 51, 102, 0.4);
                    ">
                        <div style="
                            width: ${hullPercent}%;
                            height: 100%;
                            background: linear-gradient(90deg, #ff3366, #ff0000);
                            box-shadow: 0 0 10px rgba(255, 51, 102, 0.8);
                            transition: width 0.3s ease;
                        "></div>
                    </div>
                </div>
                
                <!-- Shields Bar & Layers -->
                <div>
                    <div style="display: flex; justify-content: space-between; font-size: 0.8rem; margin-bottom: 4px; font-family: var(--font-header);">
                        <span style="color: var(--primary);">SHIELD LAYERS</span>
                        <span style="color: var(--primary); font-weight: 700;">${this.enemy.shields} / ${this.enemy.maxShields}</span>
                    </div>
                    
                    <div style="
                        width: 100%;
                        height: 10px;
                        background: rgba(255, 255, 255, 0.08);
                        border-radius: 4px;
                        overflow: hidden;
                        border: 1px solid rgba(0, 240, 255, 0.4);
                        margin-bottom: 8px;
                    ">
                        <div style="
                            width: ${shieldPercent}%;
                            height: 100%;
                            background: linear-gradient(90deg, #00f0ff, #00aaff);
                            box-shadow: 0 0 10px rgba(0, 240, 255, 0.8);
                            transition: width 0.3s ease;
                        "></div>
                    </div>
                    
                    <div style="display: flex; gap: 6px; justify-content: center;">
                        ${this.renderShieldLayers(this.enemy.shields, this.enemy.maxShields)}
                    </div>
                </div>
            </div>
        `;
    }

    renderShieldLayers(current, max) {
        let html = '';
        for (let i = 0; i < max; i++) {
            const active = i < current;
            html += `
                <div style="
                    width: 18px;
                    height: 18px;
                    border-radius: 50%;
                    border: 2px solid ${active ? '#00f0ff' : 'rgba(255, 255, 255, 0.2)'};
                    background: ${active ? 'rgba(0, 240, 255, 0.4)' : 'transparent'};
                    box-shadow: ${active ? '0 0 8px #00f0ff' : 'none'};
                    transition: all 0.2s ease;
                "></div>
            `;
        }
        return html;
    }

    update() {
        const overlay = document.getElementById('enemy-ship-overlay');
        if (overlay && this.enemy) {
            overlay.outerHTML = this.render();
        }
    }
}

/**
 * CombatUI - Tactical combat interface overlay
 */
class CombatUI {
    constructor(game) {
        this.game = game;
        this.combatManager = null;
    }

    initialize(combatManager) {
        this.combatManager = combatManager;
    }

    handlePauseClick() {
        if (this.combatManager) {
            this.combatManager.togglePause();
        }
    }

    render() {
        if (!this.combatManager || !this.combatManager.active) {
            return '';
        }

        const isPaused = this.combatManager.paused;

        return `
            <div id="combat-status-banner" style="
                position: fixed;
                top: 20px;
                left: 50%;
                transform: translateX(-50%);
                background: rgba(10, 16, 31, 0.92);
                border: 1px solid ${isPaused ? 'var(--warning)' : 'var(--danger)'};
                border-radius: 6px;
                padding: 8px 24px;
                z-index: 1000;
                font-family: var(--font-header);
                box-shadow: ${isPaused ? '0 0 20px rgba(255, 204, 0, 0.4)' : '0 0 20px rgba(255, 51, 102, 0.4)'};
                display: flex;
                align-items: center;
                gap: 16px;
                pointer-events: auto;
            ">
                <span style="
                    color: ${isPaused ? 'var(--warning)' : 'var(--danger)'};
                    font-weight: 700;
                    font-size: 0.95rem;
                    letter-spacing: 2px;
                ">
                    ${isPaused ? '⏸️ TACTICAL PAUSE' : '⚔️ COMBAT ENGAGED'}
                </span>
            </div>
        `;
    }

    showVictoryScreen(rewards = {}) {
        const scrap = rewards.scrap || Math.floor(25 + Math.random() * 35);
        const fuel = rewards.fuel || Math.floor(1 + Math.random() * 3);
        const missiles = rewards.missiles || Math.floor(1 + Math.random() * 2);

        // Apply rewards to player state
        if (this.game.state) {
            this.game.state.credits = (this.game.state.credits || 0) + scrap;
            this.game.state.ship.fuel = Math.min(this.game.state.ship.maxFuel, (this.game.state.ship.fuel || 0) + fuel);
            this.game.state.ship.missiles = (this.game.state.ship.missiles || 0) + missiles;
        }

        return `
            <div id="combat-result" class="modal-overlay" style="z-index: 999999;">
                <div class="modal-window" style="max-width: 500px; text-align: center; border-color: var(--secondary);">
                    <h2 style="color: var(--secondary); text-shadow: 0 0 15px var(--secondary); margin-bottom: 1rem;">VICTORY ACHIEVED!</h2>
                    <p style="color: var(--text-main); font-size: 1.1rem; margin-bottom: 1.5rem;">
                        The enemy vessel has been destroyed! Salvage team gathered remaining resources:
                    </p>
                    
                    <div style="background: rgba(0,0,0,0.4); border: 1px solid rgba(0,255,157,0.3); padding: 15px; border-radius: 6px; margin-bottom: 1.5rem;">
                        <div style="display: flex; justify-content: space-around; font-family: var(--font-header); font-size: 1.1rem;">
                            <span style="color: var(--warning);">⚙️ Scrap: +${scrap}</span>
                            <span style="color: var(--primary);">⛽ Fuel: +${fuel}</span>
                            <span style="color: var(--danger);">🚀 Missiles: +${missiles}</span>
                        </div>
                    </div>

                    <button id="btn-combat-continue" class="secondary" style="width: 100%; padding: 12px;">CONTINUE MISSION</button>
                </div>
            </div>
        `;
    }

    showDefeatScreen() {
        return `
            <div id="combat-result" class="modal-overlay" style="z-index: 999999;">
                <div class="modal-window" style="max-width: 500px; text-align: center; border-color: var(--danger);">
                    <h2 style="color: var(--danger); text-shadow: var(--danger-glow); margin-bottom: 1rem;">SHIP DESTROYED</h2>
                    <p style="color: var(--text-main); font-size: 1.1rem; margin-bottom: 1.5rem;">
                        Your ship's hull has breached. The vessel and crew are lost in space...
                    </p>

                    <button id="btn-combat-restart" class="danger" style="width: 100%; padding: 12px;">RESTART MISSION</button>
                </div>
            </div>
        `;
    }

    attachEventListeners() {
        setTimeout(() => {
            const btnContinue = document.getElementById('btn-combat-continue');
            if (btnContinue) {
                btnContinue.onclick = () => {
                    const resultEl = document.getElementById('combat-result');
                    if (resultEl) resultEl.remove();
                    if (this.combatManager) this.combatManager.active = false;
                    const container = document.getElementById('combat-ui-container');
                    if (container) container.innerHTML = '';
                    this.game.sceneManager.changeScene('SHIP');
                };
            }

            const btnRestart = document.getElementById('btn-combat-restart');
            if (btnRestart) {
                btnRestart.onclick = () => {
                    localStorage.clear();
                    location.reload();
                };
            }
        }, 50);
    }
}

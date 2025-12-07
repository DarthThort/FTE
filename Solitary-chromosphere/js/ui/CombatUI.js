/**
 * CombatUI - Basic combat interface display
 * 
 * Shows:
 * - Enemy ship status (hull, shields, name)
 * - Player ship status
 * - Pause/Resume button
 * - Combat outcome messages
 */

class CombatUI {
    constructor(game) {
        this.game = game;
        this.combatManager = null;
    }

    /**
     * Initialize combat UI with combat manager
     */
    initialize(combatManager) {
        this.combatManager = combatManager;
        this.render();
    }

    /**
     * Handle pause button click
     */
    handlePauseClick() {
        console.log('[CombatUI] Pause button clicked!');
        if (this.combatManager) {
            this.combatManager.togglePause();
            this.refresh();
        } else {
            console.error('[CombatUI] No combatManager available!');
        }
    }

    /**
     * Render combat UI
     */
    render() {
        if (!this.combatManager || !this.combatManager.active) {
            return '';
        }

        const status = this.combatManager.getStatus();

        const content = `
            <div id="combat-ui" style="
                position: fixed;
                top: 20px;
                left: 50%;
                transform: translateX(-50%);
                background: rgba(10, 10, 25, 0.95);
                border: 2px solid var(--warning);
                border-radius: 8px;
                padding: 12px 24px;
                z-index: 1000;
                font-family: var(--font-tech);
                box-shadow: 0 0 20px rgba(255,0,85,0.3);
                display: flex;
                align-items: center;
                gap: 20px;
                min-width: 300px;
            ">
                <!-- Combat Status -->
                <div style="
                    color: var(--warning);
                    font-weight: bold;
                    font-size: 1rem;
                    text-transform: uppercase;
                    letter-spacing: 1px;
                ">⚔️ COMBAT ACTIVE</div>
                
                <!-- Escape Button -->
                <button id="combat-escape-btn" onclick="
                    if (window.game && window.game.state.combatManager) {
                        window.game.state.combatManager.attemptPlayerEscape();
                    }
                " style="
                    padding: 8px 16px;
                    background: rgba(255,170,0,0.2);
                    border: 2px solid var(--warning);
                    color: var(--warning);
                    border-radius: 6px;
                    cursor: pointer;
                    font-family: var(--font-tech);
                    font-weight: bold;
                    font-size: 0.9rem;
                    text-transform: uppercase;
                    transition: all 0.2s;
                " onmouseover="this.style.background='rgba(255,170,0,0.4)'" 
                   onmouseout="this.style.background='rgba(255,170,0,0.2)'">
                    🏃 ESCAPE
                </button>
            </div>
        `;

        return content;
    }

    /**
     * Render shield layers as circles
     */
    renderShieldLayers(current, max) {
        let html = '';
        for (let i = 0; i < max; i++) {
            const active = i < current;
            html += `
                <div style="
                    width: 24px;
                    height: 24px;
                    border-radius: 50%;
                    border: 2px solid ${active ? '#00ff55' : 'rgba(255,255,255,0.2)'};
                    background: ${active ? 'rgba(0,255,85,0.2)' : 'transparent'};
                    box-shadow: ${active ? '0 0 8px #00ff55' : 'none'};
                    transition: all 0.2s;
                "></div>
            `;
        }
        return html;
    }

    /**
     * Show victory screen
     */
    showVictoryScreen(rewards) {
        const content = `
            <div id="combat-result" style="
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                background: rgba(10, 10, 25, 0.98);
                border: 3px solid #00ff55;
                border-radius: 12px;
                padding: 40px;
                min-width: 400px;
                z-index: 999999;
                font-family: var(--font-tech);
                text-align: center;
                box-shadow: 0 0 50px rgba(0,255,85,0.5);
                pointer-events: auto;
            ">
                <h1 style="
                    margin: 0 0 20px 0;
                    color: #00ff55;
                    font-size: 2.5rem;
                    text-transform: uppercase;
                    letter-spacing: 3px;
                ">🎉 VICTORY! 🎉</h1>
                
                <div style="
                    font-size: 1.2rem;
                    color: #fff;
                    margin-bottom: 30px;
                ">
                    Enemy ship destroyed!
                </div>
                
                <div style="
                    background: rgba(0,0,0,0.3);
                    padding: 20px;
                    border-radius: 8px;
                    margin-bottom: 30px;
                ">
                    <h3 style="
                        margin: 0 0 15px 0;
                        color: var(--primary);
                        font-size: 1.2rem;
                    ">REWARDS</h3>
                    
                    <div style="
                        display: flex;
                        flex-direction: column;
                        gap: 10px;
                        font-size: 1.1rem;
                    ">
                        <div>💰 Credits: +${rewards.credits}</div>
                        <div>🔩 Scrap: +${rewards.scrap}</div>
                        ${rewards.systems.length > 0 ? `
                            <div>⚙️ Salvaged: ${rewards.systems[0].name}</div>
                        ` : ''}
                    </div>
                </div>
                
                <button onclick="
                    // Clear combat state
                    if (window.game && window.game.state.combatManager) {
                        window.game.state.combatManager = null;
                    }
                    if (window.game && window.game.state.currentEnemy) {
                        window.game.state.currentEnemy = null;
                    }
                    
                    // Remove UI elements
                    const combatUIContainer = document.getElementById('combat-ui-container');
                    const resultUI = document.getElementById('combat-result');
                    if (combatUIContainer) combatUIContainer.remove();
                    if (resultUI) resultUI.remove();
                " style="
                    padding: 15px 40px;
                    font-size: 1.2rem;
                    background: rgba(0,255,85,0.2);
                    border: 2px solid #00ff55;
                    color: #00ff55;
                    border-radius: 8px;
                    cursor: pointer;
                    font-family: var(--font-tech);
                    font-weight: bold;
                    text-transform: uppercase;
                ">CONTINUE</button>
            </div>
        `;

        return content;
    }

    /**
     * Show defeat screen
     */
    showDefeatScreen() {
        const content = `
            <div id="combat-result" style="
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                background: rgba(10, 10, 25, 0.98);
                border: 3px solid #ff0055;
                border-radius: 12px;
                padding: 40px;
                min-width: 400px;
                z-index: 999999;
                font-family: var(--font-tech);
                text-align: center;
                box-shadow: 0 0 50px rgba(255,0,85,0.5);
                pointer-events: auto;
            ">
                <h1 style="
                    margin: 0 0 20px 0;
                    color: #ff0055;
                    font-size: 2.5rem;
                    text-transform: uppercase;
                    letter-spacing: 3px;
                ">💥 DEFEAT 💥</h1>
                
                <div style="
                    font-size: 1.2rem;
                    color: #fff;
                    margin-bottom: 30px;
                ">
                    Your ship has been destroyed!
                </div>
                
                <div style="
                    display: flex;
                    gap: 15px;
                    justify-content: center;
                ">
                    <button onclick="
                        const state = window.game?.state;
                        if (state && state.loadPreTravelSave) {
                            state.loadPreTravelSave();
                        } else {
                            location.reload();
                        }
                    " style="
                        padding: 15px 30px;
                        font-size: 1.1rem;
                        background: rgba(0,240,255,0.2);
                        border: 2px solid var(--primary);
                        color: var(--primary);
                        border-radius: 8px;
                        cursor: pointer;
                        font-family: var(--font-tech);
                        font-weight: bold;
                        text-transform: uppercase;
                    ">RETRY</button>
                    
                    <button onclick="
                        localStorage.clear();
                        location.reload();
                    " style="
                        padding: 15px 30px;
                        font-size: 1.1rem;
                        background: rgba(255,0,85,0.2);
                        border: 2px solid #ff0055;
                        color: #ff0055;
                        border-radius: 8px;
                        cursor: pointer;
                        font-family: var(--font-tech);
                        font-weight: bold;
                        text-transform: uppercase;
                    ">NEW GAME</button>
                </div>
            </div>
        `;

        return content;
    }

    /**
     * Attach event listeners
     */
    attachEventListeners() {
        // Pause button
        const pauseBtn = document.getElementById('combat-pause-btn');
        if (pauseBtn && this.combatManager) {
            // Remove any existing listeners by cloning
            const newBtn = pauseBtn.cloneNode(true);
            pauseBtn.parentNode.replaceChild(newBtn, pauseBtn);

            // Add fresh event listener
            newBtn.addEventListener('click', () => {
                console.log('[CombatUI] Pause button clicked!');
                this.combatManager.togglePause();
                console.log('[CombatUI] Paused is now:', this.combatManager.paused);
                this.refresh();
            }, false);
        }

        // Victory continue
        const continueBtn = document.getElementById('combat-continue-btn');
        if (continueBtn) {
            continueBtn.onclick = () => {
                this.closeCombat();
            };
        }

        // Defeat buttons
        const retryBtn = document.getElementById('combat-retry-btn');
        if (retryBtn) {
            retryBtn.onclick = () => {
                // Load pre-travel save
                if (this.game.state.loadPreTravelSave) {
                    this.game.state.loadPreTravelSave();
                } else {
                    location.reload();
                }
            };
        }

        const newGameBtn = document.getElementById('combat-menu-btn');
        if (newGameBtn) {
            newGameBtn.onclick = () => {
                // Clear all saves and restart
                localStorage.clear();
                location.reload();
            };
        }
    }

    /**
     * Close combat UI
     */
    closeCombat() {
        const combatUI = document.getElementById('combat-ui');
        const resultUI = document.getElementById('combat-result');

        if (combatUI) combatUI.remove();
        if (resultUI) resultUI.remove();

        // Combat overlay removed - already in SHIP scene
        console.log('[Combat] Combat UI closed');
    }

    /**
     * Refresh UI
     */
    refresh() {
        const existingUI = document.getElementById('combat-ui');
        if (existingUI) {
            existingUI.outerHTML = this.render();
            this.attachEventListeners();
        }
    }
}

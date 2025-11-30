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
     * Render combat UI
     */
    render() {
        if (!this.combatManager || !this.combatManager.active) {
            return '';
        }

        const status = this.combatManager.getStatus();
        const enemy = this.combatManager.enemy;

        const content = `
            <div id="combat-ui" style="
                position: fixed;
                top: 20px;
                left: 50%;
                transform: translateX(-50%);
                background: rgba(10, 10, 25, 0.95);
                border: 2px solid var(--warning);
                border-radius: 12px;
                padding: 20px;
                min-width: 500px;
                z-index: 1000;
                font-family: var(--font-tech);
                box-shadow: 0 0 30px rgba(255,0,85,0.5);
            ">
                <!-- Header -->
                <div style="
                    text-align: center;
                    margin-bottom: 15px;
                    padding-bottom: 15px;
                    border-bottom: 2px solid var(--warning);
                ">
                    <h2 style="
                        margin: 0;
                        color: var(--warning);
                        font-size: 1.5rem;
                        text-transform: uppercase;
                        letter-spacing: 2px;
                    ">⚔️ COMBAT ⚔️</h2>
                    <div style="
                        margin-top: 8px;
                        font-size: 0.9rem;
                        color: #aaa;
                    ">
                        ${this.game.state.ship.name} vs ${enemy.name}
                    </div>
                </div>
                
                <!-- Ships Status -->
                <div style="
                    display: flex;
                    justify-content: space-between;
                    gap: 30px;
                    margin-bottom: 20px;
                ">
                    <!-- Player Ship -->
                    <div style="flex: 1;">
                        <div style="
                            font-size: 0.9rem;
                            color: var(--primary);
                            font-weight: bold;
                            margin-bottom: 8px;
                            text-align: center;
                        ">YOUR SHIP</div>
                        
                        <!-- Hull -->
                        <div style="margin-bottom: 8px;">
                            <div style="
                                display: flex;
                                justify-content: space-between;
                                font-size: 0.8rem;
                                margin-bottom: 4px;
                            ">
                                <span>❤️ HULL</span>
                                <span>${Math.round(status.playerHull)}/${status.playerMaxHull}</span>
                            </div>
                            <div style="
                                width: 100%;
                                height: 16px;
                                background: rgba(255,255,255,0.1);
                                border-radius: 4px;
                                overflow: hidden;
                            ">
                                <div style="
                                    width: ${(status.playerHull / status.playerMaxHull) * 100}%;
                                    height: 100%;
                                    background: linear-gradient(90deg, #00ff55, #00aa33);
                                    transition: width 0.3s;
                                "></div>
                            </div>
                        </div>
                        
                        <!-- Shields -->
                        <div>
                            <div style="
                                display: flex;
                                justify-content: space-between;
                                font-size: 0.8rem;
                                margin-bottom: 4px;
                            ">
                                <span>🛡️ SHIELDS</span>
                                <span>${status.playerShields} layers</span>
                            </div>
                            <div style="display: flex; gap: 4px;">
                                ${this.renderShieldLayers(status.playerShields, this.game.state.ship.shields.maxLayers)}
                            </div>
                        </div>
                    </div>
                    
                    <!-- VS -->
                    <div style="
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        font-size: 2rem;
                        color: var(--warning);
                        font-weight: bold;
                    ">VS</div>
                    
                    <!-- Enemy Ship -->
                    <div style="flex: 1;">
                        <div style="
                            font-size: 0.9rem;
                            color: var(--warning);
                            font-weight: bold;
                            margin-bottom: 8px;
                            text-align: center;
                        ">ENEMY SHIP</div>
                        
                        <!-- Hull -->
                        <div style="margin-bottom: 8px;">
                            <div style="
                                display: flex;
                                justify-content: space-between;
                                font-size: 0.8rem;
                                margin-bottom: 4px;
                            ">
                                <span>❤️ HULL</span>
                                <span>${Math.round(status.enemyHull)}/${Math.round(status.enemyMaxHull)}</span>
                            </div>
                            <div style="
                                width: 100%;
                                height: 16px;
                                background: rgba(255,255,255,0.1);
                                border-radius: 4px;
                                overflow: hidden;
                            ">
                                <div style="
                                    width: ${(status.enemyHull / status.enemyMaxHull) * 100}%;
                                    height: 100%;
                                    background: linear-gradient(90deg, #ff0055, #aa0033);
                                    transition: width 0.3s;
                                "></div>
                            </div>
                        </div>
                        
                        <!-- Shields -->
                        <div>
                            <div style="
                                display: flex;
                                justify-content: space-between;
                                font-size: 0.8rem;
                                margin-bottom: 4px;
                            ">
                                <span>🛡️ SHIELDS</span>
                                <span>${status.enemyShields} layers</span>
                            </div>
                            <div style="display: flex; gap: 4px;">
                                ${this.renderShieldLayers(status.enemyShields, enemy.maxShields)}
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- Controls -->
                <div style="
                    display: flex;
                    gap: 10px;
                    justify-content: center;
                ">
                    <button id="combat-pause-btn" style="
                        padding: 12px 24px;
                        font-size: 1rem;
                        background: ${status.paused ? 'rgba(0,255,85,0.2)' : 'rgba(255,170,0,0.2)'};
                        border: 2px solid ${status.paused ? '#00ff55' : '#ffaa00'};
                        color: ${status.paused ? '#00ff55' : '#ffaa00'};
                        border-radius: 6px;
                        cursor: pointer;
                        font-family: var(--font-tech);
                        font-weight: bold;
                        text-transform: uppercase;
                        transition: all 0.2s;
                    " onmouseover="this.style.transform='scale(1.05)'" 
                       onmouseout="this.style.transform='scale(1)'">
                        ${status.paused ? '▶️ RESUME' : '⏸️ PAUSE'}
                    </button>
                </div>
                
                <!-- Target Info -->
                ${status.playerTarget ? `
                    <div style="
                        margin-top: 15px;
                        padding-top: 15px;
                        border-top: 1px solid rgba(255,255,255,0.1);
                        text-align: center;
                        font-size: 0.85rem;
                        color: var(--primary);
                    ">
                        🎯 Target: ${status.playerTarget.name}
                    </div>
                ` : ''}
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
                z-index: 2000;
                font-family: var(--font-tech);
                text-align: center;
                box-shadow: 0 0 50px rgba(0,255,85,0.5);
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
                
                <button id="combat-continue-btn" style="
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
                z-index: 2000;
                font-family: var(--font-tech);
                text-align: center;
                box-shadow: 0 0 50px rgba(255,0,85,0.5);
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
                    <button id="combat-retry-btn" style="
                        padding: 15px 30px;
                        font-size: 1.1rem;
                        background: rgba(0,240,255,0.2);
                        border: 2px solid var(--primary);
                        color: var(--primary);
                        border-radius: 8px;
                        cursor: pointer;
                        font-family: var(--font-tech);
                        font-weight: bold;
                    ">LOAD SAVE</button>
                    
                    <button id="combat-menu-btn" style="
                        padding: 15px 30px;
                        font-size: 1.1rem;
                        background: rgba(255,255,255,0.1);
                        border: 2px solid #888;
                        color: #888;
                        border-radius: 8px;
                        cursor: pointer;
                        font-family: var(--font-tech);
                        font-weight: bold;
                    ">MAIN MENU</button>
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
        if (pauseBtn) {
            pauseBtn.onclick = () => {
                this.combatManager.togglePause();
                this.refresh();
            };
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

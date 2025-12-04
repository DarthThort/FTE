/**
 * ModulesUI.js
 * 
 * Shop interface for purchasing ship modules
 * Integrated into PortUI as "Modules Shop"
 */

class ModulesUI {
    constructor(game, uiManager) {
        this.game = game;
        this.uiManager = uiManager;
        this.currentCategory = MODULE_CATEGORIES.WEAPON;
    }

    /**
     * Show modules shop modal
     */
    show() {
        const modal = document.createElement('div');
        modal.id = 'modules-shop-overlay';
        modal.className = 'modal-overlay';
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.9);
            z-index: 10000;
            display: flex;
            align-items: center;
            justify-content: center;
        `;

        modal.innerHTML = `
            <div style="
                width: 90%;
                max-width: 1200px;
                max-height: 90vh;
                background: linear-gradient(135deg, rgba(10,10,30,0.98), rgba(20,10,40,0.98));
                border: 3px solid var(--primary);
                border-radius: 15px;
                padding: 30px;
                box-shadow: 0 0 60px rgba(0,240,255,0.5);
                overflow-y: auto;
            ">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 25px;">
                    <h2 style="
                        color: var(--primary);
                        margin: 0;
                        font-size: 2rem;
                        text-transform: uppercase;
                        letter-spacing: 3px;
                    ">⚙️ MODULES SHOP</h2>
                    
                    <div style="color: #ffaa00; font-size: 1.3rem; font-weight: bold;">
                        💰 ${this.game.state.credits} CR
                    </div>
                </div>
                
                <!-- Category Tabs -->
                <div id="module-tabs" style="
                    display: flex;
                    gap: 10px;
                    margin-bottom: 25px;
                    border-bottom: 2px solid rgba(0,240,255,0.3);
                    padding-bottom: 10px;
                ">
                    ${this.renderTabs()}
                </div>
                
                <!-- Module Grid -->
                <div id="module-grid" style="
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
                    gap: 20px;
                    margin-bottom: 20px;
                ">
                    ${this.renderModules(this.currentCategory)}
                </div>
                
                <!-- Close Button -->
                <div style="text-align: center; margin-top: 20px;">
                    <button id="btn-close-shop" style="
                        padding: 12px 40px;
                        font-size: 1.1rem;
                        background: rgba(255,255,255,0.1);
                        border: 2px solid var(--primary);
                        color: var(--primary);
                        border-radius: 8px;
                        cursor: pointer;
                        font-family: var(--font-tech);
                        transition: all 0.3s;
                    " onmouseover="this.style.background='rgba(0,240,255,0.2)'"
                       onmouseout="this.style.background='rgba(255,255,255,0.1)'">
                        CLOSE
                    </button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        // Tab click handlers
        document.querySelectorAll('.module-tab').forEach(tab => {
            tab.onclick = () => this.switchCategory(tab.dataset.category);
        });

        // Close button
        document.getElementById('btn-close-shop').onclick = () => {
            modal.remove();
            // Reopen port menu
            if (this.game.state.scene === 'PORT' && this.uiManager && this.uiManager.portUI) {
                this.uiManager.portUI.renderPortUI();
            }
        };

        // Close on click outside
        modal.onclick = (e) => {
            if (e.target === modal) {
                modal.remove();
                // Reopen port menu
                if (this.game.state.scene === 'PORT' && this.uiManager && this.uiManager.portUI) {
                    this.uiManager.portUI.renderPortUI();
                }
            }
        };
    }

    /**
     * Render category tabs
     */
    renderTabs() {
        const categories = [
            { id: MODULE_CATEGORIES.WEAPON, label: '⚔️ WEAPONS', icon: '⚔️' },
            { id: MODULE_CATEGORIES.SHIELD, label: '🛡️ SHIELDS', icon: '🛡️' },
            { id: MODULE_CATEGORIES.ENGINE, label: '🚀 ENGINES', icon: '🚀' },
            { id: MODULE_CATEGORIES.JUMP_DRIVE, label: '✨ JUMP DRIVES', icon: '✨' },
            { id: MODULE_CATEGORIES.REACTOR, label: '⚡ REACTORS', icon: '⚡' },
            { id: MODULE_CATEGORIES.BRIDGE, label: '🎯 BRIDGE', icon: '🎯' }
        ];

        return categories.map(cat => `
            <button 
                class="module-tab" 
                data-category="${cat.id}"
                style="
                    flex: 1;
                    padding: 12px 20px;
                    background: ${this.currentCategory === cat.id ? 'var(--primary)' : 'rgba(255,255,255,0.05)'};
                    border: 2px solid ${this.currentCategory === cat.id ? 'var(--primary)' : 'rgba(255,255,255,0.2)'};
                    color: ${this.currentCategory === cat.id ? '#000' : 'var(--primary)'};
                    border-radius: 6px;
                    cursor: pointer;
                    font-family: var(--font-tech);
                    font-size: 0.9rem;
                    font-weight: bold;
                    transition: all 0.3s;
                "
                onmouseover="if (this.dataset.category !== '${this.currentCategory}') this.style.background='rgba(0,240,255,0.15)'"
                onmouseout="if (this.dataset.category !== '${this.currentCategory}') this.style.background='rgba(255,255,255,0.05)'"
            >
                ${cat.label}
            </button>
        `).join('');
    }

    /**
     * Render modules for current category
     */
    renderModules(category) {
        const modules = getModulesByCategory(category);

        // Filter out tier 1 (default equipment) except for weapons
        const shopModules = category === MODULE_CATEGORIES.WEAPON
            ? modules
            : modules.filter(m => m.tier > 1);

        if (shopModules.length === 0) {
            return `
                <div style="
                    grid-column: 1 / -1;
                    text-align: center;
                    padding: 60px;
                    color: #888;
                    font-size: 1.2rem;
                ">
                    No modules available in this category
                </div>
            `;
        }

        return shopModules.map(module => this.renderModuleCard(module)).join('');
    }

    /**
     * Render a single module card
     */
    renderModuleCard(module) {
        const owned = this.game.state.ownedModules.includes(module.id);
        const equipped = Object.values(this.game.state.ship.hardpoints).includes(module.id);
        const canAfford = this.game.state.credits >= module.price;

        return `
            <div class="module-card" style="
                background: linear-gradient(135deg, rgba(0,240,255,0.05), rgba(100,0,255,0.05));
                border: 2px solid ${equipped ? '#00ff55' : (owned ? '#ffaa00' : 'rgba(0,240,255,0.3)')};
                border-radius: 10px;
                padding: 20px;
                transition: all 0.3s;
                position: relative;
            "
                onmouseover="this.style.transform='translateY(-5px)'; this.style.boxShadow='0 10px 30px rgba(0,240,255,0.3)'"
                onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='none'"
            >
                ${equipped ? '<div style="position: absolute; top: 10px; right: 10px; background: #00ff55; color: #000; padding: 4px 8px; border-radius: 4px; font-size: 0.7rem; font-weight: bold;">EQUIPPED</div>' : ''}
                ${owned && !equipped ? '<div style="position: absolute; top: 10px; right: 10px; background: #ffaa00; color: #000; padding: 4px 8px; border-radius: 4px; font-size: 0.7rem; font-weight: bold;">OWNED</div>' : ''}
                
                <h3 style="color: var(--primary); margin: 0 0 10px 0; font-size: 1.2rem;">
                    ${module.name}
                </h3>
                
                <div style="
                    display: inline-block;
                    background: rgba(0,240,255,0.2);
                    color: var(--primary);
                    padding: 4px 12px;
                    border-radius: 12px;
                    font-size: 0.8rem;
                    margin-bottom: 15px;
                ">
                    Tier ${module.tier}
                </div>
                
                <!-- Stats -->
                ${this.renderModuleStats(module)}
                
                <!-- Description -->
                <p style="
                    color: #aaa;
                    font-size: 0.9rem;
                    line-height: 1.5;
                    margin: 15px 0;
                    min-height: 40px;
                ">
                    ${module.description}
                </p>
                
                <!-- Price and Buy Button -->
                <div style="
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-top: 15px;
                    padding-top: 15px;
                    border-top: 1px solid rgba(255,255,255,0.1);
                ">
                    <div style="
                        color: ${canAfford ? '#ffaa00' : '#ff4444'};
                        font-size: 1.3rem;
                        font-weight: bold;
                    ">
                        💰 ${module.price} CR
                    </div>
                    
                    ${owned || equipped ?
                `<div style="color: #888; font-style: italic;">Already owned</div>` :
                `<button 
                            onclick="game.ui.modulesUI.buyModule('${module.id}')"
                            ${!canAfford ? 'disabled' : ''}
                            style="
                                padding: 10px 20px;
                                background: ${canAfford ? 'var(--success)' : '#333'};
                                border: 2px solid ${canAfford ? 'var(--success)' : '#555'};
                                color: ${canAfford ? '#000' : '#888'};
                                border-radius: 6px;
                                cursor: ${canAfford ? 'pointer' : 'not-allowed'};
                                font-family: var(--font-tech);
                                font-weight: bold;
                                font-size: 0.9rem;
                                transition: all 0.3s;
                            "
                            ${canAfford ? `onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'"` : ''}
                        >
                            ${canAfford ? '🛒 BUY' : 'INSUFFICIENT FUNDS'}
                        </button>`
            }
                </div>
            </div>
        `;
    }

    /**
     * Render module-specific stats
     */
    renderModuleStats(module) {
        const stats = module.stats;

        if (module.category === MODULE_CATEGORIES.WEAPON) {
            return `
                <div style="
                    background: rgba(0,0,0,0.3);
                    padding: 12px;
                    border-radius: 6px;
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 8px;
                    font-size: 0.85rem;
                ">
                    <div><span style="color: #888;">Shield DMG:</span> <span style="color: #00ffff;">${stats.shieldDamage}</span></div>
                    <div><span style="color: #888;">Hull DMG:</span> <span style="color: #ff8800;">${stats.hullDamage}</span></div>
                    <div><span style="color: #888;">Fire Rate:</span> <span style="color: #fff;">${stats.fireRate.toFixed(1)}/s</span></div>
                    <div><span style="color: #888;">Energy:</span> <span style="color: #ffff00;">${stats.energyCost}</span></div>
                </div>
            `;
        } else if (module.category === MODULE_CATEGORIES.SHIELD) {
            return `
                <div style="
                    background: rgba(0,0,0,0.3);
                    padding: 12px;
                    border-radius: 6px;
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 8px;
                    font-size: 0.85rem;
                ">
                    <div><span style="color: #888;">Layers:</span> <span style="color: #00ff55;">${stats.layers}</span></div>
                    <div><span style="color: #888;">Recharge:</span> <span style="color: #00ffff;">${stats.rechargeRate}/s</span></div>
                    <div><span style="color: #888;">Delay:</span> <span style="color: #ffaa00;">${stats.rechargeDelay}s</span></div>
                    <div><span style="color: #888;">Power:</span> <span style="color: #ffff00;">${stats.powerCost}</span></div>
                </div>
            `;
        } else if (module.category === MODULE_CATEGORIES.ENGINE) {
            return `
                <div style="
                    background: rgba(0,0,0,0.3);
                    padding: 12px;
                    border-radius: 6px;
                    font-size: 0.85rem;
                ">
                    <div><span style="color: #888;">Flee Bonus:</span> <span style="color: #00ff55;">+${(stats.fleeBonus * 100).toFixed(0)}%</span></div>
                    <div style="margin-top: 5px;"><span style="color: #888;">Evasion:</span> <span style="color: #00ffff;">+${(stats.evasionBonus * 100).toFixed(0)}%</span></div>
                    <div style="margin-top: 5px;"><span style="color: #888;">Power:</span> <span style="color: #ffff00;">${stats.powerCost}</span></div>
                </div>
            `;
        } else if (module.category === MODULE_CATEGORIES.JUMP_DRIVE) {
            return `
                <div style="
                    background: rgba(0,0,0,0.3);
                    padding: 12px;
                    border-radius: 6px;
                    font-size: 0.85rem;
                ">
                    <div><span style="color: #888;">Jump Range:</span> <span style="color: #00ffff;">${stats.jumpRange} LY</span></div>
                    <div style="margin-top: 5px;"><span style="color: #888;">Fuel Cost:</span> <span style="color: #ffaa00;">${stats.fuelCost}</span></div>
                </div>
            `;
        } else if (module.category === MODULE_CATEGORIES.REACTOR) {
            return `
                <div style="
                    background: rgba(0,0,0,0.3);
                    padding: 12px;
                    border-radius: 6px;
                    font-size: 0.85rem;
                ">
                    <div><span style="color: #888;">Max Power:</span> <span style="color: #ffff00;">${stats.maxPower} units</span></div>
                </div>
            `;
        } else if (module.category === MODULE_CATEGORIES.BRIDGE) {
            return `
                <div style="
                    background: rgba(0,0,0,0.3);
                    padding: 12px;
                    border-radius: 6px;
                    font-size: 0.85rem;
                ">
                    <div><span style="color: #888;">O2 Regen:</span> <span style="color: #00ffff;">${stats.o2Regen.toFixed(1)}/s</span></div>
                    <div style="margin-top: 5px;"><span style="color: #888;">Dialogue:</span> <span style="color: #00ff55;">+${(stats.dialogueBonus * 100).toFixed(0)}%</span></div>
                    <div style="margin-top: 5px;"><span style="color: #888;">Sensors:</span> <span style="color: #ffaa00;">${stats.scanRange.toFixed(1)}x</span></div>
                </div>
            `;
        }

        return '';
    }

    /**
     * Switch to a different category tab
     */
    switchCategory(category) {
        this.currentCategory = category;

        // Update tab styles
        document.querySelectorAll('.module-tab').forEach(tab => {
            if (tab.dataset.category === category) {
                tab.style.background = 'var(--primary)';
                tab.style.borderColor = 'var(--primary)';
                tab.style.color = '#000';
            } else {
                tab.style.background = 'rgba(255,255,255,0.05)';
                tab.style.borderColor = 'rgba(255,255,255,0.2)';
                tab.style.color = 'var(--primary)';
            }
        });

        // Update module grid
        document.getElementById('module-grid').innerHTML = this.renderModules(category);
    }

    /**
     * Buy a module
     */
    buyModule(moduleId) {
        const result = this.game.state.buyModule(moduleId);

        if (result.success) {
            this.uiManager.hud.showNotification(result.message, 'success');

            // Refresh the shop display
            const modal = document.getElementById('modules-shop-overlay');
            if (modal) {
                modal.remove();
                this.show();
            }
        } else {
            this.uiManager.hud.showNotification(result.message, 'error');
        }
    }
}

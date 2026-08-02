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
     * Show modules shop modal using standard UIManager createModal
     */
    show() {
        const content = `
            <div style="font-family: 'Orbitron', var(--font-tech, monospace); width: 100%; color: #fff;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; border-bottom: 1px solid rgba(0,240,255,0.3); padding-bottom: 12px;">
                    <div style="color: #38bdf8; font-size: 0.95rem; font-weight: bold; letter-spacing: 1.5px;">
                        CATÁLOGO DE TECNOLOGÍA Y COMPONENTES DE NAVE
                    </div>
                    <div style="color: #ffaa00; font-size: 1.3rem; font-weight: bold; text-shadow: 0 0 12px rgba(255,170,0,0.6);">
                        CRÉDITOS DISPONIBLES: ${this.game.state.credits} CR
                    </div>
                </div>
                
                <!-- Category Tabs -->
                <div id="module-tabs" style="display: flex; gap: 10px; margin-bottom: 22px; padding-bottom: 4px; flex-wrap: wrap;">
                    ${this.renderTabs()}
                </div>
                
                <!-- Module Grid -->
                <div id="module-grid" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(360px, 1fr)); gap: 20px; max-height: 72vh; overflow-y: auto; padding-right: 5px;">
                    ${this.renderModules(this.currentCategory)}
                </div>
            </div>
        `;

        this.uiManager.createModal('🛒 TIENDA DE MÓDULOS DE NAVE', content, 'modal-wide');

        // Tab click handlers
        setTimeout(() => {
            document.querySelectorAll('.module-tab').forEach(tab => {
                tab.onclick = () => this.switchCategory(tab.dataset.category);
            });
        }, 50);
    }

    /**
     * Render category tabs
     */
    renderTabs() {
        return Object.entries(MODULE_CATEGORIES).map(([key, value]) => `
            <button class="module-tab" data-category="${value}" style="
                padding: 10px 20px;
                background: ${this.currentCategory === value ? 'var(--primary)' : 'rgba(255,255,255,0.05)'};
                border: 1px solid var(--primary);
                color: ${this.currentCategory === value ? '#000' : 'var(--primary)'};
                border-radius: 6px;
                cursor: pointer;
                font-family: var(--font-tech);
                font-weight: bold;
                transition: all 0.3s;
            ">
                ${value.toUpperCase()}
            </button>
        `).join('');
    }

    /**
     * Render grid of modules for specified category
     */
    renderModules(category) {
        const modules = getModulesByCategory(category);

        if (modules.length === 0) {
            return `
                <div style="grid-column: 1/-1; text-align: center; padding: 40px; color: #888;">
                    No hay módulos disponibles en esta categoría
                </div>
            `;
        }

        return modules.map(module => {
            const canAfford = this.game.state.credits >= module.price;
            const owned = this.game.state.ownedModules?.includes(module.id);
            const equipped = Object.values(this.game.state.ship.hardpoints).includes(module.id);

            return `
                <div style="
                    background: rgba(15,23,42,0.9);
                    border: 2px solid ${equipped ? 'var(--success)' : owned ? 'var(--secondary)' : 'rgba(0,240,255,0.3)'};
                    border-radius: 10px;
                    padding: 20px;
                    display: flex;
                    flex-direction: column;
                    justify-content: space-between;
                    position: relative;
                ">
                    ${equipped ? `<div style="position: absolute; top: 10px; right: 10px; background: var(--success); color: #000; padding: 2px 8px; border-radius: 4px; font-size: 0.75rem; font-weight: bold;">EQUIPADO</div>` : ''}
                    ${owned && !equipped ? `<div style="position: absolute; top: 10px; right: 10px; background: var(--secondary); color: #000; padding: 2px 8px; border-radius: 4px; font-size: 0.75rem; font-weight: bold;">EN CARGA</div>` : ''}
                    
                    <div>
                        <div style="color: var(--primary); font-size: 1.2rem; font-weight: bold; margin-bottom: 5px;">
                            ${module.name}
                        </div>
                        
                        <div style="color: #888; font-size: 0.85rem; margin-bottom: 10px;">
                            Tier ${module.tier} ${module.category}
                        </div>
                        
                        ${this.renderModuleStats(module)}
                        
                        <p style="
                            color: #cbd5e1;
                            font-size: 0.85rem;
                            line-height: 1.4;
                            margin: 12px 0;
                            min-height: 40px;
                        ">
                            ${module.description}
                        </p>
                    </div>
                    
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
                            font-size: 1.2rem;
                            font-weight: bold;
                        ">
                            💰 ${module.price} CR
                        </div>
                        
                        ${owned || equipped ?
                            `<div style="color: #38bdf8; font-weight: bold; font-size: 0.85rem; padding: 6px 12px; background: rgba(56, 189, 248, 0.15); border: 1px solid #38bdf8; border-radius: 4px;">✓ ADQUIRIDO</div>` :
                            `<button 
                                onclick="game.ui.modulesUI.buyModule('${module.id}')"
                                ${!canAfford ? 'disabled' : ''}
                                style="
                                    padding: 8px 18px;
                                    background: ${canAfford ? '#00f0ff !important' : '#334155 !important'};
                                    border: 1.5px solid ${canAfford ? '#38bdf8 !important' : '#475569 !important'};
                                    color: ${canAfford ? '#000000 !important' : '#94a3b8 !important'};
                                    border-radius: 6px;
                                    cursor: ${canAfford ? 'pointer' : 'not-allowed'};
                                    font-family: 'Orbitron', var(--font-tech, monospace);
                                    font-weight: 900;
                                    font-size: 0.85rem;
                                    box-shadow: ${canAfford ? '0 0 12px rgba(0, 240, 255, 0.5)' : 'none'};
                                    transition: all 0.2s ease;
                                "
                                ${canAfford ? `onmouseover="this.style.transform='scale(1.05)'; this.style.boxShadow='0 0 20px rgba(0, 240, 255, 0.8)';" onmouseout="this.style.transform='scale(1)'; this.style.boxShadow='0 0 12px rgba(0, 240, 255, 0.5)';" ` : ''}
                            >
                                ${canAfford ? '🛒 COMPRAR' : 'FONDOS INSUFICIENTES'}
                            </button>`
                        }
                    </div>
                </div>
            `;
        }).join('');
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
                    <div><span style="color: #888;">Daño Escudo:</span> <span style="color: #00ffff;">${stats.shieldDamage}</span></div>
                    <div><span style="color: #888;">Daño Casco:</span> <span style="color: #ff8800;">${stats.hullDamage}</span></div>
                    <div><span style="color: #888;">Cadencia:</span> <span style="color: #fff;">${stats.fireRate.toFixed(1)}/s</span></div>
                    <div><span style="color: #888;">Energía:</span> <span style="color: #ffff00;">${stats.energyCost}</span></div>
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
                    <div><span style="color: #888;">Capas Escudo:</span> <span style="color: #00ff55;">${stats.layers}</span></div>
                    <div><span style="color: #888;">Recarga:</span> <span style="color: #00ffff;">${stats.rechargeRate}/s</span></div>
                    <div><span style="color: #888;">Demora:</span> <span style="color: #ffaa00;">${stats.rechargeDelay}s</span></div>
                    <div><span style="color: #888;">Potencia:</span> <span style="color: #ffff00;">${stats.powerCost}</span></div>
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
                    <div><span style="color: #888;">Bono Escape:</span> <span style="color: #00ff55;">+${(stats.fleeBonus * 100).toFixed(0)}%</span></div>
                    <div style="margin-top: 5px;"><span style="color: #888;">Evasión:</span> <span style="color: #00ffff;">+${(stats.evasionBonus * 100).toFixed(0)}%</span></div>
                    <div style="margin-top: 5px;"><span style="color: #888;">Potencia:</span> <span style="color: #ffff00;">${stats.powerCost}</span></div>
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
                    <div><span style="color: #888;">Alcance FTL:</span> <span style="color: #00ffff;">${stats.jumpRange} LY</span></div>
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
                    <div><span style="color: #888;">Max Potencia:</span> <span style="color: #ffff00;">${stats.maxPower} units</span></div>
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

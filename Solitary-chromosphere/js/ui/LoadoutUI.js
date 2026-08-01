/**
 * LoadoutUI.js
 * 
 * Simple interface for managing ship module loadout
 * Allows installing/uninstalling purchased modules
 */

class LoadoutUI {
    constructor(game, uiManager) {
        this.game = game;
        this.uiManager = uiManager;
    }

    /**
     * Show loadout management screen
     */
    show() {
        const modal = document.createElement('div');
        modal.id = 'loadout-overlay';
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
            overflow-y: auto;
        `;

        modal.innerHTML = `
            <div style="
                width: 90%;
                max-width: 1000px;
                background: linear-gradient(135deg, rgba(10,10,30,0.98), rgba(20,10,40,0.98));
                border: 3px solid var(--primary);
                border-radius: 15px;
                padding: 30px;
                box-shadow: 0 0 60px rgba(0,240,255,0.5);
            ">
                <h2 style="
                    color: var(--primary);
                    margin: 0 0 25px 0;
                    font-size: 2rem;
                    text-align: center;
                ">⚙️ EQUIPAMIENTO DE LA NAVE</h2>
                
                <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 25px;">
                    <!-- Hardpoints Column -->
                    <div>
                        <h3 style="color: var(--secondary); margin-bottom: 15px;">MÓDULOS EQUIPADOS</h3>
                        ${this.renderHardpoints()}
                    </div>
                    
                    <!-- Inventory Column -->
                    <div>
                        <h3 style="color: var(--success); margin-bottom: 15px;">INVENTARIO DE MÓDULOS</h3>
                        ${this.renderInventory()}
                    </div>
                </div>
                
                <div style="text-align: center; margin-top: 25px;">
                    <button id="btn-close-loadout" style="
                        padding: 12px 40px;
                        font-size: 1.1rem;
                        background: rgba(255,255,255,0.1);
                        border: 2px solid var(--primary);
                        color: var(--primary);
                        border-radius: 8px;
                        cursor: pointer;
                        transition: all 0.3s;
                    ">CERRAR</button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        // Close button
        document.getElementById('btn-close-loadout').onclick = () => {
            modal.remove();
        };

        // Close on click outside
        modal.onclick = (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        };
    }

    /**
     * Render hardpoints with equipped modules
     */
    renderHardpoints() {
        const hardpoints = this.game.state.ship.hardpoints;

        const slots = [
            { id: 'weapon1', label: 'Weapon Slot 1', icon: '⚔️' },
            { id: 'weapon2', label: 'Weapon Slot 2', icon: '⚔️' },
            { id: 'shield', label: 'Shield Generator', icon: '🛡️' },
            { id: 'engine', label: 'Engine', icon: '🚀' },
            { id: 'jumpDrive', label: 'Jump Drive', icon: '✨' },
            { id: 'reactor', label: 'Reactor', icon: '⚡' },
            { id: 'bridge', label: 'Bridge', icon: '🎯' }
        ];

        return slots.map(slot => {
            const moduleId = hardpoints[slot.id];
            const module = moduleId ? getModule(moduleId) : null;

            return `
                <div style="
                    background: rgba(0,240,255,0.05);
                    border: 2px solid rgba(0,240,255,0.3);
                    border-radius: 8px;
                    padding: 15px;
                    margin-bottom: 10px;
                ">
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <div>
                            <div style="color: var(--secondary); font-weight: bold; margin-bottom: 5px;">
                                ${slot.icon} ${slot.label}
                            </div>
                            ${module ? `
                                <div style="color: #fff; font-size: 0.9rem;">
                                    ${module.name} <span style="color: #888;">(Tier ${module.tier})</span>
                                </div>
                            ` : `
                                <div style="color: #888; font-style: italic;">Empty</div>
                                <div style="color: #555; font-size: 0.75rem; margin-top: 3px;">Walk to hardpoint and press E</div>
                            `}
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    }

    /**
     * Render inventory of owned modules
     */
    renderInventory() {
        const ownedModules = this.game.state.ownedModules;

        if (ownedModules.length === 0) {
            return `
                <div style="
                    text-align: center;
                    padding: 40px;
                    color: #888;
                    background: rgba(0,0,0,0.3);
                    border-radius: 8px;
                ">
                    No modules in inventory<br>
                    <span style="font-size: 0.85rem;">Buy modules from the shop</span>
                </div>
            `;
        }

        return ownedModules.map(moduleId => {
            const module = getModule(moduleId);
            if (!module) return '';

            // Determine which hardpoint this module can go into
            let compatibleHardpoint = '';
            if (module.category === MODULE_CATEGORIES.WEAPON) {
                // Check which weapon slot is empty
                if (!this.game.state.ship.hardpoints.weapon1) {
                    compatibleHardpoint = 'weapon1';
                } else if (!this.game.state.ship.hardpoints.weapon2) {
                    compatibleHardpoint = 'weapon2';
                }
            } else {
                // Map category to hardpoint
                const categoryMap = {
                    [MODULE_CATEGORIES.SHIELD]: 'shield',
                    [MODULE_CATEGORIES.ENGINE]: 'engine',
                    [MODULE_CATEGORIES.JUMP_DRIVE]: 'jumpDrive',
                    [MODULE_CATEGORIES.REACTOR]: 'reactor',
                    [MODULE_CATEGORIES.BRIDGE]: 'bridge'
                };
                compatibleHardpoint = categoryMap[module.category];
            }

            return `
                <div style="
                    background: rgba(0,255,100,0.05);
                    border: 1px solid rgba(0,255,100,0.3);
                    border-radius: 6px;
                    padding: 12px;
                    margin-bottom: 8px;
                ">
                    <div style="color: var(--primary); font-weight: bold; margin-bottom: 3px;">
                        ${module.name}
                    </div>
                    <div style="color: #888; font-size: 0.8rem; margin-bottom: 8px;">
                        Tier ${module.tier} ${module.category}
                    </div>
                    <div style="color: #555; font-size: 0.75rem; font-style: italic; text-align: center; margin-top: 8px;">
                        Walk to compatible hardpoint to install
                    </div>
                </div>
            `;
        }).join('');
    }

    /**
     * Install module into hardpoint
     */
    install(hardpoint, moduleId) {
        const result = this.game.state.installModule(hardpoint, moduleId);

        if (result.success) {
            this.uiManager.hud.showNotification(result.message, 'success');

            // Refresh loadout display
            const modal = document.getElementById('loadout-overlay');
            if (modal) {
                modal.remove();
                this.show();
            }
        } else {
            this.uiManager.hud.showNotification(result.message, 'error');
        }
    }

    /**
     * Unequip module from hardpoint
     */
    unequip(hardpoint) {
        const result = this.game.state.unequipModule(hardpoint);

        if (result.success) {
            this.uiManager.hud.showNotification(result.message, 'success');

            // Refresh loadout display
            const modal = document.getElementById('loadout-overlay');
            if (modal) {
                modal.remove();
                this.show();
            }
        } else {
            this.uiManager.hud.showNotification(result.message, 'error');
        }
    }
}

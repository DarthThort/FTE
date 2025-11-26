class WeaponUI {
    constructor(game, uiManager) {
        this.game = game;
        this.uiManager = uiManager;
    }

    // Render weapons panel
    renderWeaponsPanel() {
        const weapons = this.game.state.weaponManager.getAllWeaponsStatus();
        if (!weapons || weapons.length === 0) return '';

        const content = `
            <div id="weapons-panel" style="
                position: absolute;
                bottom: 20px;
                left: 20px;
                background: rgba(0, 10, 20, 0.95);
                border: 2px solid var(--warning);
                border-radius: 8px;
                padding: 15px;
                min-width: 350px;
                font-family: var(--font-tech);
                z-index: 100;
            ">
                <h3 style="margin: 0 0 15px 0; color: var(--warning); text-transform: uppercase; border-bottom: 1px solid var(--warning); padding-bottom: 8px; font-size: 0.9rem;">
                    ⚡ WEAPONS
                </h3>
                
                ${weapons.map(w => this.renderWeaponSlot(w)).join('')}
            </div>
        `;

        return content;
    }

    renderWeaponSlot(weapon) {
        const stateColors = {
            idle: '#666',
            charging: '#ffaa00',
            ready: '#00ff55',
            cooldown: '#ff0055'
        };

        const stateColor = stateColors[weapon.state] || '#666';
        const progressPercent = weapon.state === 'charging' || weapon.state === 'ready'
            ? weapon.chargeProgress * 100
            : weapon.state === 'cooldown'
                ? weapon.cooldownProgress * 100
                : 0;

        const stateText = weapon.state === 'charging'
            ? 'CHARGING'
            : weapon.state === 'ready'
                ? (weapon.autofire ? 'AUTO-FIRING' : 'READY')
                : weapon.state === 'cooldown'
                    ? 'COOLDOWN'
                    : 'IDLE';

        const powerStatus = weapon.hasPower ? '⚡' : '⚠ NO POWER';
        const crewStatus = weapon.autofire ? '👤 AUTO' : '👤 MANUAL';

        return `
            <div style="
                margin-bottom: 15px;
                padding: 10px;
                background: rgba(0,0,0,0.3);
                border-radius: 4px;
                border-left: 3px solid ${stateColor};
            ">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                    <span style="color: #fff; font-size: 0.85rem; font-weight: 500;">
                        ${weapon.name}
                    </span>
                    <div style="display: flex; gap: 10px; font-size: 0.7rem;">
                        <span style="color: ${weapon.hasPower ? '#00ff55' : '#ff0055'};">
                            ${powerStatus}
                        </span>
                        <span style="color: ${weapon.autofire ? '#00ff55' : '#ffaa00'};">
                            ${crewStatus}
                        </span>
                    </div>
                </div>

                <div style="font-size: 0.7rem; color: #aaa; margin-bottom: 6px;">
                    ${weapon.shots} × ${weapon.damage} dmg | Power: ${weapon.powerRequired}
                </div>

                <!-- Progress Bar -->
                <div style="margin-bottom: 8px;">
                    <div style="display: flex; justify-content: space-between; font-size: 0.7rem; color: ${stateColor}; margin-bottom: 4px;">
                        <span>${stateText}</span>
                        <span>${Math.round(progressPercent)}%</span>
                    </div>
                    <div style="
                        width: 100%;
                        height: 12px;
                        background: rgba(255,255,255,0.1);
                        border-radius: 6px;
                        overflow: hidden;
                        border: 1px solid rgba(255,255,255,0.2);
                    ">
                        <div style="
                            width: ${progressPercent}%;
                            height: 100%;
                            background: ${stateColor};
                            box-shadow: 0 0 8px ${stateColor};
                            transition: width 0.1s linear;
                        "></div>
                    </div>
                </div>

                <!-- Controls -->
                <div style="display: flex; gap: 8px; align-items: center;">
                    <!-- Target Selection -->
                    <select 
                        class="weapon-target-select"
                        data-weapon-id="${weapon.id}"
                        style="
                            flex: 1;
                            padding: 6px;
                            background: rgba(0,0,0,0.5);
                            border: 1px solid #666;
                            color: #fff;
                            border-radius: 3px;
                            font-size: 0.75rem;
                            font-family: var(--font-tech);
                        "
                    >
                        <option value="hull" ${weapon.target === 'Hull' ? 'selected' : ''}>Hull</option>
                        <option value="shields">Shields</option>
                        <option value="weapons">Weapons</option>
                        <option value="engines">Engines</option>
                        <option value="bridge">Bridge</option>
                    </select>

                    <!-- Action Buttons -->
                    ${this.renderWeaponButtons(weapon)}
                </div>
            </div>
        `;
    }

    renderWeaponButtons(weapon) {
        if (weapon.state === 'idle') {
            return `
                <button 
                    class="weapon-charge-btn"
                    data-weapon-id="${weapon.id}"
                    style="
                        padding: 6px 16px;
                        background: ${weapon.canCharge ? 'rgba(0,255,85,0.2)' : 'rgba(100,100,100,0.2)'};
                        border: 1px solid ${weapon.canCharge ? '#00ff55' : '#666'};
                        color: ${weapon.canCharge ? '#00ff55' : '#666'};
                        border-radius: 3px;
                        cursor: ${weapon.canCharge ? 'pointer' : 'not-allowed'};
                        font-size: 0.75rem;
                        font-family: var(--font-tech);
                        font-weight: 600;
                    "
                    ${weapon.canCharge ? '' : 'disabled'}
                >
                    CHARGE
                </button>
            `;
        } else if (weapon.state === 'charging') {
            return `
                <button 
                    class="weapon-cancel-btn"
                    data-weapon-id="${weapon.id}"
                    style="
                        padding: 6px 16px;
                        background: rgba(255,0,85,0.2);
                        border: 1px solid #ff0055;
                        color: #ff0055;
                        border-radius: 3px;
                        cursor: pointer;
                        font-size: 0.75rem;
                        font-family: var(--font-tech);
                        font-weight: 600;
                    "
                >
                    CANCEL
                </button>
            `;
        } else if (weapon.state === 'ready' && !weapon.autofire) {
            return `
                <button 
                    class="weapon-fire-btn"
                    data-weapon-id="${weapon.id}"
                    style="
                        padding: 6px 16px;
                        background: rgba(255,80,0,0.3);
                        border: 2px solid #ff5000;
                        color: #ff5000;
                        border-radius: 3px;
                        cursor: pointer;
                        font-size: 0.75rem;
                        font-family: var(--font-tech);
                        font-weight: 700;
                        animation: pulse-fire 1s infinite;
                    "
                >
                    🔥 FIRE
                </button>
                <style>
                    @keyframes pulse-fire {
                        0%, 100% { box-shadow: 0 0 10px #ff5000; }
                        50% { box-shadow: 0 0 20px #ff5000; }
                    }
                </style>
            `;
        } else if (weapon.state === 'ready' && weapon.autofire) {
            return `
                <div style="
                    padding: 6px 16px;
                    background: rgba(0,255,85,0.2);
                    border: 1px solid #00ff55;
                    color: #00ff55;
                    border-radius: 3px;
                    font-size: 0.75rem;
                    font-family: var(--font-tech);
                    font-weight: 600;
                ">
                    AUTO
                </div>
            `;
        } else if (weapon.state === 'cooldown') {
            return `
                <div style="
                    padding: 6px 16px;
                    background: rgba(255,0,85,0.1);
                    border: 1px solid #666;
                    color: #666;
                    border-radius: 3px;
                    font-size: 0.75rem;
                    font-family: var(--font-tech);
                ">
                    COOLING
                </div>
            `;
        }
        return '';
    }

    // Attach event listeners
    attachWeaponEventListeners() {
        // Charge buttons
        document.querySelectorAll('.weapon-charge-btn').forEach(btn => {
            btn.onclick = () => {
                const weaponId = btn.dataset.weaponId;
                console.log('Charge button clicked for weapon:', weaponId);
                const result = this.game.state.weaponManager.chargeWeapon(weaponId);
                console.log('chargeWeapon result:', result);
                if (result) {
                    this.refreshWeaponsPanel();
                } else {
                    console.log('Failed to charge weapon - checking why...');
                    const weapon = this.game.state.weaponManager.getWeapon(weaponId);
                    console.log('Weapon state:', weapon?.state);
                    const weaponsSystem = this.game.state.ship.systems.find(s => s.type === 'weapon');
                    console.log('Weapons system:', weaponsSystem);
                    console.log('Has enough power?', weaponsSystem?.currentPower >= weapon?.powerRequired);
                }
            };
        });

        // Cancel buttons
        document.querySelectorAll('.weapon-cancel-btn').forEach(btn => {
            btn.onclick = () => {
                const weaponId = btn.dataset.weaponId;
                this.game.state.weaponManager.cancelCharge(weaponId);
                this.refreshWeaponsPanel();
            };
        });

        // Fire buttons
        document.querySelectorAll('.weapon-fire-btn').forEach(btn => {
            btn.onclick = () => {
                const weaponId = btn.dataset.weaponId;
                const targetSelect = document.querySelector(`.weapon-target-select[data-weapon-id="${weaponId}"]`);
                const target = targetSelect ? targetSelect.value : 'hull';
                this.game.state.weaponManager.fireWeapon(weaponId, target);
                this.refreshWeaponsPanel();
            };
        });

        // Target selection
        document.querySelectorAll('.weapon-target-select').forEach(select => {
            select.onchange = () => {
                const weaponId = select.dataset.weaponId;
                this.game.state.weaponManager.setTarget(weaponId, select.value);
            };
        });
    }

    // Refresh panel
    refreshWeaponsPanel() {
        const panel = document.getElementById('weapons-panel');
        if (panel) {
            const newContent = this.renderWeaponsPanel();
            const temp = document.createElement('div');
            temp.innerHTML = newContent;
            panel.replaceWith(temp.firstElementChild);
            this.attachWeaponEventListeners();
        }
    }
}

class UIManager {
    constructor(rootElement, gameEngine) {
        this.root = rootElement;
        this.game = gameEngine;
        this.uiLayer = rootElement; // Alias for clarity
        this.hud = new HUD(gameEngine, rootElement);
        this.animationUI = new AnimationUI(gameEngine, rootElement);
        // MapUI necesita 'this' para acceder a createModal
        this.mapUI = new MapUI(gameEngine, rootElement, this);
        this.portUI = new PortUI(gameEngine, rootElement, this);
        this.shipSystemUI = new ShipSystemUI(gameEngine, rootElement, this);
        this.powerUI = new PowerUI(gameEngine, this);
        this.weaponUI = new WeaponUI(gameEngine, this);
        this.shieldUI = new ShieldUI(gameEngine, this);

        // Link PowerUI to ShipRenderer for room overlays
        if (gameEngine.sceneManager && gameEngine.sceneManager.shipRenderer) {
            gameEngine.sceneManager.shipRenderer.powerUI = this.powerUI;
        }

        this.init();

        // ES6 Proxy Fallback for Sub-UI Delegation:
        // Automatically searches sub-UI modules if a method is called on UIManager
        return new Proxy(this, {
            get(target, prop, receiver) {
                if (prop in target) {
                    return Reflect.get(target, prop, receiver);
                }

                const subUIs = [
                    target.shipSystemUI,
                    target.portUI,
                    target.hud,
                    target.mapUI,
                    target.weaponUI,
                    target.powerUI,
                    target.shieldUI,
                    target.animationUI
                ];

                for (const subUI of subUIs) {
                    if (subUI && typeof subUI[prop] === 'function') {
                        return subUI[prop].bind(subUI);
                    }
                }

                return undefined;
            }
        });
    }

    init() {
        console.log('UI Manager Initialized');
        this.game.ui = this;

        // Create global OPTIONS button (always visible)
        this.createOptionsButton();

        // Default to showing nothing until scene starts
    }

    createOptionsButton() {
        // Create OPTIONS button in top-right corner
        const optionsBtn = document.createElement('button');
        optionsBtn.id = 'btn-options';
        optionsBtn.innerHTML = '⚙️ OPCIONES';
        Object.assign(optionsBtn.style, {
            position: 'fixed',
            top: '20px',
            right: '20px',
            padding: '10px 20px',
            background: 'rgba(0, 100, 150, 0.3)',
            color: 'var(--primary)',
            border: '1px solid var(--primary)',
            borderRadius: '4px',
            fontFamily: 'var(--font-tech)',
            fontSize: '0.9rem',
            cursor: 'pointer',
            zIndex: '1000'
        });
        optionsBtn.onclick = () => this.showOptionsMenu();
        this.root.appendChild(optionsBtn);
    }

    showOptionsMenu() {
        const content = `
            <div style="font-family: var(--font-tech);">
                <div style="margin-bottom: 30px;">
                    <h3 style="color: var(--secondary); font-size: 1rem; margin-bottom: 15px;">Save Data</h3>
                    <button id="btn-reset-save-options" style="padding: 12px 24px; background: rgba(200, 0, 0, 0.2); color: #ff4444; border: 1px solid #ff4444; cursor: pointer; font-family: var(--font-tech); border-radius: 4px; font-size: 0.9rem; transition: all 0.2s;">
                        🗑️ RESET SAVE DATA
                    </button>
                    <p style="color: #aaa; font-size: 0.8rem; margin-top: 10px; font-style: italic;">Warning: This will erase all progress</p>
                </div>
            </div>
        `;

        this.createModal('OPCIONES', content);

        // Attach event listener
        setTimeout(() => {
            const btnReset = document.getElementById('btn-reset-save-options');
            if (btnReset) {
                btnReset.onclick = () => {
                    if (confirm('Are you sure you want to reset all save data? This cannot be undone.')) {
                        this.game.state.clearSave();
                        location.reload();
                    }
                };
            }
        }, 50);
    }

    setMode(sceneName) {
        console.log(`UIManager: Setting mode to ${sceneName}`);

        // Hide Port Menu if leaving PORT scene
        if (sceneName !== 'PORT') {
            const portMenu = document.getElementById('port-main-menu');
            if (portMenu) portMenu.style.display = 'none';
        }

        // Show/Hide HUD elements based on scene
        if (sceneName === 'SHIP' || sceneName === 'COMBAT') {
            this.hud.renderHUD();
            setTimeout(() => {
                this.renderSidePanels();
            }, 100);
        } else if (sceneName === 'PORT') {
            this.hud.renderHUD();
            this.portUI.renderPortUI();
        }
    }

    renderSidePanels() {
        if (!this.game || !this.game.state) return;

        // 1. Power & Reactor Panel
        const existingPower = document.getElementById('power-panel');
        if (existingPower) existingPower.remove();

        if (this.powerUI && this.powerUI.renderPowerPanel) {
            const powerHTML = this.powerUI.renderPowerPanel();
            if (powerHTML) {
                const tempDiv = document.createElement('div');
                tempDiv.innerHTML = powerHTML;
                const el = tempDiv.firstElementChild;
                if (el) {
                    this.root.appendChild(el);
                    this.powerUI.attachPowerEventListeners();
                }
            }
        }

        // 2. Door Control Panel (Abrir / Cerrar todas las puertas)
        const existingDoor = document.getElementById('door-panel');
        if (existingDoor) existingDoor.remove();

        if (this.powerUI && this.powerUI.renderDoorPanel) {
            const doorHTML = this.powerUI.renderDoorPanel();
            if (doorHTML) {
                const tempDiv = document.createElement('div');
                tempDiv.innerHTML = doorHTML;
                const el = tempDiv.firstElementChild;
                if (el) {
                    this.root.appendChild(el);
                    this.powerUI.attachDoorEventListeners();
                }
            }
        }

        // 3. Weapons Panel
        const existingWeapons = document.getElementById('weapons-panel');
        if (existingWeapons) existingWeapons.remove();

        if (this.weaponUI && this.weaponUI.renderWeaponsPanel) {
            const weaponsHTML = this.weaponUI.renderWeaponsPanel();
            if (weaponsHTML) {
                const tempDiv = document.createElement('div');
                tempDiv.innerHTML = weaponsHTML;
                const el = tempDiv.firstElementChild;
                if (el) {
                    this.root.appendChild(el);
                    this.weaponUI.attachWeaponEventListeners();
                }
            }
        }

        // 4. Shield Panel
        const existingShield = document.getElementById('shield-panel');
        if (existingShield) existingShield.remove();

        if (this.shieldUI && this.shieldUI.renderShieldPanel) {
            const shieldHTML = this.shieldUI.renderShieldPanel();
            if (shieldHTML) {
                const tempDiv = document.createElement('div');
                tempDiv.innerHTML = shieldHTML;
                const el = tempDiv.firstElementChild;
                if (el) {
                    this.root.appendChild(el);
                    this.shieldUI.attachShieldEventListeners();
                }
            }
        }

        // Attach minimize buttons to all side panels
        this.attachPanelMinimizeToggles();
    }

    attachPanelMinimizeToggles() {
        const panels = document.querySelectorAll('#power-panel, #door-panel, #weapons-panel, #shield-panel');
        panels.forEach(panel => {
            const handle = panel.querySelector('.drag-handle, h3, div');
            if (!handle || panel.querySelector('.btn-minimize-panel')) return;

            handle.style.display = 'flex';
            handle.style.justifyContent = 'space-between';
            handle.style.alignItems = 'center';

            const minBtn = document.createElement('button');
            minBtn.className = 'btn-minimize-panel';
            minBtn.textContent = '➖';
            minBtn.title = 'Minimizar / Expandir panel';
            minBtn.style.cssText = `
                background: rgba(0, 240, 255, 0.15);
                border: 1px solid var(--primary, #00f0ff);
                border-radius: 4px;
                color: #ffffff;
                font-size: 0.75rem;
                padding: 2px 6px;
                cursor: pointer;
                margin-left: 10px;
                transition: all 0.2s;
            `;

            minBtn.onclick = (e) => {
                e.stopPropagation();
                const isCollapsed = panel.classList.toggle('panel-collapsed');
                minBtn.textContent = isCollapsed ? '➕' : '➖';

                Array.from(panel.children).forEach(child => {
                    if (child !== handle && !child.classList.contains('drag-handle')) {
                        child.style.display = isCollapsed ? 'none' : '';
                    }
                });
            };

            handle.appendChild(minBtn);
        });
    }

    // --- INTERACTION PROMPTS ---

    showInteractionPrompt(text) {
        if (this.hud && this.hud.showInteractionPrompt) {
            this.hud.showInteractionPrompt(text);
        }
    }

    hideInteractionPrompt() {
        if (this.hud && this.hud.hideInteractionPrompt) {
            this.hud.hideInteractionPrompt();
        }
    }

    // --- SHIP SYSTEM CONSOLES & MODAL DELEGATES ---

    renderSystemConsole(system) {
        this.shipSystemUI.renderSystemConsole(system);
    }

    renderInstallMenu(x, y) {
        this.shipSystemUI.renderInstallMenu(x, y);
    }

    installModuleToHardpoint(hardpoint, moduleId) {
        this.shipSystemUI.installModuleToHardpoint(hardpoint, moduleId);
    }

    showCrewDetail(crewId) {
        this.shipSystemUI.showCrewDetail(crewId);
    }

    showSystemDetail(systemId) {
        this.shipSystemUI.showSystemDetail(systemId);
    }

    renderSystemMap() {
        this.mapUI.renderSystemMap();
    }

    showTravelAnimation(type, callback) {
        this.animationUI.showTravelAnimation(type, callback);
    }

    // --- PORT INTERFACE DELEGATES ---

    renderPortUI() {
        this.portUI.renderPortUI();
    }

    renderShipyard() {
        this.portUI.renderShipyard();
    }

    renderTavern() {
        this.portUI.renderTavern();
    }

    renderContracts() {
        this.portUI.renderContracts();
    }

    renderMarket() {
        this.portUI.renderMarket();
    }

    renderCrewRoster() {
        this.portUI.renderCrewRoster();
    }

    buyItem(commodityId, price) {
        this.portUI.buyItem(commodityId, price);
    }

    sellItem(commodityId, price) {
        this.portUI.sellItem(commodityId, price);
    }

    showShipDestroyedModal() {
        const existing = document.getElementById('ship-destroyed-modal');
        if (existing) return;

        const overlay = document.createElement('div');
        overlay.id = 'ship-destroyed-modal';
        overlay.style.cssText = `
            position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
            background: rgba(15, 3, 3, 0.94); backdrop-filter: blur(10px);
            z-index: 10000; display: flex; align-items: center; justify-content: center;
            font-family: 'Orbitron', var(--font-tech, monospace);
        `;

        overlay.innerHTML = `
            <div style="
                width: 650px; max-width: 90vw;
                background: rgba(35, 10, 10, 0.95);
                border: 2px solid #ef4444;
                border-radius: 12px;
                padding: 40px;
                box-shadow: 0 0 60px rgba(239, 68, 68, 0.5), inset 0 0 30px rgba(239, 68, 68, 0.2);
                text-align: center;
                position: relative; overflow: hidden;
            ">
                <div style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: repeating-linear-gradient(0deg, rgba(239, 68, 68, 0.05), rgba(239, 68, 68, 0.05) 1px, transparent 1px, transparent 4px); pointer-events: none;"></div>

                <div style="font-size: 3.5rem; margin-bottom: 10px;">💥</div>

                <h1 style="color: #ef4444; font-size: 2.2rem; font-weight: 900; letter-spacing: 4px; margin: 0 0 10px 0; text-shadow: 0 0 20px rgba(239, 68, 68, 0.8);">
                    NAVE DESTRUIDA
                </h1>
                <div style="color: #fca5a5; font-size: 0.9rem; letter-spacing: 2px; margin-bottom: 20px; font-weight: 700;">
                    INTEGRIDAD DEL CASCO: 0% • FALLO ESTRUCTURAL CRÍTICO
                </div>

                <p style="color: #cbd5e1; font-size: 1.05rem; line-height: 1.6; margin-bottom: 30px; font-family: 'Rajdhani', sans-serif;">
                    Tu nave ha sufrido daños irreparables y se ha desintegrado en el espacio profundo. Todos los sistemas han colapsado.
                </p>

                <div style="display: flex; gap: 15px; justify-content: center;">
                    <button id="btn-restart-system" style="
                        padding: 16px 28px;
                        font-family: 'Orbitron', monospace;
                        font-weight: 900;
                        font-size: 1rem;
                        letter-spacing: 2px;
                        color: #000000;
                        background: #ef4444;
                        border: none;
                        border-radius: 6px;
                        cursor: pointer;
                        box-shadow: 0 0 20px rgba(239, 68, 68, 0.6);
                        transition: all 0.2s;
                    ">
                        🔄 CARGAR PUNTO DE ENTRADA AL SISTEMA
                    </button>
                </div>
            </div>
        `;

        document.body.appendChild(overlay);

        document.getElementById('btn-restart-system').onclick = () => {
            overlay.remove();
            if (this.game.state.restoreSystemEntryPoint) {
                this.game.state.restoreSystemEntryPoint();
            }
        };
    }

    createModal(title, contentHTML) {
        // Hide Port Menu if it exists
        const portMenu = document.getElementById('port-main-menu');
        if (portMenu) portMenu.style.display = 'none';

        // Remove existing modal if any
        const existing = document.querySelector('.modal-overlay');
        if (existing) existing.remove();

        const overlay = document.createElement('div');
        overlay.className = 'modal-overlay';

        overlay.innerHTML = `
            <div class="modal-window">
                <div class="modal-header">
                    <h2>${title}</h2>
                    <button class="modal-close">&times;</button>
                </div>
                <div class="modal-content">
                    ${contentHTML}
                </div>
            </div>
        `;

        this.uiLayer.appendChild(overlay);

        const closeModal = () => {
            overlay.remove();
            // Restore Port Menu
            if (portMenu) portMenu.style.display = 'flex';
        };

        // Close handlers
        overlay.querySelector('.modal-close').onclick = closeModal;
    }
}

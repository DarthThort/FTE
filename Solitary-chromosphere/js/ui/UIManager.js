class UIManager {
    constructor(rootElement, gameEngine) {
        this.root = rootElement;
        this.game = gameEngine;
        this.uiLayer = rootElement; // Alias for clarity
        this.init();
    }

    init() {
        console.log('UI Manager Initialized');
        this.game.ui = this;
        // Default to showing nothing until scene starts
    }

    clearUI() {
        this.root.innerHTML = '';
    }

    setMode(mode) {
        this.clearUI();
        if (mode === 'SHIP') {
            this.renderHUD();
        } else if (mode === 'PORT') {
            this.renderPortUI();
        }
    }

    renderHUD() {
        this.clearUI();
        const hud = document.createElement('div');
        hud.id = 'hud';
        hud.className = 'hud-panel';
        hud.id = 'hud-status'; // Re-using ID for styling

        this.updateHUD(hud);
        this.root.appendChild(hud);

        // Interaction Prompt Container
        const prompt = document.createElement('div');
        prompt.id = 'interaction-prompt';
        this.root.appendChild(prompt);

        // Subscribe to state changes
        if (this.game.state.subscribe) {
            this.game.state.subscribe(() => {
                const hudEl = document.getElementById('hud-status');
                if (hudEl) this.updateHUD(hudEl);
            });
        }
    }

    updateHUD(element) {
        const state = this.game.state;
        if (!state || !state.ship) return;

        element.innerHTML = `
            <h3>${state.ship.name}</h3>
            <div class="stat-row"><span>HULL</span> <span class="stat-value" style="color: ${state.ship.health < 30 ? 'var(--danger)' : 'var(--secondary)'}">${state.ship.health}/${state.ship.maxHealth}</span></div>
            <div class="stat-row"><span>SHIELD</span> <span class="stat-value" style="color: var(--primary)">${state.ship.shield}/${state.ship.maxShield}</span></div>
            <div class="stat-row"><span>CREDITS</span> <span class="stat-value" style="color: var(--warning)">${state.credits} CR</span></div>
            <div style="margin-top: 10px; font-size: 0.8rem; color: var(--text-dim);">
                LOC: SECTOR 0-1<br>
                STATUS: DOCKED (Simulated)
            </div>
        `;
    }

    showInteractionPrompt(text) {
        const prompt = document.getElementById('interaction-prompt');
        if (prompt) {
            prompt.innerText = text;
            prompt.classList.add('visible');
        }
    }

    hideInteractionPrompt() {
        const prompt = document.getElementById('interaction-prompt');
        if (prompt) {
            prompt.classList.remove('visible');
        }
    }

    // --- PORT INTERFACE ---

    renderPortUI() {
        this.clearUI();
        const container = document.createElement('div');
        container.id = 'port-main-menu';
        container.className = 'screen active';
        container.style.background = 'rgba(0,0,0,0.8)';

        container.innerHTML = `
            <h1>STATION DOCK</h1>
            <div style="display: flex; gap: 20px;">
                <button id="btn-shipyard">SHIPYARD</button>
                <button id="btn-tavern">TAVERN</button>
                <button id="btn-contracts">CONTRACTS</button>
                <button id="btn-undock" style="border-color: var(--warning); color: var(--warning);">UNDOCK</button>
            </div>
        `;

        this.uiLayer.appendChild(container);

        document.getElementById('btn-shipyard').onclick = () => this.renderShipyard();
        document.getElementById('btn-tavern').onclick = () => this.renderTavern();
        document.getElementById('btn-contracts').onclick = () => this.renderContracts();
        document.getElementById('btn-undock').onclick = () => {
            this.game.sceneManager.changeScene('SHIP');
        };
    }

    renderShipyard() {
        const ships = this.game.state.port.ships || [];
        const content = `
            <div class="module-grid">
                ${ships.map(ship => `
                    <div class="module-card">
                        <h4 style="color: var(--primary);">${ship.name}</h4>
                        <p style="color: var(--secondary);">${ship.type}</p>
                        <p>${ship.desc}</p>
                        <p>Hull: ${ship.hull} | Slots: ${ship.slots}</p>
                        <button style="margin-top: 10px; width: 100%; font-size: 0.8rem;" onclick="alert('Insufficient Credits!')">Buy ${ship.cost} CR</button>
                    </div>
                `).join('')}
            </div>
        `;
        this.createModal('SHIPYARD', content);
    }

    renderTavern() {
        const crew = this.game.state.port.crew || [];
        const content = `
            <div class="module-grid">
                ${crew.map(c => `
                    <div class="module-card">
                        <h4 style="color: var(--secondary);">${c.name}</h4>
                        <p style="color: #fff;">${c.role} (Lvl ${c.skill})</p>
                        <p>${c.desc}</p>
                        <button style="margin-top: 10px; width: 100%; font-size: 0.8rem;" onclick="alert('Hired ${c.name}!')">Hire ${c.cost} CR</button>
                    </div>
                `).join('')}
            </div>
        `;
        this.createModal('TAVERN', content);
    }

    renderContracts() {
        const contracts = this.game.state.port.contracts || [];
        const content = `
            <div style="display: flex; flex-direction: column; gap: 10px;">
                ${contracts.map(c => `
                    <div style="background: rgba(255,255,255,0.05); padding: 15px; border: 1px solid rgba(255,255,255,0.1); display: flex; justify-content: space-between; align-items: center;">
                        <div>
                            <h4 style="color: var(--warning); margin-bottom: 5px;">${c.title} (Diff: ${c.difficulty})</h4>
                            <p>${c.description}</p>
                        </div>
                        <div style="text-align: right;">
                            <p style="color: var(--primary); font-weight: bold; margin-bottom: 5px;">${c.reward} CR</p>
                            <button style="font-size: 0.8rem; padding: 5px 15px;" onclick="alert('Contract Accepted!')">ACCEPT</button>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
        this.createModal('CONTRACTS', content);
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
                    <button class="modal-close">×</button>
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
        overlay.onclick = (e) => {
            if (e.target === overlay) closeModal();
        };
    }

    // --- SYSTEM CONSOLES ---

    renderSystemConsole(system) {
        const content = `
            <div style="text-align: center;">
                <h1 style="color: ${system.color}; margin-bottom: 10px;">${system.name.toUpperCase()}</h1>
                <div style="font-family: var(--font-body); color: var(--text-dim); margin-bottom: 20px;">SYSTEM ID: ${system.id.toUpperCase()}</div>
                
                <div style="margin-bottom: 30px;">
                    <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
                        <span>INTEGRITY</span>
                        <span>100%</span>
                    </div>
                    <div style="width: 100%; height: 10px; background: #333; border-radius: 5px;">
                        <div style="width: 100%; height: 100%; background: ${system.color}; border-radius: 5px; box-shadow: 0 0 10px ${system.color};"></div>
                    </div>
                </div>

                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
                    <button>DIAGNOSTICS</button>
                    <button>POWER: ON</button>
                    <button>UPGRADE</button>
                    <button style="border-color: var(--secondary); color: var(--secondary);" 
                        onclick="game.state.uninstallSystem(game.state.ship.systems.find(s => s.id === '${system.id}')); document.querySelector('.modal-overlay').remove();">
                        UNINSTALL
                    </button>
                </div>
            </div>
        `;
        this.createModal('SYSTEM CONSOLE', content);
    }

    renderInstallMenu(x, y) {
        const modules = this.game.state.inventory.filter(i => i.type === 'module') || [];

        const content = `
            <div style="text-align: center;">
                <p style="color: var(--text-dim); margin-bottom: 20px;">Select a module from cargo to install at Hardpoint (${x},${y})</p>
                
                <div style="max-height: 300px; overflow-y: auto; margin-bottom: 30px; border: 1px solid #333; padding: 10px;">
                    ${modules.length > 0 ? modules.map(item => `
                        <div style="display: flex; justify-content: space-between; align-items: center; padding: 10px; border-bottom: 1px solid #333;">
                            <span>${item.name}</span>
                            <button style="font-size: 0.8rem;" 
                                onclick="game.state.installSystem(game.state.inventory.find(i => i.id === '${item.id}'), ${x}, ${y}); document.querySelector('.modal-overlay').remove();">
                                INSTALL
                            </button>
                        </div>
                    `).join('') : '<p style="padding: 20px;">No compatible modules in cargo.</p>'}
                </div>
            </div>
        `;
        this.createModal('INSTALL MODULE', content);
    }
}

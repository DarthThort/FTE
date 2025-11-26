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
        this.init();
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
        optionsBtn.innerHTML = '⚙️ OPTIONS';
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
            zIndex: '999',
            transition: 'all 0.2s'
        });

        optionsBtn.addEventListener('mouseover', () => {
            optionsBtn.style.background = 'rgba(0, 150, 200, 0.5)';
        });
        optionsBtn.addEventListener('mouseout', () => {
            optionsBtn.style.background = 'rgba(0, 100, 150, 0.3)';
        });
        optionsBtn.addEventListener('click', () => {
            this.showOptionsMenu();
        });

        document.body.appendChild(optionsBtn);
    }

    showOptionsMenu() {
        const content = `
            <div style="padding: 20px;">
                <h2 style="color: var(--primary); margin-bottom: 20px; font-family: var(--font-tech);">GAME OPTIONS</h2>
                
                <div style="margin-bottom: 30px;">
                    <h3 style="color: var(--secondary); font-size: 1rem; margin-bottom: 15px;">Save Data</h3>
                    <button id="btn-reset-save-options" style="padding: 12px 24px; background: rgba(200, 0, 0, 0.2); color: #ff4444; border: 1px solid #ff4444; cursor: pointer; font-family: var(--font-tech); border-radius: 4px; font-size: 0.9rem; transition: all 0.2s;">
                        🗑️ RESET SAVE DATA
                    </button>
                    <p style="color: #aaa; font-size: 0.8rem; margin-top: 10px; font-style: italic;">Warning: This will erase all progress</p>
                </div>
                
                <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid rgba(255,255,255,0.1);">
                    <p style="color: #888; font-size: 0.8rem; text-align: center;">More options coming soon...</p>
                </div>
            </div>
        `;

        this.createModal('OPTIONS', content);

        // Add reset button handler
        setTimeout(() => {
            const resetBtn = document.getElementById('btn-reset-save-options');
            if (resetBtn) {
                resetBtn.addEventListener('mouseover', () => {
                    resetBtn.style.background = 'rgba(255, 0, 0, 0.8)';
                    resetBtn.style.color = '#fff';
                });
                resetBtn.addEventListener('mouseout', () => {
                    resetBtn.style.background = 'rgba(200, 0, 0, 0.2)';
                    resetBtn.style.color = '#ff4444';
                });
                resetBtn.addEventListener('click', () => {
                    if (confirm("WARNING: ALL PROGRESS WILL BE LOST.\n\nAre you sure you want to wipe your save data and restart?")) {
                        localStorage.clear();
                        location.reload();
                    }
                });
            }
        }, 100);
    }

    showNotification(message, type = 'info') {
    this.hud.showNotification(message, type);
}
	
   
    

    clearUI() {
    this.hud.clearUI();
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
    this.hud.renderHUD();
}

    updateHUD(element) {
    this.hud.updateHUD(element);
}


    showInteractionPrompt(text) {
    this.hud.showInteractionPrompt(text);
}

    hideInteractionPrompt() {
    this.hud.hideInteractionPrompt();
}

    // --- NAVIGATION & MAPS ---

    renderGalaxyMap() {
    this.mapUI.renderGalaxyMap();
}

    renderSystemMap() {
    this.mapUI.renderSystemMap();
}

	showTravelAnimation(type, callback) {
    this.animationUI.showTravelAnimation(type, callback);
}

    // --- PORT INTERFACE ---

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
        // Disabled overlay click-to-close to allow panning in galaxy map
        // overlay.onclick = (e) => {
        //     if (e.target === overlay) closeModal();
        // };
    }

    // --- SYSTEM CONSOLES ---

    renderSystemConsole(system) {
        this.shipSystemUI.renderSystemConsole(system);
    }

    renderInstallMenu(x, y) {
        this.shipSystemUI.renderInstallMenu(x, y);
    }

    renderCrewRoster() {
        this.portUI.renderCrewRoster();

	}
	
    showCrewDetail(crewId) {
        this.shipSystemUI.showCrewDetail(crewId);
    }
	
	renderMarket() {
    this.portUI.renderMarket();
}
buyItem(commodityId, price) {
    this.portUI.buyItem(commodityId, price);
}
sellItem(commodityId, price) {
    this.portUI.sellItem(commodityId, price);
}
	
}

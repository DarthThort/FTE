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
        const assignedCrew = system.assignedCrew;
        const availableCrew = this.game.state.ship.crew.filter(c => {
            // Crew is available if not assigned to any system OR already assigned to THIS system
            const isAssignedElsewhere = this.game.state.ship.systems.some(s =>
                s.id !== system.id && s.assignedCrew?.id === c.id
            );
            return !isAssignedElsewhere;
        });

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

                ${assignedCrew ? `
                    <div style="background: rgba(0,255,100,0.1); border: 1px solid var(--success); padding: 15px; border-radius: 6px; margin-bottom: 20px;">
                        <h3 style="color: var(--success); font-size: 0.9rem; margin-bottom: 10px;">ASSIGNED CREW</h3>
                        <div style="background: rgba(0,0,0,0.3); padding: 10px; border-radius: 4px; margin-bottom: 10px;">
                            <h4 style="color: var(--secondary); margin-bottom: 5px;">${assignedCrew.name}</h4>
                            <p style="font-size: 0.85rem; color: #aaa;">${assignedCrew.role} • Lvl ${assignedCrew.skills[this.game.state.getRolePrimarySkill(assignedCrew.role)]?.level || 1}</p>
                        </div>
                        <button id="btn-unassign-system" style="width: 100%; background: var(--danger); border-color: var(--danger);">UNASSIGN CREW</button>
                    </div>
                ` : `
                    <div style="background: rgba(255,200,0,0.1); border: 1px solid var(--warning); padding: 15px; border-radius: 6px; margin-bottom: 20px;">
                        <h3 style="color: var(--warning); font-size: 0.9rem; margin-bottom: 10px;">NO CREW ASSIGNED</h3>
                        <p style="color: var(--text-dim); font-size: 0.85rem; margin-bottom: 10px;">Assign a crew member to this station:</p>
                        <select id="crew-selector" style="width: 100%; padding: 8px; background: rgba(0,0,0,0.5); border: 1px solid rgba(255,255,255,0.2); color: #fff; margin-bottom: 10px; cursor: pointer;">
                            <option value="">-- Select Crew Member --</option>
                            ${availableCrew.map(c => {
            const primarySkill = this.game.state.getRolePrimarySkill(c.role);
            const level = c.skills[primarySkill]?.level || 1;
            return `<option value="${c.id}">${c.name} (${c.role}, Lvl ${level})</option>`;
        }).join('')}
                        </select>
                        <button id="btn-assign-system" style="width: 100%;">ASSIGN TO STATION</button>
                    </div>
                `}

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

        // Add event listeners for crew assignment buttons
        if (assignedCrew) {
            const unassignBtn = document.getElementById('btn-unassign-system');
            if (unassignBtn) {
                unassignBtn.onclick = () => {
                    const result = this.game.state.unassignCrewFromSystem(system.id);
                    this.showNotification(result.message, result.success ? 'success' : 'error');
                    if (result.success) {
                        this.renderSystemConsole(system); // Refresh console
                    }
                };
            }
        } else {
            const assignBtn = document.getElementById('btn-assign-system');
            if (assignBtn) {
                assignBtn.onclick = () => {
                    const selector = document.getElementById('crew-selector');
                    const crewId = parseInt(selector.value);
                    if (!crewId) {
                        this.showNotification('Please select a crew member first!', 'warning');
                        return;
                    }
                    const result = this.game.state.assignCrewToSystem(crewId, system.id);
                    this.showNotification(result.message, result.success ? 'success' : 'error');
                    if (result.success) {
                        this.renderSystemConsole(system); // Refresh console
                    }
                };
            }
        }
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

    renderCrewRoster() {
        this.portUI.renderCrewRoster();

	}
	
    showCrewDetail(crewId) {
        const crew = this.game.state.ship.crew.find(c => c.id === crewId);
        if (!crew) return;

        const assignment = this.game.state.ship.systems.find(s => s.assignedCrew?.id === crewId);
        const primarySkill = this.game.state.getRolePrimarySkill(crew.role);
        const availableSystems = this.game.state.ship.systems.filter(s => !s.assignedCrew || s.assignedCrew.id === crewId);

        const content = `
            <div style="max-width: 500px; margin: 0 auto;">
                <div style="text-align: center; margin-bottom: 20px;">
                    <h2 style="color: var(--secondary); margin-bottom: 5px;">${crew.name}</h2>
                    <p style="color: #aaa; font-size: 0.9rem;">${crew.species} • ${crew.gender} • Age ${crew.age}</p>
                    <p style="color: var(--primary); font-weight: bold; font-size: 1.1rem; margin-top: 5px;">${crew.role}</p>
                </div>

                <div style="background: rgba(0,0,0,0.3); padding: 15px; border-radius: 6px; margin-bottom: 15px;">
                    <h3 style="color: var(--warning); font-size: 0.9rem; margin-bottom: 10px;">CORE STATS</h3>
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
                        <div>
                            <div style="font-size: 0.75rem; color: #888;">Health</div>
                            <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 3px;">
                                <div style="flex: 1; height: 8px; background: #333; border-radius: 4px; margin-right: 8px;">
                                    <div style="width: ${crew.health}%; height: 100%; background: var(--success); border-radius: 4px;"></div>
                                </div>
                                <span style="color: var(--success); font-weight: bold; font-size: 0.9rem;">${crew.health}/${crew.maxHealth}</span>
                            </div>
                        </div>
                        <div>
                            <div style="font-size: 0.75rem; color: #888;">Morale</div>
                            <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 3px;">
                                <div style="flex: 1; height: 8px; background: #333; border-radius: 4px; margin-right: 8px;">
                                    <div style="width: ${crew.morale}%; height: 100%; background: ${crew.morale > 70 ? 'var(--success)' : crew.morale > 40 ? 'var(--warning)' : 'var(--danger)'}; border-radius: 4px;"></div>
                                </div>
                                <span style="color: ${crew.morale > 70 ? 'var(--success)' : crew.morale > 40 ? 'var(--warning)' : 'var(--danger)'}; font-weight: bold; font-size: 0.9rem;">${crew.morale}/100</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div style="background: rgba(0,0,0,0.3); padding: 15px; border-radius: 6px; margin-bottom: 15px;">
                    <h3 style="color: var(--primary); font-size: 0.9rem; margin-bottom: 10px;">SKILLS</h3>
                    ${Object.keys(crew.skills).map(skillName => {
            const skill = crew.skills[skillName];
            const isPrimary = skillName === primarySkill;
            const xpPercent = (skill.xp / skill.xpToNext) * 100;
            return `
                            <div style="margin-bottom: 10px;">
                                <div style="display: flex; justify-content: space-between; margin-bottom: 3px;">
                                    <span style="font-size: 0.85rem; ${isPrimary ? 'color: var(--secondary); font-weight: bold;' : ''}">${skillName.charAt(0).toUpperCase() + skillName.slice(1)} ${isPrimary ? '⭐' : ''}</span>
                                    <span style="font-size: 0.85rem; ${isPrimary ? 'color: var(--secondary); font-weight: bold;' : ''}">Level ${skill.level}</span>
                                </div>
                                <div style="height: 6px; background: #333; border-radius: 3px;">
                                    <div style="width: ${xpPercent}%; height: 100%; background: ${isPrimary ? 'var(--secondary)' : 'var(--primary)'}; border-radius: 3px;"></div>
                                </div>
                                <div style="font-size: 0.7rem; color: #666; margin-top: 2px;">${skill.xp}/${skill.xpToNext} XP</div>
                            </div>
                        `;
        }).join('')}
                </div>

                <div style="background: rgba(0,0,0,0.3); padding: 15px; border-radius: 6px; margin-bottom: 15px;">
                    <h3 style="color: var(--success); font-size: 0.9rem; margin-bottom: 10px;">ASSIGNMENT</h3>
                    ${assignment ?
                `<div>
                            <p style="color: var(--primary); font-weight: bold; margin-bottom: 10px;">Currently working at: ${assignment.name}</p>
                            <button id="btn-unassign-crew" style="width: 100%; padding: 8px; background: var(--danger); border-color: var(--danger);">UNASSIGN FROM STATION</button>
                        </div>` :
                `<div>
                            <p style="color: var(--text-dim); margin-bottom: 10px;">Currently idle.</p>
                            <select id="system-selector" style="width: 100%; padding: 8px; background: rgba(0,0,0,0.5); border: 1px solid rgba(255,255,255,0.2); color: #fff; margin-bottom: 10px; cursor: pointer;">
                                <option value="">-- Select System --</option>
                                ${availableSystems.map(s => `<option value="${s.id}">${s.name}</option>`).join('')}
                            </select>
                            <button id="btn-assign-crew" style="width: 100%; padding: 8px;">ASSIGN TO SYSTEM</button>
                        </div>`
            }
                </div>

                <div style="background: rgba(0,0,0,0.3); padding: 15px; border-radius: 6px;">
                    <h3 style="color: #aaa; font-size: 0.9rem; margin-bottom: 8px;">BACKGROUND</h3>
                    <p style="color: #ccc; font-style: italic; font-size: 0.9rem;">"${crew.background}"</p>
                </div>
            </div>
        `;

        this.createModal(`CREW PROFILE: ${crew.name.toUpperCase()}`, content);

        // Add event listeners for assignment buttons
        if (assignment) {
            const unassignBtn = document.getElementById('btn-unassign-crew');
            if (unassignBtn) {
                unassignBtn.onclick = () => {
                    const result = this.game.state.unassignCrewFromSystem(assignment.id);
                    this.showNotification(result.message, result.success ? 'success' : 'error');
                    if (result.success) {
                        this.showCrewDetail(crewId); // Refresh modal
                    }
                };
            }
        } else {
            const assignBtn = document.getElementById('btn-assign-crew');
            if (assignBtn) {
                assignBtn.onclick = () => {
                    const selector = document.getElementById('system-selector');
                    const systemId = selector.value;
                    if (!systemId) {
                        this.showNotification('Please select a system first!', 'warning');
                        return;
                    }
                    const result = this.game.state.assignCrewToSystem(crewId, systemId);
                    this.showNotification(result.message, result.success ? 'success' : 'error');
                    if (result.success) {
                        this.showCrewDetail(crewId); // Refresh modal
                    }
                };
            }
        }
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

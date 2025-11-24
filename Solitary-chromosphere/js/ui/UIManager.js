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

    showNotification(message, type = 'info') {
        const container = document.getElementById('notification-container');
        if (!container) return;

        const notification = document.createElement('div');
        const colors = {
            success: 'var(--success)',
            error: 'var(--danger)',
            info: 'var(--primary)',
            warning: 'var(--warning)'
        };

        notification.style.cssText = `
            background: rgba(0,0,0,0.9);
            border: 1px solid ${colors[type] || colors.info};
            border-left: 4px solid ${colors[type] || colors.info};
            padding: 12px 15px;
            margin-bottom: 10px;
            border-radius: 4px;
            color: #fff;
            font-family: var(--font-body);
            font-size: 0.85rem;
            box-shadow: 0 4px 12px rgba(0,0,0,0.5);
            animation: slideIn 0.3s ease-out;
            pointer-events: auto;
            cursor: pointer;
        `;
        notification.innerHTML = message;

        // Add animation keyframes if not exists
        if (!document.querySelector('#notification-style')) {
            const style = document.createElement('style');
            style.id = 'notification-style';
            style.textContent = `
                @keyframes slideIn {
                    from { transform: translateX(400px); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
                @keyframes slideOut {
                    from { transform: translateX(0); opacity: 1; }
                    to { transform: translateX(400px); opacity: 0; }
                }
            `;
            document.head.appendChild(style);
        }

        container.appendChild(notification);

        // Auto-remove after 3 seconds
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease-in';
            setTimeout(() => notification.remove(), 300);
        }, 3000);

        // Click to dismiss
        notification.onclick = () => {
            notification.style.animation = 'slideOut 0.3s ease-in';
            setTimeout(() => notification.remove(), 300);
        };
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
        hud.className = 'hud';
        hud.innerHTML = `
            <div id="hud-left" class="hud-panel hud-left"></div>
            <div id="hud-status" class="hud-panel hud-status"></div>
            <div id="interaction-prompt" class="interaction-prompt"></div>
        `;
        this.root.appendChild(hud);

        const backButton = document.createElement('button');
        backButton.textContent = 'LEAVE SHIP';
        backButton.className = 'btn-primary';
        backButton.style.cssText = 'position: absolute; top: 20px; left: 20px; z-index: 100;';
        backButton.onclick = () => {
            this.game.sceneManager.changeScene('PORT');
        };
        this.root.appendChild(backButton);

        const prompt = document.createElement('div');
        prompt.id = 'interaction-prompt';
        prompt.className = 'interaction-prompt';
        this.root.appendChild(prompt);

        this.updateHUD();

        // Auto-update HUD every second
        setInterval(() => {
            const hudEl = document.getElementById('hud-status');
            if (hudEl) this.updateHUD(hudEl);
        }, 1000);
    }

    updateHUD(element) {
        const state = this.game.state;
        if (!state || !state.ship) return;

        const target = element || document.getElementById('hud-status');
        if (!target) return;

        const crewPanelsHTML = state.ship.crew.map(c => {
            const assignment = state.ship.systems.find(s => s.assignedCrew?.id === c.id);
            const crewMember = state.crewMembers.find(cm => cm.id === c.id);
            let taskStatus = 'Idle';
            if (crewMember) {
                if (crewMember.state === 'walking') taskStatus = 'Moving';
                else if (crewMember.state === 'working') taskStatus = 'Working';
                else if (assignment) taskStatus = 'Stationed';
            }

            return `
                <div class="crew-panel" onclick="window.uiManager.showCrewDetail(${c.id})" 
                     style="background: rgba(0,0,0,0.4); padding: 8px; margin-bottom: 8px; cursor: pointer; border-radius: 4px; border: 1px solid rgba(255,255,255,0.1);">
                    <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 5px;">
                        <div style="width: 12px; height: 12px; border-radius: 50%; background: ${crewMember?.color || '#fff'};"></div>
                        <div style="flex: 1; font-size: 0.75rem; font-weight: bold; color: var(--secondary);">${c.name.split(' ')[0]}</div>
                    </div>
                    <div style="font-size: 0.65rem; color: #aaa; margin-bottom: 3px;">${c.role}</div>
                    <div style="display: flex; gap: 5px; margin-bottom: 3px;">
                        <div style="flex: 1; height: 4px; background: #333; border-radius: 2px;">
                            <div style="width: ${c.health}%; height: 100%; background: var(--success); border-radius: 2px;"></div>
                        </div>
                        <div style="flex: 1; height: 4px; background: #333; border-radius: 2px;">
                            <div style="width: ${c.morale}%; height: 100%; background: ${c.morale > 70 ? 'var(--success)' : c.morale > 40 ? 'var(--warning)' : 'var(--danger)'}; border-radius: 2px;"></div>
                        </div>
                    </div>
                    <div style="font-size: 0.6rem; color: var(--text-dim);">${taskStatus}</div>
                </div>
            `;
        }).join('');

        target.innerHTML = `
            <h3>${state.ship.name}</h3>
            <div class="stat-row">
                <span>CREDITS</span>
                <span class="stat-value">${state.credits} CR</span>
            </div>
            <div class="stat-row">
                <span>HULL</span>
                <span class="stat-value">${state.ship.hull}%</span>
            </div>
            <div class="stat-row">
                <span>FUEL</span>
                <span class="stat-value">${state.ship.fuel}/${state.ship.maxFuel}</span>
            </div>
            <div class="stat-row">
                <span>CREW</span>
                <span class="stat-value">${state.ship.crew.length}/${state.ship.maxCrew}</span>
            </div>
            ${state.ship.crew.length > 0 ? `
                <div style="margin-top: 15px; padding-top: 15px; border-top: 1px solid rgba(255,255,255,0.1);">
                    <h4 style="font-size: 0.8rem; color: var(--secondary); margin-bottom: 10px;">CREW STATUS</h4>
                    <div style="max-height: 300px; overflow-y: auto;">
                        ${crewPanelsHTML}
                    </div>
                </div>
            ` : ''}
        `;
    }

    showPrompt(text) {
        const prompt = document.getElementById('interaction-prompt');
        if (prompt) {
            prompt.textContent = text;
            prompt.classList.add('visible');
        }
    }

    hidePrompt() {
        const prompt = document.getElementById('interaction-prompt');
        if (prompt) {
            prompt.classList.remove('visible');
        }
    }

    // PORT UI
    renderPortUI() {
        this.clearUI();
        const container = document.createElement('div');
        container.className = 'port-overlay';
        container.innerHTML = `
            <div class="port-menu" id="port-main-menu">
                <h1>STELLAR PORT ALPHA</h1>
                <div class="menu-buttons">
                    <button id="btn-shipyard">SHIPYARD</button>
                    <button id="btn-tavern">TAVERN</button>
                    <button id="btn-market">MARKET</button>
                    <button id="btn-contracts">CONTRACTS</button>
                    <button id="btn-crew">CREW ROSTER</button>
                    <button id="btn-cargo">CARGO BAY</button>
                </div>
                <button id="btn-depart" class="btn-primary">DOCK AT STATION</button>
            </div>
        `;
        this.root.appendChild(container);

        // Event listeners
        document.getElementById('btn-depart').onclick = () => {
            this.game.sceneManager.changeScene('SHIP');
        };
        document.getElementById('btn-shipyard').onclick = () => this.renderShipyard();
        document.getElementById('btn-tavern').onclick = () => this.renderTavern();
        document.getElementById('btn-market').onclick = () => this.renderMarket();
        document.getElementById('btn-contracts').onclick = () => this.renderContracts();
        document.getElementById('btn-crew').onclick = () => this.renderCrewRoster();
        document.getElementById('btn-cargo').onclick = () => this.renderCargoBay();
    }

    renderShipyard() {
        const ships = this.game.state.port.ships || [];
        const content = `
            <div class="module-grid">
                ${ships.map(ship => `
                    <div class="module-card">
                        <h3>${ship.name}</h3>
                        <p>Hull: ${ship.hull}% | Fuel: ${ship.fuel}/${ship.maxFuel}</p>
                        <p class="price">${ship.cost} CR</p>
                        <button data-ship-id="${ship.id}">BUY</button>
                    </div>
                `).join('')}
            </div>
        `;
        this.createModal('SHIPYARD', content);

        const buyButtons = document.querySelectorAll('[data-ship-id]');
        buyButtons.forEach(btn => {
            btn.onclick = () => {
                const shipId = parseInt(btn.dataset.shipId);
                const result = this.game.state.buyShip(shipId);
                if (result.success) {
                    this.showNotification(result.message, 'success');
                    // Restore port menu before removing modal
                    const portMenu = document.getElementById('port-main-menu');
                    if (portMenu) portMenu.style.display = 'flex';
                    document.querySelector('.modal-overlay').remove();
                } else {
                    this.showNotification(result.message, 'error');
                }
            };
        });
    }

    renderTavern() {
        const crew = this.game.state.port.crew || [];
        const content = `
            <div class="module-grid">
                ${crew.map(c => {
            const primarySkill = this.game.state.getRolePrimarySkill(c.role);
            const primaryLevel = c.skills[primarySkill]?.level || 1;

            return `
                    <div class="module-card" style="padding: 15px;">
                        <h4 style="color: var(--secondary); margin-bottom: 5px;">${c.name}</h4>
                        <p style="color: #aaa; font-size: 0.85rem; margin-bottom: 10px;">${c.species} • ${c.gender} • Age ${c.age}</p>
                        <p style="color: #fff; font-weight: bold;">${c.role} • Lvl ${primaryLevel}</p>
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin: 10px 0; font-size: 0.8rem;">
                            <div>
                                <span style="color: #888;">Health:</span>
                                <span style="color: var(--success);"> ${c.health}/${c.maxHealth}</span>
                            </div>
                            <div>
                                <span style="color: #888;">Morale:</span>
                                <span style="color: ${c.morale > 70 ? 'var(--success)' : c.morale > 40 ? 'var(--warning)' : 'var(--danger)'};"> ${c.morale}/100</span>
                            </div>
                        </div>
                        <div style="font-size: 0.75rem; color: #999; margin-bottom: 8px;">
                            ${Object.entries(c.skills).map(([skill, data]) =>
                `${skill.charAt(0).toUpperCase() + skill.slice(1)}: ${data.level}`
            ).join(' • ')}
                        </div>
                        <p class="price">${c.cost} CR</p>
                        <button style="margin-top: 10px; width: 100%; font-size: 0.8rem;" data-crew-id="${c.id}">HIRE</button>
                    </div>
                    `;
        }).join('')}
            </div>
        `;
        this.createModal('TAVERN', content);

        const hireButtons = document.querySelectorAll('[data-crew-id]');
        hireButtons.forEach(btn => {
            btn.onclick = () => {
                const crewId = parseInt(btn.dataset.crewId);
                const result = this.game.state.hireCrew(crewId);
                if (result.success) {
                    this.showNotification(result.message, 'success');
                    this.renderTavern(); // Refresh
                } else {
                    this.showNotification(result.message, 'error');
                }
            };
        });
    }

    renderMarket() {
        const items = this.game.state.port.goods || [];
        const content = `
            <div class="module-grid">
                ${items.map(item => `
                    <div class="module-card">
                        <h3>${item.name}</h3>
                        <p class="price">${item.price} CR</p>
                        <button data-item-id="${item.id}">BUY</button>
                    </div>
                `).join('')}
            </div>
        `;
        this.createModal('MARKET', content);

        const buyButtons = document.querySelectorAll('[data-item-id]');
        buyButtons.forEach(btn => {
            btn.onclick = () => {
                const itemId = btn.dataset.itemId;
                const result = this.game.state.buyItem(itemId);
                if (result.success) {
                    this.showNotification(result.message, 'success');
                } else {
                    this.showNotification(result.message, 'error');
                }
            };
        });
    }

    renderContracts() {
        const contracts = this.game.state.port.contracts || [];
        const content = `
            <div class="module-grid">
                ${contracts.map(contract => `
                    <div class="module-card">
                        <h3>${contract.title}</h3>
                        <p>${contract.description}</p>
                        <p class="price">Reward: ${contract.reward} CR</p>
                        <button data-contract-id="${contract.id}">ACCEPT</button>
                    </div>
                `).join('')}
            </div>
        `;
        this.createModal('CONTRACTS', content);

        const acceptButtons = document.querySelectorAll('[data-contract-id]');
        acceptButtons.forEach(btn => {
            btn.onclick = () => {
                const contractId = btn.dataset.contractId;
                const result = this.game.state.acceptContract(contractId);
                if (result.success) {
                    this.showNotification(result.message, 'success');
                } else {
                    this.showNotification(result.message, 'error');
                }
            };
        });
    }

    createModal(title, content) {
        const portMenu = document.getElementById('port-main-menu');
        if (portMenu) portMenu.style.display = 'none';

        const existing = document.querySelector('.modal-overlay');
        if (existing) existing.remove();

        const overlay = document.createElement('div');
        overlay.className = 'modal-overlay';
        overlay.innerHTML = `
            <div class="modal">
                <div class="modal-header">
                    <h2>${title}</h2>
                    <button class="modal-close">&times;</button>
                </div>
                <div class="modal-content">
                    ${content}
                </div>
            </div>
        `;

        this.root.appendChild(overlay);

        overlay.querySelector('.modal-close').onclick = () => {
            overlay.remove();
            if (portMenu) portMenu.style.display = 'flex';
        };

        overlay.onclick = (e) => {
            if (e.target === overlay) {
                overlay.remove();
                if (portMenu) portMenu.style.display = 'flex';
            }
        };
    }

    renderSystemConsole(system) {
        const assignedCrew = system.assignedCrew;
        const availableCrew = this.game.state.ship.crew.filter(c =>
            !this.game.state.ship.systems.some(s => s.assignedCrew?.id === c.id)
        );

        const content = `
            <div style="text-align: center;">
                <h1 style="color: ${system.color}; margin-bottom: 10px;">${system.name.toUpperCase()}</h1>
                <div style="font-family: var(--font-body); color: var(--text-dim); margin-bottom: 20px;">SYSTEM ID: ${system.id.toUpperCase()} • TYPE: ${system.type.toUpperCase()}</div>
                
                <div style="margin-bottom: 20px;">
                    <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
                        <span>INTEGRITY</span>
                        <span>100%</span>
                    </div>
                    <div style="width: 100%; height: 10px; background: #333; border-radius: 5px;">
                        <div style="width: 100%; height: 100%; background: ${system.color}; border-radius: 5px; box-shadow: 0 0 10px ${system.color};"></div>
                    </div>
                </div>

                <div style="background: rgba(255,255,255,0.05); padding: 15px; margin-bottom: 20px; border: 1px solid rgba(255,255,255,0.1);">
                    <h3 style="color: var(--secondary); margin-bottom: 10px;">ASSIGNED CREW</h3>
                    ${assignedCrew ? `
                        <p style="font-size: 1.1rem; font-weight: bold; color: var(--primary);">${assignedCrew.name}</p>
                        <p style="font-size: 0.9rem; color: var(--text-dim);">${assignedCrew.role} • Skill: ${assignedCrew.skill}/10</p>
                        <button id="btn-unassign" style="margin-top: 10px; border-color: var(--danger); color: var(--danger); font-size: 0.8rem;">UNASSIGN</button>
                    ` : `
                        <p style="color: var(--text-dim);">No crew assigned</p>
                        ${availableCrew.length > 0 ? `
                            <select id="crew-select" style="width: 100%; padding: 8px; margin-top: 10px; background: #1a1a2e; color: #fff; border: 1px solid var(--primary);">
                                <option value="">-- Select Crew --</option>
                                ${availableCrew.map(c => `<option value="${c.id}">${c.name} (${c.role}, Skill ${c.skill})</option>`).join('')}
                            </select>
                            <button id="btn-assign" style="margin-top: 10px; font-size: 0.8rem;">ASSIGN CREW</button>
                        ` : '<p style="color: var(--warning); font-size: 0.8rem; margin-top: 10px;">All crew assigned. Hire more at port.</p>'}
                    `}
                </div>

                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
                    <button>DIAGNOSTICS</button>
                    <button>POWER: ON</button>
                </div>
            </div>
        `;
        this.createModal('SYSTEM CONSOLE', content);

        // Add event listeners for crew assignment
        if (!assignedCrew && availableCrew.length > 0) {
            const assignBtn = document.getElementById('btn-assign');
            const crewSelect = document.getElementById('crew-select');
            if (assignBtn && crewSelect) {
                assignBtn.onclick = () => {
                    const crewId = parseInt(crewSelect.value);
                    if (crewId) {
                        const result = this.game.state.assignCrewToSystem(crewId, system.id);
                        this.showNotification(result.message, result.success ? 'success' : 'error');
                        if (result.success) {
                            this.renderSystemConsole(system); // Refresh
                        }
                    } else {
                        this.showNotification('Please select a crew member!', 'warning');
                    }
                };
            }
        } else if (assignedCrew) {
            const unassignBtn = document.getElementById('btn-unassign');
            if (unassignBtn) {
                unassignBtn.onclick = () => {
                    const result = this.game.state.unassignCrewFromSystem(system.id);
                    this.showNotification(result.message, result.success ? 'success' : 'error');
                    if (result.success) {
                        this.renderSystemConsole(system); // Refresh
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

    // --- CREW & CARGO MANAGEMENT ---

    renderCrewRoster() {
        const crew = this.game.state.ship.crew || [];
        const content = `
            <div style="text-align: center;">
                ${crew.length === 0 ? `
                    <p style="color: var(--text-dim); padding: 40px;">No crew hired yet. Visit the Tavern at the port to recruit crew members.</p>
                ` : `
                    <div style="display: flex; flex-direction: column; gap: 12px;">
                        ${crew.map(c => {
            const assignment = this.game.state.ship.systems.find(s => s.assignedCrew?.id === c.id);
            const primarySkill = this.game.state.getRolePrimarySkill(c.role);
            const primaryLevel = c.skills[primarySkill]?.level || c.skill;

            return `
                                <div style="background: rgba(255,255,255,0.05); padding: 15px; border: 1px solid rgba(255,255,255,0.1); cursor: pointer; transition: all 0.2s;" 
                                     onmouseover="this.style.background='rgba(255,255,255,0.1)'"  
                                     onmouseout="this.style.background='rgba(255,255,255,0.05)'"
                                     onclick="window.uiManager.showCrewDetail(${c.id})">
                                    <div style="display: flex; justify-content: space-between; gap: 15px;">
                                        <div style="text-align: left; flex: 1;">
                                            <h4 style="color: var(--secondary); margin-bottom: 3px;">${c.name}</h4>
                                            <p style="font-size: 0.85rem; color: #aaa; margin-bottom: 8px;">${c.species} • ${c.gender} • ${c.role}</p>
                                            
                                            <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px; margin-bottom: 8px;">
                                                <div style="background: rgba(0,0,0,0.3); padding: 5px; border-radius: 3px;">
                                                    <div style="font-size: 0.75rem; color: #888;">Health</div>
                                                    <div style="color: var(--success); font-weight: bold;">${c.health}/${c.maxHealth}</div>
                                                </div>
                                                <div style="background: rgba(0,0,0,0.3); padding: 5px; border-radius: 3px;">
                                                    <div style="font-size: 0.75rem; color: #888;">Morale</div>
                                                    <div style="color: ${c.morale > 70 ? 'var(--success)' : c.morale > 40 ? 'var(--warning)' : 'var(--danger)'}; font-weight: bold;">${c.morale}/100</div>
                                                </div>
                                            </div>

                                            ${assignment ?
                    `<p style="color: var(--primary); font-size: 0.8rem; font-weight: bold;">⚙️ Assigned to: ${assignment.name}</p>` :
                    `<p style="color: var(--text-dim); font-size: 0.8rem;">Idle</p>`
                }
                                        </div>
                                        
                                        <div style="text-align: right; min-width: 80px;">
                                            <div style="background: rgba(0,240,255,0.1); border: 1px solid var(--primary); padding: 8px; border-radius: 4px;">
                                                <div style="font-size: 0.75rem; color: var(--primary);">Primary Skill</div>
                                                <div style="font-size: 1.5rem; font-weight: bold; color: var(--secondary);">${primaryLevel}</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            `;
        }).join('')}
                    </div>
                    <p style="color: var(--text-dim); font-size: 0.8rem; margin-top: 15px;">Click on a crew member for detailed stats</p>
                `}
            </div>
        `;
        this.createModal('CREW ROSTER', content);
    }

    renderCargoBay() {
        const inventory = this.game.state.inventory || [];
        const modules = inventory.filter(i => i.type === 'module');
        const consumables = inventory.filter(i => !i.type || i.type !== 'module');

        const content = `
            <div style="text-align: center;">
                <h3 style="color: var(--warning); margin-bottom: 15px;">Consumables</h3>
                ${consumables.length === 0 ? '<p style="color: var(--text-dim);">No consumables in cargo.</p>' : `
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 30px;">
                        ${consumables.map(item => `
                            <div style="background: rgba(255,255,255,0.05); padding: 10px; border: 1px solid rgba(255,255,255,0.1);">
                                <p style="font-weight: bold;">${item.name}</p>
                                <p style="font-size: 0.9rem; color: var(--text-dim);">Qty: ${item.quantity}</p>
                            </div>
                        `).join('')}
                    </div>
                `}

                <h3 style="color: var(--primary); margin-bottom: 15px;">Modules</h3>
                ${modules.length === 0 ? '<p style="color: var(--text-dim);">No modules in cargo. Purchase from port shipyard.</p>' : `
                    <div style="display: flex; flex-direction: column; gap: 10px;">
                        ${modules.map(item => `
                            <div style="background: rgba(255,255,255,0.05); padding: 15px; border: 1px solid rgba(255,255,255,0.1); display: flex; justify-content: space-between; align-items: center;">
                                <div style="text-align: left;">
                                    <p style="font-weight: bold;">${item.name}</p>
                                    <p style="font-size: 0.9rem; color: var(--text-dim);">Type: ${item.systemType} • Qty: ${item.quantity}</p>
                                </div>
                                <button style="font-size: 0.8rem; padding: 5px 15px;">INSTALL</button>
                            </div>
                        `).join('')}
                    </div>
                `}
            </div>
        `;
        this.createModal('CARGO BAY', content);
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
}

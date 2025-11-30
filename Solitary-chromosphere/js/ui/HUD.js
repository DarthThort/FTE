class HUD {
    constructor(game, root) {
        this.game = game;
        this.root = root;
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
        const crewPanelsHTML = state.ship.crew.map(c => {
            const assignment = state.ship.systems.find(s => s.assignedCrew?.id === c.id);
            let taskStatus = 'Idle';
            if (assignment) taskStatus = `At ${assignment.name}`;
            const primarySkill = state.getRolePrimarySkill(c.role);
            const primaryLevel = c.skills[primarySkill]?.level || 1;
            return `
                <div class="crew-mini-panel" data-crew-id="${c.id}" style="
                    background: rgba(0,0,0,0.3);
                    border: 1px solid rgba(255,255,255,0.2);
                    padding: 8px;
                    margin-bottom: 5px;
                    cursor: pointer;
                    transition: all 0.2s;
                ">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 3px;">
                        <span style="color: var(--secondary); font-weight: bold; font-size: 0.85rem;">${c.name}</span>
                        <span style="color: #888; font-size: 0.75rem;">${c.role}</span>
                    </div>
                    <div style="color: #aaa; font-size: 0.7rem;">${taskStatus}</div>
                    <div style="color: var(--primary); font-size: 0.7rem;">Lvl ${primaryLevel}</div>
                </div>
            `;
        }).join('');

        element.innerHTML = `
            <div style="display: flex; flex-direction: column; gap: 15px;">
                <div>
                    <h3 style="margin-bottom: 10px; font-size: 1rem;">STATUS</h3>
                    <div class="stat-row">
                        <span>Credits</span>
                        <span class="stat-value">${state.credits} CR</span>
                    </div>
                    <div class="stat-row">
                        <span>Fuel</span>
                        <span class="stat-value">${state.ship.fuel}/${state.ship.maxFuel}</span>
                    </div>
                    
                    <!-- Hull Health Bar -->
                    <div style="margin: 10px 0;">
                        <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
                            <span style="font-size: 0.85rem; color: var(--text-main);">Hull</span>
                            <span style="font-size: 0.85rem; color: ${state.ship.health / state.ship.maxHealth > 0.5 ? '#00ff55' : state.ship.health / state.ship.maxHealth > 0.25 ? '#ffaa00' : '#ff0055'};">
                                ${state.ship.health}/${state.ship.maxHealth}
                            </span>
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
                                width: ${(state.ship.health / state.ship.maxHealth) * 100}%;
                                height: 100%;
                                background: ${state.ship.health / state.ship.maxHealth > 0.5 ? '#00ff55' : state.ship.health / state.ship.maxHealth > 0.25 ? '#ffaa00' : '#ff0055'};
                                box-shadow: 0 0 8px ${state.ship.health / state.ship.maxHealth > 0.5 ? '#00ff55' : state.ship.health / state.ship.maxHealth > 0.25 ? '#ffaa00' : '#ff0055'};
                                transition: width 0.3s ease, background 0.3s ease;
                            "></div>
                        </div>
                    </div>
                    
                    <div class="stat-row">
                        <span>Location</span>
                        <span class="stat-value">${state.currentPlanet?.name || 'Unknown'}</span>
                    </div>
                </div>

                <div>
                    <h3 style="margin-bottom: 10px; font-size: 1rem;">CREW</h3>
                    ${crewPanelsHTML || '<p style="color: #888; font-size: 0.75rem;">No crew</p>'}
                </div>

                <div style="display: flex; gap: 10px;">
                    <button id="btn-nav" style="flex: 1; padding: 8px; font-size: 0.8rem;">NAV</button>
                    <button id="btn-dock" style="flex: 1; padding: 8px; font-size: 0.8rem;" ${state.currentPlanet?.hasStation ? '' : 'disabled'}>DOCK</button>
                </div>
            </div>
        `;

        // Add crew panel click listeners
        setTimeout(() => {
            const crewPanels = document.querySelectorAll('.crew-mini-panel');
            crewPanels.forEach(panel => {
                panel.addEventListener('mouseover', () => {
                    panel.style.borderColor = 'var(--primary)';
                    panel.style.background = 'rgba(0, 240, 255, 0.1)';
                });
                panel.addEventListener('mouseout', () => {
                    panel.style.borderColor = 'rgba(255,255,255,0.2)';
                    panel.style.background = 'rgba(0,0,0,0.3)';
                });
                panel.onclick = () => {
                    const crewId = parseInt(panel.dataset.crewId);
                    // UIManager will handle this
                    if (this.game.ui && this.game.ui.showCrewDetail) {
                        this.game.ui.showCrewDetail(crewId);
                    }
                };
            });

            const btnNav = document.getElementById('btn-nav');
            if (btnNav) {
                btnNav.onclick = () => {
                    // Show system map first, then galaxy map
                    if (this.game.ui && this.game.ui.renderSystemMap) {
                        this.game.ui.renderSystemMap();
                    }
                };
            }

            const btnDock = document.getElementById('btn-dock');
            if (btnDock) {
                btnDock.onclick = () => {
                    this.game.sceneManager.changeScene('PORT');
                };
            }
        }, 100);
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
            border-radius: 4px;
            margin-bottom: 10px;
            color: var(--text-main);
            font-family: var(--font-body);
            font-size: 0.9rem;
            box-shadow: 0 4px 6px rgba(0,0,0,0.5);
            cursor: pointer;
            animation: slideIn 0.3s ease-out;
            max-width: 300px;
            word-wrap: break-word;
        `;
        notification.textContent = message;

        // Add animation keyframes if not already present
        if (!document.getElementById('notification-styles')) {
            const style = document.createElement('style');
            style.id = 'notification-styles';
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
}

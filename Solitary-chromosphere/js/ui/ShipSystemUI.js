class ShipSystemUI {
    constructor(game, root, uiManager) {
        this.game = game;
        this.root = root;
        this.uiManager = uiManager;
    }

    renderSystemConsole(system) {
        const systemToHardpoint = {
            'bridge': 'bridge',
            'engine': 'engine',
            'shield': 'shield',
            'jumpdrive': 'jumpDrive',
            'reactor': 'reactor',
            'weapon': system.id === 'weapons1' ? 'weapon1' : 'weapon2'
        };

        const hardpointKey = systemToHardpoint[system.type];
        const installedModuleId = hardpointKey ? this.game.state.ship.hardpoints[hardpointKey] : null;
        const installedModule = installedModuleId ? getModule(installedModuleId) : null;

        // Get crew info
        const assignedCrew = system.assignedCrew;
        const isCaptainAssigned = system.assignedCaptain || (assignedCrew && assignedCrew.id === 'captain');
        const availableCrew = this.game.state.ship.crew.filter(c => {
            const isAssignedElsewhere = this.game.state.ship.systems.some(s =>
                s.id !== system.id && (s.assignedCrew?.id === c.id || (c.id === 'captain' && s.assignedCaptain))
            );
            return !isAssignedElsewhere && c.id !== 'captain';
        });

        const currentLevel = system.level || 1;
        const upgradeCost = currentLevel * 30;

        const content = `
            <div style="text-align: center; font-family: var(--font-tech);">
                <h1 style="color: ${system.color}; margin-bottom: 5px; font-size: 1.8rem; letter-spacing: 2px;">${system.name.toUpperCase()}</h1>
                <div style="color: var(--text-dim); margin-bottom: 5px; font-size: 0.85rem;">TIPO: ${system.type.toUpperCase()} • NIVEL ACTUAL: <span style="color: var(--primary); font-weight: bold;">NIVEL ${currentLevel}</span> (${system.maxPower} Potencia Máx)</div>
                <div style="color: #ffaa00; font-weight: bold; margin-bottom: 20px; font-size: 0.85rem;">COORDENADAS DE CONSOLA: (${system.x}, ${system.y})</div>
                
                <!-- CAPTAIN / JUGADOR OPERATING CONSOLE SECTION -->
                <div style="background: rgba(0, 240, 255, 0.1); border: 1px solid var(--primary); padding: 15px; border-radius: 8px; margin-bottom: 20px; text-align: left;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                        <span style="color: var(--primary); font-weight: bold; font-size: 0.95rem;">👨‍✈️ MANDO DEL CAPITÁN / JUGADOR</span>
                        <span style="font-size: 0.8rem; color: ${isCaptainAssigned ? '#00ff55' : '#aaa'};">${isCaptainAssigned ? 'OPERANDO ESTACIÓN (+25% BONUS)' : 'INACTIVO'}</span>
                    </div>
                    <p style="color: #cbd5e1; font-size: 0.8rem; margin-bottom: 12px;">
                        El Capitán (Jugador) puede atender personalmente esta consola para otorgar una bonificación táctica del 25% de efectividad.
                    </p>
                    ${isCaptainAssigned ? `
                        <button id="btn-unassign-captain" style="width: 100%; padding: 10px; background: rgba(255,0,85,0.2); border: 1px solid #ff0055; color: #ff0055; border-radius: 4px; cursor: pointer; font-weight: bold;">
                            👨‍✈️ LIBERAR CAPITÁN DE ESTA CONSOLA
                        </button>
                    ` : `
                        <button id="btn-assign-captain" style="width: 100%; padding: 10px; background: rgba(0,240,255,0.25); border: 1px solid var(--primary); color: var(--primary); border-radius: 4px; cursor: pointer; font-weight: bold;">
                            👨‍✈️ OPERAR CONSOLA COMO CAPITÁN (+25% BONIFICACIÓN)
                        </button>
                    `}
                </div>

                <!-- INSTALLED MODULE INFO -->
                ${installedModule ? `
                    <div style="background: linear-gradient(135deg, rgba(0,240,255,0.15), rgba(0,240,255,0.05)); border: 2px solid var(--primary); border-radius: 8px; padding: 15px; margin-bottom: 20px;">
                        <div style="color: var(--primary); font-size: 1.2rem; font-weight: bold; margin-bottom: 5px;">
                            ${installedModule.name}
                        </div>
                        <div style="color: #888; font-size: 0.85rem; margin-bottom: 10px;">
                            Tier ${installedModule.tier} ${installedModule.category}
                        </div>
                        ${installedModule.description ? `
                            <div style="color: var(--text-dim); font-size: 0.8rem; line-height: 1.4; margin-bottom: 10px; padding: 8px; background: rgba(0,0,0,0.3); border-radius: 4px;">
                                ${installedModule.description}
                            </div>
                        ` : ''}
                    </div>
                ` : `
                    <div style="background: rgba(255,255,255,0.03); border: 2px dashed #444; border-radius: 8px; padding: 15px; margin-bottom: 20px;">
                        <div style="color: #888; font-size: 1rem; font-weight: bold; margin-bottom: 5px;">⚠️ SIN MÓDULO INSTALADO</div>
                        <div style="color: #666; font-size: 0.85rem;">Puedes instalar un módulo compatible desde el inventario</div>
                    </div>
                `}

                <!-- INTEGRIDAD DEL SISTEMA -->
                <div style="margin-bottom: 20px; text-align: left;">
                    <div style="display: flex; justify-content: space-between; margin-bottom: 5px; font-size: 0.85rem;">
                        <span style="color: var(--text-dim);">INTEGRIDAD DE ESTRUCTURA</span>
                        <span style="color: ${system.health === system.maxHealth ? 'var(--success)' : 'var(--warning)'}; font-weight: bold;">${Math.round((system.health / system.maxHealth) * 100)}% (${system.health}/${system.maxHealth} HP)</span>
                    </div>
                    <div style="background: rgba(255,255,255,0.1); height: 12px; border-radius: 6px; overflow: hidden;">
                        <div style="background: linear-gradient(90deg, ${system.color}, ${system.color}88); height: 100%; width: ${(system.health / system.maxHealth) * 100}%; transition: width 0.3s;"></div>
                    </div>
                </div>

                <!-- SYSTEM LEVEL UPGRADE SECTION (CHATARRA) -->
                <div style="background: rgba(255, 170, 0, 0.1); border: 1px solid var(--warning); padding: 15px; border-radius: 8px; margin-bottom: 20px; text-align: left;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                        <span style="color: var(--warning); font-weight: bold; font-size: 0.95rem;">⚡ MEJORAR NIVEL DE SISTEMA</span>
                        <span style="color: #fff; font-size: 0.85rem;">Chatarra Actual: <span style="color: var(--warning); font-weight: bold;">${this.game.state.scrap}</span></span>
                    </div>
                    <p style="color: #cbd5e1; font-size: 0.8rem; margin-bottom: 12px;">
                        Aumenta el nivel y la potencia máxima disponible de este sistema.
                    </p>
                    <button id="btn-upgrade-system-power" style="width: 100%; padding: 12px; background: rgba(255,170,0,0.25); border: 1px solid var(--warning); color: var(--warning); border-radius: 4px; cursor: pointer; font-weight: bold;">
                        ⚡ MEJORAR A NIVEL ${currentLevel + 1} (+1 CAPACIDAD DE ENERGÍA) • COSTO: ${upgradeCost} CHATARRA
                    </button>
                </div>

                <!-- CREW ASSIGNMENT -->
                ${assignedCrew && !isCaptainAssigned ? `
                    <div style="background: rgba(0,255,100,0.1); border: 1px solid var(--success); padding: 15px; border-radius: 6px; margin-bottom: 20px; text-align: left;">
                        <h3 style="color: var(--success); font-size: 0.9rem; margin-bottom: 10px;">✅ TRIPULANTE ASIGNADO</h3>
                        <div style="background: rgba(0,0,0,0.3); padding: 10px; border-radius: 4px; margin-bottom: 10px;">
                            <h4 style="color: var(--secondary); margin-bottom: 5px;">${assignedCrew.name}</h4>
                            <p style="font-size: 0.85rem; color: #aaa;">${assignedCrew.role} • Nivel ${assignedCrew.skills[this.game.state.getRolePrimarySkill(assignedCrew.role)]?.level || 1}</p>
                        </div>
                        <button id="btn-unassign-crew" style="width: 100%; padding: 8px; background: rgba(255,0,0,0.2); border: 1px solid var(--danger); color: var(--danger); border-radius: 4px; cursor: pointer;">
                            DESASIGNAR TRIPULANTE
                        </button>
                    </div>
                ` : !isCaptainAssigned ? `
                    <div style="background: rgba(255,200,0,0.05); border: 1px solid rgba(255,200,0,0.3); padding: 15px; border-radius: 6px; margin-bottom: 20px; text-align: left;">
                        <h3 style="color: #ffaa00; font-size: 0.9rem; margin-bottom: 10px;">👥 ASIGNAR OTRO TRIPULANTE</h3>
                        <select id="crew-selector" style="width: 100%; padding: 8px; background: rgba(0,0,0,0.5); border: 1px solid rgba(255,255,255,0.2); color: #fff; margin-bottom: 10px; border-radius: 4px;">
                            <option value="">-- Seleccionar Tripulante --</option>
                            ${availableCrew.map(c => {
                                const primarySkill = this.game.state.getRolePrimarySkill(c.role);
                                const level = c.skills[primarySkill]?.level || 1;
                                return `<option value="${c.id}">${c.name} (${c.role}, Nivel ${level})</option>`;
                            }).join('')}
                        </select>
                        <button id="btn-assign-crew" style="width: 100%; padding: 8px; background: rgba(0,240,255,0.2); border: 1px solid var(--primary); color: var(--primary); border-radius: 4px; cursor: pointer;">ASIGNAR TRIPULANTE A LA ESTACIÓN</button>
                    </div>
                ` : ''}

                <!-- MODULE MANAGEMENT BUTTONS -->
                <div style="display: grid; grid-template-columns: ${installedModule ? 'repeat(2, 1fr)' : '1fr'}; gap: 10px;">
                    ${installedModule ? `
                        <button id="btn-upgrade" style="padding: 12px; background: rgba(255,170,0,0.2); border: 1px solid var(--warning); color: var(--warning); border-radius: 4px; cursor: pointer;">
                            🛠️ MEJORAR MÓDULO
                        </button>
                        <button id="btn-uninstall-module" style="padding: 12px; background: rgba(255,0,0,0.2); border: 1px solid var(--danger); color: var(--danger); border-radius: 4px; cursor: pointer;">
                            🗑️ DESINSTALAR MÓDULO
                        </button>
                    ` : `
                        <button id="btn-install-module" style="padding: 12px; background: rgba(0,255,100,0.2); border: 1px solid var(--success); color: var(--success); border-radius: 4px; cursor: pointer;">
                            ➕ INSTALAR MÓDULO
                        </button>
                    `}
                </div>
            </div>
        `;

        this.uiManager.createModal('CONSOLA DE CONTROL DE SISTEMA', content);

        // Close on click outside
        const modalOverlay = document.querySelector('.modal-overlay');
        if (modalOverlay) {
            modalOverlay.addEventListener('click', (e) => {
                if (e.target === modalOverlay) {
                    modalOverlay.remove();
                }
            });
        }

        // Event listeners
        setTimeout(() => {
            // Captain Assignment
            const btnAssignCaptain = document.getElementById('btn-assign-captain');
            if (btnAssignCaptain) {
                btnAssignCaptain.onclick = () => {
                    const result = this.game.state.assignCaptainToSystem(system.id);
                    this.uiManager.hud.showNotification(result.message, result.success ? 'success' : 'error');
                    if (result.success) {
                        this.renderSystemConsole(system);
                    }
                };
            }

            const btnUnassignCaptain = document.getElementById('btn-unassign-captain');
            if (btnUnassignCaptain) {
                btnUnassignCaptain.onclick = () => {
                    const result = this.game.state.unassignCaptainFromSystem(system.id);
                    this.uiManager.hud.showNotification(result.message, result.success ? 'success' : 'error');
                    if (result.success) {
                        this.renderSystemConsole(system);
                    }
                };
            }

            // System Level Upgrade
            const btnUpgradePower = document.getElementById('btn-upgrade-system-power');
            if (btnUpgradePower) {
                btnUpgradePower.onclick = () => {
                    const result = this.game.state.upgradeSystem(system.id);
                    this.uiManager.hud.showNotification(result.message, result.success ? 'success' : 'error');
                    if (result.success) {
                        this.renderSystemConsole(system);
                    }
                };
            }

            // Crew assignment
            const btnAssignCrew = document.getElementById('btn-assign-crew');
            if (btnAssignCrew) {
                btnAssignCrew.onclick = () => {
                    const selector = document.getElementById('crew-selector');
                    const crewId = parseInt(selector.value);
                    if (!crewId) {
                        this.uiManager.hud.showNotification('Por favor, selecciona un tripulante', 'error');
                        return;
                    }
                    const result = this.game.state.assignCrewToSystem(crewId, system.id);
                    this.uiManager.hud.showNotification(result.message, result.success ? 'success' : 'error');
                    if (result.success) {
                        this.renderSystemConsole(system);
                    }
                };
            }

            const btnUnassignCrew = document.getElementById('btn-unassign-crew');
            if (btnUnassignCrew) {
                btnUnassignCrew.onclick = () => {
                    const result = this.game.state.unassignCrewFromSystem(system.id);
                    this.uiManager.hud.showNotification(result.message, result.success ? 'success' : 'error');
                    if (result.success) {
                        this.renderSystemConsole(system);
                    }
                };
            }
        }, 50);
    }

    renderInstallMenu(x, y) {
        // Simple module installation UI
        const ownedModules = this.game.state.ownedModules || [];
        const content = `
            <div style="font-family: var(--font-tech); text-align: center;">
                <h2 style="color: var(--primary); margin-bottom: 15px;">INSTALAR MÓDULO EN (${x}, ${y})</h2>
                ${ownedModules.length > 0 ? `
                    <div style="display: grid; gap: 10px;">
                        ${ownedModules.map(m => `
                            <div style="padding: 10px; background: rgba(0,0,0,0.4); border: 1px solid var(--primary); border-radius: 4px; display: flex; justify-content: space-between; align-items: center;">
                                <span>${m.name}</span>
                                <button class="btn-install-this-mod" data-mod-id="${m.id}" style="padding: 6px 12px; background: var(--primary); color: #000; font-weight: bold; border: none; border-radius: 4px; cursor: pointer;">INSTALAR</button>
                            </div>
                        `).join('')}
                    </div>
                ` : `
                    <p style="color: #aaa;">No tienes módulos disponibles en tu inventario de carga.</p>
                `}
            </div>
        `;
        this.uiManager.createModal('INSTALAR MÓDULO', content);
    }

    showCrewDetail(crewId) {
        const crew = this.game.state.ship.crew.find(c => c.id === crewId);
        if (!crew) return;

        const content = `
            <div style="font-family: var(--font-tech); text-align: center;">
                <h2 style="color: var(--secondary); margin-bottom: 5px;">${crew.name}</h2>
                <p style="color: #aaa; margin-bottom: 15px;">${crew.role}</p>
                <div style="text-align: left; background: rgba(0,0,0,0.3); padding: 15px; border-radius: 6px;">
                    <p style="color: #fff;">Nivel de Ingeniería: ${crew.engineeringSkill || 1}</p>
                    <p style="color: #fff;">Estado Actual: ${crew.state}</p>
                </div>
            </div>
        `;
        this.uiManager.createModal('EXPEDIENTE DE TRIPULANTE', content);
    }

    showSystemDetail(systemId) {
        const system = this.game.state.ship.systems.find(s => s.id === systemId);
        if (system) {
            this.renderSystemConsole(system);
        }
    }
}

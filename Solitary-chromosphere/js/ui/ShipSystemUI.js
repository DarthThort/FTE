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

        const bonusMap = {
            'bridge': '🛡️ +15% Evasión Táctica y Pilotaje de Combate Activo',
            'weapon': '💥 Disparo Automático y +20% Recarga de Armas',
            'shield': '🛡️ +25% Velocidad de Recarga de Capas de Escudo',
            'engine': '⚡ +15% Evasión y Carga de Salto FTL Acelerada',
            'reactor': '🔋 +1 Energía Temporal de Reserva de Emergencia',
            'jumpdrive': '🌌 -30% Tiempo de Preparación de Salto FTL'
        };
        const systemBonusText = bonusMap[system.type] || '✨ +25% Efectividad de Rendimiento General';

        const content = `
            <div style="text-align: center; font-family: var(--font-tech);">
                <h1 style="color: ${system.color}; margin-bottom: 5px; font-size: 1.8rem; letter-spacing: 2px;">${system.name.toUpperCase()}</h1>
                <div style="color: var(--text-dim); margin-bottom: 5px; font-size: 0.85rem;">TIPO: ${system.type.toUpperCase()} • NIVEL ACTUAL: <span style="color: var(--primary); font-weight: bold;">NIVEL ${currentLevel}</span> (${system.maxPower} Potencia Máx)</div>
                <div style="color: #ffaa00; font-weight: bold; margin-bottom: 20px; font-size: 0.85rem;">COORDENADAS DE CONSOLA: (${system.x}, ${system.y})</div>
                
                <!-- CAPTAIN / JUGADOR OPERATING CONSOLE SECTION -->
                <div style="background: rgba(0, 240, 255, 0.1); border: 1px solid var(--primary); padding: 15px; border-radius: 8px; margin-bottom: 20px; text-align: left;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                        <span style="color: var(--primary); font-weight: bold; font-size: 0.95rem;">👨‍✈️ MANDO DEL CAPITÁN / JUGADOR</span>
                        <span style="font-size: 0.8rem; color: ${isCaptainAssigned ? '#00ff55' : '#aaa'}; font-weight: bold;">${isCaptainAssigned ? 'OPERANDO ESTACIÓN' : 'INACTIVO'}</span>
                    </div>
                    <div style="color: #00f0ff; font-size: 0.85rem; font-weight: bold; margin-bottom: 10px; padding: 6px 10px; background: rgba(0,240,255,0.15); border-radius: 4px; border: 1px solid rgba(0,240,255,0.3);">
                        EFECTO DE CONSOLA: ${systemBonusText}
                    </div>
                    <p style="color: #cbd5e1; font-size: 0.8rem; margin-bottom: 12px;">
                        El Capitán (Jugador) puede atender personalmente esta consola para activar la bonificación de mando mientras permanezca físicamente en la estación.
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
        const state = this.game.state;
        const crew = state.ship.crew.find(c => c.id === crewId) || (state.port?.crew ? state.port.crew.find(c => c.id === crewId) : null);
        if (!crew) return;

        const avatarUrl = window.getCrewAvatarURL ? window.getCrewAvatarURL(crew) : '';
        const currentAssignment = state.ship.systems.find(s => s.assignedCrew?.id === crew.id);
        const primarySkill = state.getRolePrimarySkill(crew.role);
        const primaryLevel = crew.skills?.[primarySkill]?.level || 1;

        const skillNames = {
            piloting: '🚀 Pilotaje / Evasión',
            combat: '💥 Armas / Combate',
            engineering: '🔧 Ingeniería / Reparación',
            medical: '💉 Medicina / Curación',
            shields: '🛡️ Escudos / Recarga'
        };

        const content = `
            <div style="font-family: 'Orbitron', var(--font-tech, monospace); max-width: 520px; margin: 0 auto; color: #fff;">
                <!-- Header with Avatar -->
                <div style="display: flex; align-items: center; gap: 16px; background: rgba(15, 23, 42, 0.9); border: 2px solid #00f0ff; border-radius: 10px; padding: 16px; margin-bottom: 16px; box-shadow: 0 0 20px rgba(0, 240, 255, 0.2);">
                    <img src="${avatarUrl}" style="width: 70px; height: 70px; border-radius: 50%; border: 3px solid #00f0ff; background: #030712; flex-shrink: 0; box-shadow: 0 0 15px rgba(0, 240, 255, 0.5);" />
                    <div style="text-align: left; flex: 1;">
                        <h2 style="color: #00f0ff; margin: 0 0 4px 0; font-size: 1.4rem; letter-spacing: 2px;">${crew.name.toUpperCase()}</h2>
                        <div style="color: #94a3b8; font-size: 0.85rem; font-weight: bold; margin-bottom: 6px;">
                            ${crew.species || 'Humano'} • ${crew.role} (Nivel Principal: ${primaryLevel})
                        </div>
                        <div style="display: flex; gap: 12px; font-size: 0.78rem; color: #cbd5e1; flex-wrap: wrap;">
                            <span>❤️ Salud: <b style="color: #00ff55;">${crew.health || 100}/${crew.maxHealth || 100}</b></span>
                            <span>😊 Moral: <b style="color: ${crew.morale > 70 ? '#00ff55' : '#ffaa00'};">${crew.morale || 100}/100</b></span>
                            <span>⚡ Estado: <b style="color: #ffaa00;">${crew.state || 'En espera'}</b></span>
                        </div>
                    </div>
                </div>

                <!-- ASSIGNMENT CONTROL DIRECTLY IN DOSSIER -->
                <div style="background: rgba(0, 240, 255, 0.08); border: 1.5px solid #00f0ff; border-radius: 8px; padding: 14px; margin-bottom: 16px; text-align: left;">
                    <h3 style="color: #00f0ff; font-size: 0.9rem; margin-bottom: 8px; display: flex; align-items: center; gap: 8px;">
                        🎯 ASIGNAR ESTACIÓN DE TRABAJO
                    </h3>
                    <p style="color: #94a3b8; font-size: 0.78rem; margin-bottom: 10px;">
                        Estación Actual: <b style="color: ${currentAssignment ? '#00ff55' : '#ffaa00'};">${currentAssignment ? currentAssignment.name : 'En Espera / Sin Estación'}</b>
                    </p>
                    <div style="display: flex; gap: 10px;">
                        <select id="dossier-system-selector" style="flex: 1; padding: 8px; background: rgba(0,0,0,0.7); border: 1px solid #00f0ff; color: #fff; border-radius: 4px; font-family: var(--font-tech); font-size: 0.85rem;">
                            <option value="">-- Seleccionar Estación de la Nave --</option>
                            ${state.ship.systems.map(s => `
                                <option value="${s.id}" ${currentAssignment?.id === s.id ? 'selected' : ''}>${s.name} (${s.type.toUpperCase()})</option>
                            `).join('')}
                        </select>
                        <button id="btn-dossier-assign" style="padding: 8px 14px; background: #00f0ff; border: none; color: #000; font-weight: 900; border-radius: 4px; cursor: pointer; font-family: var(--font-tech); font-size: 0.85rem;">
                            ASIGNAR
                        </button>
                    </div>
                </div>

                <!-- SKILLS & EXPERIENCE XP BARS -->
                <div style="background: rgba(15, 23, 42, 0.85); border: 1px solid rgba(255,255,255,0.15); border-radius: 8px; padding: 16px; text-align: left;">
                    <h3 style="color: #ffaa00; font-size: 0.9rem; margin-bottom: 12px; border-bottom: 1px solid rgba(255,170,0,0.3); padding-bottom: 6px;">
                        📊 NIVELES DE HABILIDAD Y EXPERIENCIA (XP)
                    </h3>
                    <div style="display: flex; flex-direction: column; gap: 10px;">
                        ${Object.entries(crew.skills || {}).map(([skillKey, data]) => {
                            const label = skillNames[skillKey] || skillKey.toUpperCase();
                            const level = data.level || 1;
                            const xp = data.xp || 0;
                            const maxXP = level * 100;
                            const pct = Math.min(100, Math.round((xp / maxXP) * 100));
                            const bonusVal = Math.round(15 + level * 5);

                            return `
                                <div>
                                    <div style="display: flex; justify-content: space-between; font-size: 0.8rem; margin-bottom: 3px;">
                                        <span style="color: #e2e8f0; font-weight: bold;">${label}</span>
                                        <span style="color: #00f0ff; font-weight: bold;">Nivel ${level} (${pct}% XP) <span style="color: #00ff55; font-size: 0.72rem;">[+${bonusVal}% Bonus]</span></span>
                                    </div>
                                    <div style="width: 100%; height: 8px; background: rgba(0,0,0,0.5); border-radius: 4px; overflow: hidden; border: 1px solid rgba(255,255,255,0.1);">
                                        <div style="width: ${pct}%; height: 100%; background: linear-gradient(90deg, #00f0ff, #00ff55); box-shadow: 0 0 6px #00f0ff; transition: width 0.3s;"></div>
                                    </div>
                                </div>
                            `;
                        }).join('')}
                    </div>
                </div>
            </div>
        `;

        this.uiManager.createModal('EXPEDIENTE DE TRIPULANTE', content);

        setTimeout(() => {
            const btnAssign = document.getElementById('btn-dossier-assign');
            if (btnAssign) {
                btnAssign.onclick = () => {
                    const selector = document.getElementById('dossier-system-selector');
                    const systemId = selector.value;
                    if (!systemId) {
                        this.uiManager.hud.showNotification('Por favor, selecciona una estación de la nave', 'error');
                        return;
                    }
                    const result = state.assignCrewToSystem(crew.id, systemId);
                    this.uiManager.hud.showNotification(result.message, result.success ? 'success' : 'error');
                    if (result.success) {
                        this.showCrewDetail(crew.id);
                    }
                };
            }
        }, 50);
    }

    showSystemDetail(systemId) {
        const system = this.game.state.ship.systems.find(s => s.id === systemId);
        if (system) {
            this.renderSystemConsole(system);
        }
    }
}

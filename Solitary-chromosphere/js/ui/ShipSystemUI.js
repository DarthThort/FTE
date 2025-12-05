class ShipSystemUI {
    constructor(game, root, uiManager) {
        this.game = game;
        this.root = root;
        this.uiManager = uiManager;
    }

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
                <div style="font-family: var(--font-body); color: var(--text-dim); margin-bottom: 5px;">SYSTEM ID: ${system.id.toUpperCase()}</div>
                <div style="font-family: var(--font-body); color: #ffaa00; font-weight: bold; margin-bottom: 20px;">COORDINATES: (${system.x}, ${system.y})</div>
                
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
        this.uiManager.createModal('SYSTEM CONSOLE', content);

        // Add event listeners for crew assignment buttons
        if (assignedCrew) {
            const unassignBtn = document.getElementById('btn-unassign-system');
            if (unassignBtn) {
                unassignBtn.onclick = () => {
                    const result = this.game.state.unassignCrewFromSystem(system.id);
                    this.uiManager.hud.showNotification(result.message, result.success ? 'success' : 'error');
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
                        this.uiManager.hud.showNotification('Please select a crew member.', 'error');
                        return;
                    }
                    const result = this.game.state.assignCrewToSystem(crewId, system.id);
                    this.uiManager.hud.showNotification(result.message, result.success ? 'success' : 'error');
                    if (result.success) {
                        this.renderSystemConsole(system); // Refresh console
                    }
                };
            }
        }
    }

    renderInstallMenu(x, y) {
        // Map hardpoint coordinates to system types
        const hardpointMap = {
            '10,8': { hardpoint: 'weapon1', category: MODULE_CATEGORIES.WEAPON },
            '16,8': { hardpoint: 'weapon2', category: MODULE_CATEGORIES.WEAPON },
            '16,8': { hardpoint: 'shield', category: MODULE_CATEGORIES.SHIELD },
            '13,19': { hardpoint: 'engine', category: MODULE_CATEGORIES.ENGINE },
            '14,13': { hardpoint: 'jumpDrive', category: MODULE_CATEGORIES.JUMP_DRIVE },
            '12,13': { hardpoint: 'reactor', category: MODULE_CATEGORIES.REACTOR },
            '13,5': { hardpoint: 'bridge', category: MODULE_CATEGORIES.BRIDGE }
        };

        const hardpointKey = `${x},${y}`;
        const hardpointInfo = hardpointMap[hardpointKey];

        if (!hardpointInfo) {
            console.warn(`[ShipSystemUI] No hardpoint mapping for (${x},${y})`);
            return;
        }

        // Get owned modules that match this hardpoint's category
        const compatibleModules = this.game.state.ownedModules
            .map(id => getModule(id))
            .filter(m => m && m.category === hardpointInfo.category);

        // Check if something is already installed here
        const currentModuleId = this.game.state.ship.hardpoints[hardpointInfo.hardpoint];
        const currentModule = currentModuleId ? getModule(currentModuleId) : null;

        const content = `
            <div style="text-align: center;">
                <p style="color: var(--text-dim); margin-bottom: 20px;">
                    ${currentModule ? `Currently installed: <span style="color: var(--primary);">${currentModule.name}</span>` : 'No module installed'}
                </p>
                
                ${currentModule ? `
                    <button id="btn-unequip" style="width: 100%; padding: 12px; margin-bottom: 20px; background: var(--danger); border-color: var(--danger);">
                        UNEQUIP ${currentModule.name}
                    </button>
                ` : ''}
                
                <p style="color: var(--text-dim); margin-bottom: 10px; font-size: 0.9rem;">
                    Available ${hardpointInfo.category} modules:
                </p>
                
                <div style="max-height: 300px; overflow-y: auto; margin-bottom: 20px; border: 1px solid #333; padding: 10px;">
                    ${compatibleModules.length > 0 ? compatibleModules.map(module => `
                        <div style="display: flex; justify-content: space-between; align-items: center; padding: 10px; border-bottom: 1px solid #333; background: rgba(0,240,255,0.05);">
                            <div style="text-align: left;">
                                <div style="color: var(--primary); font-weight: bold;">${module.name}</div>
                                <div style="color: #888; font-size: 0.8rem;">Tier ${module.tier}</div>
                            </div>
                            <button id="btn-install-${module.id}" style="font-size: 0.8rem; padding: 6px 16px;" 
                                onclick="game.shipSystemUI.installModuleToHardpoint('${hardpointInfo.hardpoint}', '${module.id}')">
                                INSTALL
                            </button>
                        </div>
                    `).join('') : '<p style="padding: 20px; color: #888;">No compatible modules available.</p>'}
                </div>
            </div>
        `;

        this.uiManager.createModal('INSTALL MODULE', content);

        // Add unequip button handler if there's a current module
        if (currentModule) {
            setTimeout(() => {
                const unequipBtn = document.getElementById('btn-unequip');
                if (unequipBtn) {
                    unequipBtn.onclick = () => {
                        const result = this.game.state.unequipModule(hardpointInfo.hardpoint);
                        this.uiManager.hud.showNotification(result.message, result.success ? 'success' : 'error');
                        if (result.success) {
                            document.querySelector('.modal-overlay').remove();
                        }
                    };
                }
            }, 100);
        }
    }

    installModuleToHardpoint(hardpoint, moduleId) {
        const result = this.game.state.installModule(hardpoint, moduleId);
        this.uiManager.hud.showNotification(result.message, result.success ? 'success' : 'error');
        if (result.success) {
            document.querySelector('.modal-overlay').remove();
        }
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
                            <p style="color: var(--text-dim); font-size: 0.85rem; margin-bottom: 10px;">Currently idle. Assign to a system:</p>
                            <select id="system-selector" style="width: 100%; padding: 8px; background: rgba(0,0,0,0.5); border: 1px solid rgba(255,255,255,0.2); color: #fff; margin-bottom: 10px;">
                                <option value="">-- Select System --</option>
                                ${availableSystems.map(s => `<option value="${s.id}">${s.name}</option>`).join('')}
                            </select>
                            <button id="btn-assign-crew" style="width: 100%; padding: 8px;">ASSIGN TO SYSTEM</button>
                        </div>`
            }
                </div>
            </div>
        `;

        this.uiManager.createModal('CREW DETAILS', content);

        // Add event listeners
        if (assignment) {
            const unassignBtn = document.getElementById('btn-unassign-crew');
            if (unassignBtn) {
                unassignBtn.onclick = () => {
                    const result = this.game.state.unassignCrewFromSystem(assignment.id);
                    this.uiManager.hud.showNotification(result.message, result.success ? 'success' : 'error');
                    if (result.success) {
                        this.showCrewDetail(crewId); // Refresh
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
                        this.uiManager.hud.showNotification('Please select a system.', 'error');
                        return;
                    }
                    const result = this.game.state.assignCrewToSystem(crewId, systemId);
                    this.uiManager.hud.showNotification(result.message, result.success ? 'success' : 'error');
                    if (result.success) {
                        this.showCrewDetail(crewId); // Refresh
                    }
                };
            }
        }
    }
}

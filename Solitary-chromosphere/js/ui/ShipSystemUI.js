class ShipSystemUI {
    constructor(game, root, uiManager) {
        this.game = game;
        this.root = root;
        this.uiManager = uiManager;
    }

    renderSystemConsole(system) {
        // Map system type to hardpoint key
        const systemToHardpoint = {
            'bridge': 'bridge',
            'shield': 'shield',
            'engine': 'engine',
            'jumpdrive': 'jumpDrive',
            'reactor': 'reactor',
            'weapon': system.id === 'weapons1' ? 'weapon1' : 'weapon2'
        };

        const hardpointKey = systemToHardpoint[system.type];
        const installedModuleId = hardpointKey ? this.game.state.ship.hardpoints[hardpointKey] : null;
        const installedModule = installedModuleId ? getModule(installedModuleId) : null;

        // Get crew info
        const assignedCrew = system.assignedCrew;
        const availableCrew = this.game.state.ship.crew.filter(c => {
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
                
                <!-- INSTALLED MODULE INFO -->
                ${installedModule ? `
                    <div style="background: linear-gradient(135deg, rgba(0,240,255,0.15), rgba(0,240,255,0.05)); border: 2px solid var(--primary); border-radius: 8px; padding: 20px; margin-bottom: 20px;">
                        <div style="color: var(--primary); font-size: 1.3rem; font-weight: bold; margin-bottom: 8px;">
                            ${installedModule.name}
                        </div>
                        <div style="color: #888; font-size: 0.9rem; margin-bottom: 15px;">
                            Tier ${installedModule.tier} ${installedModule.category}
                        </div>
                        ${installedModule.description ? `
                            <div style="color: var(--text-dim); font-size: 0.85rem; line-height: 1.5; margin-bottom: 15px; padding: 10px; background: rgba(0,0,0,0.3); border-radius: 4px;">
                                ${installedModule.description}
                            </div>
                        ` : ''}
                        <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px; text-align: left; font-size: 0.85rem;">
                            ${installedModule.damage ? `<div style="padding: 5px; background: rgba(255,0,85,0.1); border-radius: 3px;">⚔️ <span style="color: var(--danger)">${installedModule.damage}</span> damage</div>` : ''}
                            ${installedModule.shots ? `<div style="padding: 5px; background: rgba(0,240,255,0.1); border-radius: 3px;">🎯 <span style="color: var(--primary)">${installedModule.shots}</span> shots</div>` : ''}
                            ${installedModule.cooldown ? `<div style="padding: 5px; background: rgba(255,170,0,0.1); border-radius: 3px;">⏱️ <span style="color: var(--warning)">${installedModule.cooldown}s</span> cooldown</div>` : ''}
                            ${installedModule.shieldLayers ? `<div style="padding: 5px; background: rgba(0,255,85,0.1); border-radius: 3px;">🛡️ <span style="color: var(--success)">${installedModule.shieldLayers}</span> layers</div>` : ''}
                            ${installedModule.shieldRechargeRate ? `<div style="padding: 5px; background: rgba(0,255,85,0.1); border-radius: 3px;">⚡ <span style="color: var(--success)">${installedModule.shieldRechargeRate}s</span> recharge</div>` : ''}
                            ${installedModule.evasion ? `<div style="padding: 5px; background: rgba(0,240,255,0.1); border-radius: 3px;">💨 <span style="color: var(--primary)">+${installedModule.evasion}%</span> evasion</div>` : ''}
                            ${installedModule.speed ? `<div style="padding: 5px; background: rgba(0,240,255,0.1); border-radius: 3px;">🚀 <span style="color: var(--primary)">+${installedModule.speed}%</span> speed</div>` : ''}
                            ${installedModule.jumpRange ? `<div style="padding: 5px; background: rgba(255,0,255,0.1); border-radius: 3px;">🌌 <span style="color: #ff00ff">${installedModule.jumpRange}</span> LY range</div>` : ''}
                            ${installedModule.power ? `<div style="padding: 5px; background: rgba(255,170,0,0.1); border-radius: 3px;">⚡ <span style="color: var(--warning)">${installedModule.power}</span> power</div>` : ''}
                            ${installedModule.dialogueBonus ? `<div style="padding: 5px; background: rgba(0,240,255,0.1); border-radius: 3px;">💬 <span style="color: var(--primary)">+${installedModule.dialogueBonus}</span> dialogue</div>` : ''}
                        </div>
                    </div>
                ` : `
                    <div style="background: rgba(255,255,255,0.03); border: 2px dashed #444; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
                        <div style="color: #666; font-size: 1.1rem; font-weight: bold; margin-bottom: 8px;">⚠️ NO MODULE INSTALLED</div>
                        <div style="color: #555; font-size: 0.9rem;">This system requires a module to function</div>
                    </div>
                `}

                <!-- SYSTEM INTEGRITY -->
                <div style="margin-bottom: 20px;">
                    <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
                        <span style="color: var(--text-dim);">SYSTEM INTEGRITY</span>
                        <span style="color: ${system.health === system.maxHealth ? 'var(--success)' : 'var(--warning)'};">${Math.round((system.health / system.maxHealth) * 100)}%</span>
                    </div>
                    <div style="background: rgba(255,255,255,0.1); height: 12px; border-radius: 6px; overflow: hidden;">
                        <div style="background: linear-gradient(90deg, ${system.color}, ${system.color}88); height: 100%; width: ${(system.health / system.maxHealth) * 100}%; transition: width 0.3s;"></div>
                    </div>
                </div>

                <!-- CREW ASSIGNMENT -->
                ${assignedCrew ? `
                    <div style="background: rgba(0,255,100,0.1); border: 1px solid var(--success); padding: 15px; border-radius: 6px; margin-bottom: 20px;">
                        <h3 style="color: var(--success); font-size: 0.9rem; margin-bottom: 10px;">✓ CREW ASSIGNED</h3>
                        <div style="background: rgba(0,0,0,0.3); padding: 10px; border-radius: 4px; margin-bottom: 10px;">
                            <h4 style="color: var(--secondary); margin-bottom: 5px;">${assignedCrew.name}</h4>
                            <p style="font-size: 0.85rem; color: #aaa;">${assignedCrew.role} • Lvl ${assignedCrew.skills[this.game.state.getRolePrimarySkill(assignedCrew.role)]?.level || 1}</p>
                        </div>
                        <button id="btn-unassign-crew" style="width: 100%; padding: 8px; background: rgba(255,0,0,0.2); border-color: var(--danger); color: var(--danger);">
                            UNASSIGN CREW
                        </button>
                    </div>
                ` : `
                    <div style="background: rgba(255,200,0,0.1); border: 1px solid var(--warning); padding: 15px; border-radius: 6px; margin-bottom: 20px;">
                        <h3 style="color: var(--warning); font-size: 0.9rem; margin-bottom: 10px;">⚠ NO CREW ASSIGNED</h3>
                        <p style="color: var(--text-dim); font-size: 0.85rem; margin-bottom: 10px;">Assign a crew member for performance boost:</p>
                        <select id="crew-selector" style="width: 100%; padding: 8px; background: rgba(0,0,0,0.5); border: 1px solid rgba(255,255,255,0.2); color: #fff; margin-bottom: 10px; border-radius: 4px;">
                            <option value="">-- Select Crew Member --</option>
                            ${availableCrew.map(c => {
            const primarySkill = this.game.state.getRolePrimarySkill(c.role);
            const level = c.skills[primarySkill]?.level || 1;
            return `<option value="${c.id}">${c.name} (${c.role}, Lvl ${level})</option>`;
        }).join('')}
                        </select>
                        <button id="btn-assign-crew" style="width: 100%; padding: 8px;">ASSIGN TO STATION</button>
                    </div>
                `}

                <!-- CONTROL BUTTONS -->
                <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; margin-bottom: 15px;">
                    <button id="btn-diagnostics" style="padding: 12px; background: rgba(0,240,255,0.2); border-color: var(--primary);">
                        📊 DIAGNOSTICS
                    </button>
                    <button id="btn-power" style="padding: 12px; ${system.currentPower > 0 ? 'background: rgba(0,255,100,0.2); border-color: var(--success);' : 'background: rgba(100,100,100,0.2); border-color: #666;'}">
                        ⚡ POWER: ${system.currentPower > 0 ? 'ON' : 'OFF'}
                    </button>
                </div>

                <!-- MODULE MANAGEMENT BUTTONS -->
                <div style="display: grid; grid-template-columns: ${installedModule ? 'repeat(2, 1fr)' : '1fr'}; gap: 10px;">
                    ${installedModule ? `
                        <button id="btn-upgrade" style="padding: 12px; background: rgba(255,170,0,0.2); border-color: var(--warning); color: var(--warning);">
                            🔧 UPGRADE
                        </button>
                        <button id="btn-uninstall-module" style="padding: 12px; background: rgba(255,0,0,0.2); border-color: var(--danger); color: var(--danger);">
                            ❌ UNINSTALL
                        </button>
                    ` : `
                        <button id="btn-install-module" style="padding: 12px; background: rgba(0,255,100,0.2); border-color: var(--success); color: var(--success);">
                            ➕ INSTALL MODULE
                        </button>
                    `}
                </div>
            </div>
        `;

        this.uiManager.createModal('SYSTEM CONSOLE', content);

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
            // Crew assignment
            const btnAssignCrew = document.getElementById('btn-assign-crew');
            if (btnAssignCrew) {
                btnAssignCrew.onclick = () => {
                    const selector = document.getElementById('crew-selector');
                    const crewId = parseInt(selector.value);
                    if (!crewId) {
                        this.uiManager.hud.showNotification('Please select a crew member', 'error');
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

            // Module management
            const btnUpgrade = document.getElementById('btn-upgrade');
            if (btnUpgrade && hardpointKey && installedModule) {
                btnUpgrade.onclick = () => {
                    const scrapCost = installedModule.scrapCost || 0;
                    const upgradeTo = installedModule.upgradeTo;

                    if (!upgradeTo) {
                        this.uiManager.hud.showNotification('This module is already at max tier', 'error');
                        return;
                    }

                    const upgradeModule = getModule(upgradeTo);
                    if (!upgradeModule) {
                        this.uiManager.hud.showNotification('Upgrade not available', 'error');
                        return;
                    }

                    if (this.game.state.scrap < scrapCost) {
                        this.uiManager.hud.showNotification(`Need ${scrapCost} scrap (you have ${this.game.state.scrap})`, 'error');
                        return;
                    }

                    if (confirm(`Upgrade ${installedModule.name} to ${upgradeModule.name} for ${scrapCost} scrap?`)) {
                        const result = this.game.state.upgradeModule(hardpointKey);
                        this.uiManager.hud.showNotification(result.message, result.success ? 'success' : 'error');
                        if (result.success) {
                            this.renderSystemConsole(system);
                        }
                    }
                };
            }

            const btnUninstallModule = document.getElementById('btn-uninstall-module');
            if (btnUninstallModule && hardpointKey) {
                btnUninstallModule.onclick = () => {
                    const result = this.game.state.unequipModule(hardpointKey);
                    this.uiManager.hud.showNotification(result.message, result.success ? 'success' : 'error');
                    if (result.success) {
                        // Refresh shield UI if shield module was uninstalled
                        if (hardpointKey === 'shield' && this.uiManager.shieldUI) {
                            this.uiManager.shieldUI.refreshShieldPanel();
                        }
                        // Refresh weapon UI if weapon module was uninstalled
                        if ((hardpointKey === 'weapon1' || hardpointKey === 'weapon2') && this.uiManager.weaponUI) {
                            this.uiManager.weaponUI.refreshWeaponsPanel();
                        }
                        this.renderSystemConsole(system);
                    }
                };
            }

            const btnInstallModule = document.getElementById('btn-install-module');
            if (btnInstallModule && hardpointKey) {
                btnInstallModule.onclick = () => {
                    document.querySelector('.modal-overlay').remove();
                    this.renderInstallMenu(system.x, system.y);
                };
            }
        }, 100);
    }

    renderInstallMenu(x, y) {
        // Map hardpoint coordinates to system types
        const hardpointMap = {
            '9,8': { hardpoint: 'weapon1', category: MODULE_CATEGORIES.WEAPON },
            '17,8': { hardpoint: 'weapon2', category: MODULE_CATEGORIES.WEAPON },
            '14,6': { hardpoint: 'shield', category: MODULE_CATEGORIES.SHIELD },
            '13,19': { hardpoint: 'engine', category: MODULE_CATEGORIES.ENGINE },
            '14,11': { hardpoint: 'jumpDrive', category: MODULE_CATEGORIES.JUMP_DRIVE },
            '12,11': { hardpoint: 'reactor', category: MODULE_CATEGORIES.REACTOR },
            '13,4': { hardpoint: 'bridge', category: MODULE_CATEGORIES.BRIDGE }
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
                            <button id="btn-install-${module.id}" style="font-size: 0.8rem; padding: 6px 16px;">
                                INSTALL
                            </button>
                        </div>
                    `).join('') : '<p style="padding: 20px; color: #888;">No compatible modules available.</p>'}
                </div>
            </div>
        `;

        this.uiManager.createModal('INSTALL MODULE', content);

        // Close on click outside
        const modalOverlay1 = document.querySelector('.modal-overlay');
        if (modalOverlay1) {
            modalOverlay1.addEventListener('click', (e) => {
                if (e.target === modalOverlay1) {
                    modalOverlay1.remove();
                }
            });
        }

        // Add event listeners after modal is created
        setTimeout(() => {
            // Add install button handlers
            compatibleModules.forEach(module => {
                const btn = document.getElementById(`btn-install-${module.id}`);
                if (btn) {
                    btn.onclick = () => this.installModuleToHardpoint(hardpointInfo.hardpoint, module.id);
                }
            });

            // Add unequip button handler if there's a current module
            if (currentModule) {
                const unequipBtn = document.getElementById('btn-unequip');
                if (unequipBtn) {
                    unequipBtn.onclick = () => {
                        const result = this.game.state.unequipModule(hardpointInfo.hardpoint);
                        this.uiManager.hud.showNotification(result.message, result.success ? 'success' : 'error');
                        if (result.success) {
                            // Refresh shield UI if shield module was uninstalled
                            if (hardpointInfo.hardpoint === 'shield' && this.uiManager.shieldUI) {
                                this.uiManager.shieldUI.refreshShieldPanel();
                            }
                            // Refresh weapon UI if weapon module was uninstalled
                            if ((hardpointInfo.hardpoint === 'weapon1' || hardpointInfo.hardpoint === 'weapon2') && this.uiManager.weaponUI) {
                                this.uiManager.weaponUI.refreshWeaponsPanel();
                            }
                            document.querySelector('.modal-overlay').remove();
                        }
                    };
                }
            }
        }, 100);
    }

    installModuleToHardpoint(hardpoint, moduleId) {
        const result = this.game.state.installModule(hardpoint, moduleId);
        this.uiManager.hud.showNotification(result.message, result.success ? 'success' : 'error');
        if (result.success) {
            // Refresh shield UI if shield module was installed
            if (hardpoint === 'shield' && this.uiManager.shieldUI) {
                this.uiManager.shieldUI.refreshShieldPanel();
            }
            // Refresh weapon UI if weapon module was installed
            if ((hardpoint === 'weapon1' || hardpoint === 'weapon2') && this.uiManager.weaponUI) {
                this.uiManager.weaponUI.refreshWeaponsPanel();
            }
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

        // Close on click outside
        const modalOverlay2 = document.querySelector('.modal-overlay');
        if (modalOverlay2) {
            modalOverlay2.addEventListener('click', (e) => {
                if (e.target === modalOverlay2) {
                    modalOverlay2.remove();
                }
            });
        }

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

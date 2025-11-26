class UIManager {
    constructor(rootElement, gameEngine) {
        this.root = rootElement;
        this.game = gameEngine;
        this.uiLayer = rootElement; // Alias for clarity
		this.hud = new HUD(gameEngine, rootElement);
		this.animationUI = new AnimationUI(gameEngine, rootElement);
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
        const state = this.game.state;
        const currentSystem = state.currentSystem;

        const content = `
            <div style="position: relative; width: 100%; height: 500px; background: rgba(0, 10, 20, 0.9); border: 1px solid var(--primary); border-radius: 4px; overflow: hidden;">
                <div style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: repeating-linear-gradient(0deg, transparent, transparent 1px, rgba(0, 255, 255, 0.05) 2px); pointer-events: none;"></div>
                <div style="position: absolute; top: 20px; left: 20px; color: var(--primary); font-family: var(--font-tech); pointer-events: none;">
                    <h2>GALAXY MAP</h2>
                    <p>Current System: ${currentSystem.name}</p>
                    <p>Jump Range: ${state.ship.jumpRange} LY</p>
                    <p style="font-size: 0.75rem; color: #aaa; margin-top: 5px;">💡 Drag to pan the map</p>
                </div>
                
                <div id="galaxy-grid" style="position: absolute; top: 50%; left: 50%; width: 2000px; height: 2000px; transform: translate(-50%, -50%); pointer-events: auto;">
                    ${state.galaxy.map(sys => {
            const relX = (sys.x - currentSystem.x) * 40 + 1000; // Center at 1000,1000
            const relY = (sys.y - currentSystem.y) * 40 + 1000;
            const dist = Math.sqrt(Math.pow(sys.x - currentSystem.x, 2) + Math.pow(sys.y - currentSystem.y, 2));
            const inRange = dist <= state.ship.jumpRange;
            const isCurrent = sys.id === currentSystem.id;

            return `
                            <div class="star-system" 
                                 data-system-id="${sys.id}"
                                 style="position: absolute; left: ${relX}px; top: ${relY}px; transform: translate(-50%, -50%); cursor: pointer; text-align: center; z-index: 10; pointer-events: auto;">
                                <div style="width: ${isCurrent ? 20 : 12}px; height: ${isCurrent ? 20 : 12}px; background: ${sys.color}; border-radius: 50%; box-shadow: 0 0 ${isCurrent ? 20 : 10}px ${sys.color}; margin: 0 auto; border: ${isCurrent ? '2px solid #fff' : 'none'};"></div>
                                <div style="color: ${inRange ? '#fff' : '#666'}; font-size: 0.7rem; margin-top: 5px; white-space: nowrap; text-shadow: 0 0 2px #000;">${sys.name}</div>
                                ${!isCurrent ? `<div style="color: #aaa; font-size: 0.6rem;">${dist.toFixed(1)} LY</div>` : ''}
                            </div>
                        `;
        }).join('')}
                </div>
            </div>
            <div id="system-info-panel" style="margin-top: 15px; padding: 15px; background: rgba(0,0,0,0.5); border: 1px solid rgba(255,255,255,0.1); min-height: 100px;">
                <p style="color: #aaa; font-style: italic;">Select a system to view details.</p>
            </div>
        `;

        this.createModal('NAVIGATION', content);

        // Add event listeners to stars
        setTimeout(() => {
            const stars = document.querySelectorAll('.star-system');
            const infoPanel = document.getElementById('system-info-panel');
            const mapContainer = document.querySelector('.modal-content');
            const grid = document.getElementById('galaxy-grid');

            // Panning Logic
            let isDragging = false;
            let startX, startY;
            let currentX = 0;
            let currentY = 0;

            mapContainer.addEventListener('mousedown', (e) => {
                // Only start drag if not clicking on a star
                if (e.target.closest('.star-system')) return;
                isDragging = true;
                startX = e.clientX - currentX;
                startY = e.clientY - currentY;
                mapContainer.style.cursor = 'grabbing';
                e.preventDefault();
            });

            document.addEventListener('mousemove', (e) => {
                if (!isDragging) return;
                e.preventDefault();
                currentX = e.clientX - startX;
                currentY = e.clientY - startY;
                grid.style.transform = `translate(calc(-50% + ${currentX}px), calc(-50% + ${currentY}px))`;
            });

            document.addEventListener('mouseup', () => {
                if (isDragging) {
                    isDragging = false;
                    mapContainer.style.cursor = 'default';
                }
            });

            stars.forEach(star => {
                star.onclick = () => {
                    const sysId = star.dataset.systemId;
                    const sys = state.galaxy.find(s => s.id == sysId); // Loose equality for string/number ids
                    if (!sys) return;

                    const dist = Math.sqrt(Math.pow(sys.x - currentSystem.x, 2) + Math.pow(sys.y - currentSystem.y, 2));
                    const inRange = dist <= state.ship.jumpRange;
                    const isCurrent = sys.id === currentSystem.id;

                    infoPanel.innerHTML = `
                        <h3 style="color: ${sys.color}; margin-bottom: 5px;">${sys.name}</h3>
                        <p style="color: #ccc; font-size: 0.9rem;">Type: ${sys.type}</p>
                        <p style="color: #ccc; font-size: 0.9rem;">Distance: ${dist.toFixed(1)} Light Years</p>
                        <p style="color: #ccc; font-size: 0.9rem;">Planets: ${sys.planets ? sys.planets.length : 'Unknown'}</p>
                        <div style="margin-top: 15px; display: flex; gap: 10px;">
                            ${isCurrent ?
                            `<button onclick="game.ui.renderSystemMap()">VIEW SYSTEM MAP</button>` :
                            `<button ${inRange ? '' : 'disabled style="opacity: 0.5; cursor: not-allowed;"'} id="btn-jump">INITIATE JUMP</button>`
                        }
                        </div>
                    `;

                    const btnJump = document.getElementById('btn-jump');
                    if (btnJump) {
                        btnJump.onclick = () => {
                            // Execute jump immediately without confirm dialog
                            const result = state.travelToSystem(sys.id);
                            if (result.success) {
                                document.querySelector('.modal-overlay').remove();
                                this.showTravelAnimation('WARP', () => {
                                    this.showNotification(result.message, 'success');
                                    this.renderSystemMap(); // Show system map on arrival
                                });
                            } else {
                                this.showNotification(result.message, 'error');
                            }
                        };
                    }
                };
            });
        }, 100);
    }

    renderSystemMap() {
        const state = this.game.state;
        const system = state.currentSystem;

        const content = `
            <div style="position: relative; width: 100%; height: 500px; background: radial-gradient(circle at center, #001020 0%, #000000 100%); border: 1px solid var(--primary); border-radius: 4px; overflow: hidden;">
                <div style="position: absolute; top: 20px; left: 20px; color: var(--primary); font-family: var(--font-tech); z-index: 10; pointer-events: none;">
                    <h2>${system.name.toUpperCase()} SYSTEM</h2>
                    <p>Fuel: ${state.ship.fuel}/${state.ship.maxFuel}</p>
                    <p style="font-size: 0.75rem; color: #aaa; margin-top: 5px;">💡 Drag to pan the map</p>
                </div>

                <!-- Planetary System Container (for panning) -->
                <div id="planetary-system-container" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%;">
                    <!-- Central Star -->
                    <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 60px; height: 60px; background: ${system.color}; border-radius: 50%; box-shadow: 0 0 50px ${system.color}; z-index: 5;"></div>

                    <!-- Planets -->
                    ${system.planets.map((planet, index) => {
            const orbitRadius = 60 + (index + 1) * 40;
            const isCurrent = state.currentPlanet && state.currentPlanet.id === planet.id;

            // Calculate orbital period: closer planets move faster (Kepler's third law approximation)
            // Base period scaled by orbital radius - larger radius = slower orbit
            const basePeriod = 20; // seconds for innermost planet
            const period = basePeriod * Math.pow(orbitRadius / 100, 1.5); // ~Kepler's 3rd law
            const animationName = `orbit-${planet.id}`;

            // Random starting position: use negative delay to start animation at different point
            const randomStart = -Math.random() * period;

            return `
                        <!-- Orbit ring -->
                        <div class="planet-orbit" style="position: absolute; top: 50%; left: 50%; width: ${orbitRadius * 2}px; height: ${orbitRadius * 2}px; border: 1px solid rgba(255,255,255,0.1); border-radius: 50%; transform: translate(-50%, -50%); pointer-events: none;"></div>
                        
                        <!-- Rotating orbit container -->
                        <div style="position: absolute; top: 50%; left: 50%; width: ${orbitRadius * 2}px; height: ${orbitRadius * 2}px; transform: translate(-50%, -50%); animation: ${animationName} ${period}s linear infinite; animation-delay: ${randomStart}s; pointer-events: none;">
                            <!-- Planet positioned at orbit edge -->
                            <div class="planet-node" 
                                 data-planet-id="${planet.id}"
                                 style="position: absolute; top: 50%; left: 100%; width: ${isCurrent ? 24 : 16}px; height: ${isCurrent ? 24 : 16}px; background: ${planet.color}; border-radius: 50%; transform: translate(-50%, -50%); cursor: pointer; z-index: 6; border: ${isCurrent ? '2px solid #fff' : '1px solid rgba(0,0,0,0.5)'}; box-shadow: 0 0 10px rgba(0,0,0,0.5); pointer-events: auto;">
                                 ${planet.hasStation ? '<div style="position: absolute; top: -10px; left: 50%; transform: translateX(-50%); font-size: 10px;">🏠</div>' : ''}
                                 <div style="position: absolute; top: 20px; left: 50%; transform: translateX(-50%); color: #fff; font-size: 0.7rem; white-space: nowrap; text-shadow: 0 0 2px #000;">${planet.name}</div>
                            </div>
                        </div>
                        
                        <!-- CSS animation for this orbit -->
                        <style>
                            @keyframes ${animationName} {
                                from { transform: translate(-50%, -50%) rotate(0deg); }
                                to { transform: translate(-50%, -50%) rotate(360deg); }
                            }
                        </style>
                    `;
        }).join('')}
                </div>
            </div>
            <div id="planet-info-panel" style="margin-top: 15px; padding: 15px; background: rgba(0,0,0,0.5); border: 1px solid rgba(255,255,255,0.1); min-height: 80px; display: flex; justify-content: space-between; align-items: center;">
                <p style="color: #aaa; font-style: italic;">Select a planet.</p>
            </div>
            <div style="margin-top: 10px; text-align: right;">
                <button onclick="game.ui.renderGalaxyMap()">BACK TO GALAXY MAP</button>
            </div>
        `;

        this.createModal('SYSTEM MAP', content);

        setTimeout(() => {
            const planets = document.querySelectorAll('.planet-node');
            const infoPanel = document.getElementById('planet-info-panel');
            const mapContainer = document.querySelector('.modal-content');
            const planetarySystem = document.getElementById('planetary-system-container');

            // Panning Logic for System Map
            let isDragging = false;
            let startX, startY;
            let currentX = 0;
            let currentY = 0;

            mapContainer.addEventListener('mousedown', (e) => {
                // Only start drag if not clicking on a planet
                if (e.target.closest('.planet-node')) return;
                isDragging = true;
                startX = e.clientX - currentX;
                startY = e.clientY - currentY;
                mapContainer.style.cursor = 'grabbing';
                e.preventDefault();
            });

            document.addEventListener('mousemove', (e) => {
                if (!isDragging) return;
                e.preventDefault();
                currentX = e.clientX - startX;
                currentY = e.clientY - startY;
                planetarySystem.style.transform = `translate(${currentX}px, ${currentY}px)`;
            });

            document.addEventListener('mouseup', () => {
                if (isDragging) {
                    isDragging = false;
                    mapContainer.style.cursor = 'default';
                }
            });

            planets.forEach(p => {
                p.onclick = () => {
                    const pId = p.dataset.planetId;
                    const planet = system.planets.find(pl => pl.id === pId);
                    const isCurrent = state.currentPlanet && state.currentPlanet.id === planet.id;

                    infoPanel.innerHTML = `
                        <div>
                            <h3 style="color: ${planet.color}; margin-bottom: 5px;">${planet.name}</h3>
                            <p style="color: #ccc; font-size: 0.85rem;">Type: ${planet.type}</p>
                            <p style="color: #ccc; font-size: 0.85rem;">Station: ${planet.hasStation ? 'Yes' : 'No'}</p>
                        </div>
                        <div>
                            ${isCurrent ?
                            `<span style="color: var(--success); font-weight: bold;">CURRENT LOCATION</span>` :
                            `<button onclick="
                                    if(game.state.ship.fuel >= 5) {
                                        game.ui.showTravelAnimation('SUBLIGHT', () => {
                                            const res = game.state.travelToPlanet('${planet.id}');
                                            if(res.success) {
                                                game.ui.showNotification(res.message, 'success');
                                                game.ui.renderSystemMap();
                                            }
                                        });
                                    } else {
                                        alert('Insufficient Fuel!');
                                    }
                                ">TRAVEL (5 Fuel)</button>`
                        }
                            ${isCurrent && planet.hasStation ?
                            `<button style="margin-left: 10px; border-color: var(--success); color: var(--success);" onclick="document.querySelector('.modal-overlay').remove(); game.sceneManager.changeScene('PORT');">DOCK</button>` : ''
                        }
                        </div>
                    `;
                };
            });
        }, 100);
    }

	showTravelAnimation(type, callback) {
    this.animationUI.showTravelAnimation(type, callback);
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
        <button id="btn-crew">CREW ROSTER</button>
        <button id="btn-contracts">CONTRACTS</button>
        <button id="btn-market" style="border-color: var(--success); color: var(--success);">MARKET</button>
        <button id="btn-undock" style="border-color: var(--warning); color: var(--warning);">UNDOCK</button>
    </div>
`;


        this.root.appendChild(container); // Use this.root instead of this.uiLayer for consistency


        document.getElementById('btn-shipyard').onclick = () => this.renderShipyard();
        document.getElementById('btn-tavern').onclick = () => this.renderTavern();
        document.getElementById('btn-crew').onclick = () => this.renderCrewRoster();
        document.getElementById('btn-contracts').onclick = () => this.renderContracts();
        document.getElementById('btn-market').onclick = () => this.renderMarket();
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

        // Add event listeners for hire buttons
        const hireButtons = document.querySelectorAll('[data-crew-id]');
        hireButtons.forEach(btn => {
            btn.onclick = () => {
                const crewId = parseInt(btn.dataset.crewId);
                const result = this.game.state.hireCrew(crewId);
                if (result.success) {
                    this.showNotification(result.message, 'success');
                    this.renderTavern(); // Refresh tavern
                } else {
                    this.showNotification(result.message, 'error');
                }
            };
        });
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
            const primaryLevel = c.skills[primarySkill]?.level || 1;

            return `
                                <div style="background: rgba(255,255,255,0.05); padding: 15px; border: 1px solid rgba(255,255,255,0.1); cursor: pointer; transition: all 0.2s;" 
                                     data-crew-id="${c.id}"
                                     onmouseover="this.style.background='rgba(255,255,255,0.1)'"  
                                     onmouseout="this.style.background='rgba(255,255,255,0.05)'">>
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
                `}
            </div>
        `;
        this.createModal('CREW ROSTER', content);

        // Add click listeners to crew cards
        const crewCards = document.querySelectorAll('[data-crew-id]');
        crewCards.forEach(card => {
            card.onclick = () => {
                const crewId = parseInt(card.dataset.crewId);
                this.showCrewDetail(crewId);
            };
        });
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
    const state = this.game.state;
    const planet = state.currentPlanet;
    
    if (!planet || !planet.market) {
        this.showNotification('No market available at this location!', 'error');
        return;
    }
    
    const cargoUsed = state.getCargoUsed();
    const cargoCapacity = state.ship.cargo.capacity;
    
    const content = `
        <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 20px;">
            <!-- Market Column -->
            <div>
                <h3 style="color: var(--primary); margin-bottom: 15px;">COMMODITIES MARKET</h3>
                <div style="display: flex; flex-direction: column; gap: 10px;">
                    ${planet.market.commodities.map(item => {
                        const commodity = Economy.getCommodity(item.id);
                        const trend = Economy.getTrendSymbol(item.trend);
                        const trendColor = item.trend === 'up' ? '#88ff88' : item.trend === 'down' ? '#ff8888' : '#ffaa88';
                        
                        return `
                            <div style="background: rgba(255,255,255,0.05); padding: 12px; border: 1px solid rgba(255,255,255,0.1); display: flex; justify-content: space-between; align-items: center;">
                                <div style="flex: 1;">
                                    <div style="display: flex; align-items: center; gap: 10px;">
                                        <span style="font-size: 1.5rem;">${commodity.icon}</span>
                                        <div>
                                            <h4 style="color: ${commodity.color}; margin: 0;">${commodity.name}</h4>
                                            <p style="color: #888; font-size: 0.75rem; margin: 0;">${commodity.category}</p>
                                        </div>
                                    </div>
                                </div>
                                <div style="text-align: right; min-width: 120px;">
                                    <div style="color: var(--primary); font-weight: bold;">
                                        ${item.price} CR <span style="color: ${trendColor};">${trend}</span>
                                    </div>
                                    <div style="color: #888; font-size: 0.75rem;">Stock: ${item.stock}</div>
                                </div>
                                <div style="display: flex; gap: 5px; margin-left: 15px;">
                                    <input type="number" min="1" max="${Math.min(item.stock, 10)}" value="1" 
                                           id="qty-${item.id}" 
                                           style="width: 50px; padding: 5px; background: rgba(0,0,0,0.5); border: 1px solid rgba(255,255,255,0.2); color: #fff; text-align: center;">
                                    <button style="padding: 5px 15px; font-size: 0.8rem;" 
                                            onclick="game.ui.buyItem('${item.id}', ${item.price})">BUY</button>
                                </div>
                            </div>
                        `;
                    }).join('')}
                </div>
            </div>
            
            <!-- Cargo Column -->
            <div>
                <h3 style="color: var(--success); margin-bottom: 15px;">YOUR CARGO</h3>
                <div style="background: rgba(0,255,100,0.1); border: 1px solid var(--success); padding: 10px; border-radius: 4px; margin-bottom: 15px;">
                    <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
                        <span>Capacity:</span>
                        <span>${cargoUsed}/${cargoCapacity}</span>
                    </div>
                    <div style="width: 100%; height: 8px; background: #333; border-radius: 4px; overflow: hidden;">
                        <div style="width: ${(cargoUsed/cargoCapacity)*100}%; height: 100%; background: var(--success); transition: width 0.3s;"></div>
                    </div>
                </div>
                
                ${state.ship.cargo.items.length === 0 ? 
                    '<p style="color: #888; text-align: center; padding: 20px;">Empty</p>' :
                    `<div style="display: flex; flex-direction: column; gap: 8px;">
                        ${state.ship.cargo.items.map(cargoItem => {
                            const commodity = Economy.getCommodity(cargoItem.commodityId);
                            const marketItem = planet.market.commodities.find(m => m.id === cargoItem.commodityId);
                            const currentPrice = marketItem ? marketItem.price : cargoItem.boughtPrice;
                            const profit = Economy.calculateProfit(cargoItem.boughtPrice, currentPrice, cargoItem.quantity);
                            const profitColor = profit >= 0 ? 'var(--success)' : 'var(--danger)';
                            
                            return `
                                <div style="background: rgba(0,0,0,0.3); padding: 10px; border: 1px solid rgba(255,255,255,0.1); border-radius: 4px;">
                                    <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 5px;">
                                        <div>
                                            <span style="font-size: 1.2rem;">${commodity.icon}</span>
                                            <strong style="color: ${commodity.color};">${commodity.name}</strong>
                                        </div>
                                        <span style="color: #ccc;">×${cargoItem.quantity}</span>
                                    </div>
                                    <div style="font-size: 0.75rem; color: #888; margin-bottom: 5px;">
                                        Bought: ${cargoItem.boughtPrice} CR → Now: ${currentPrice} CR
                                    </div>
                                    <div style="display: flex; justify-content: space-between; align-items: center;">
                                        <span style="color: ${profitColor}; font-size: 0.75rem; font-weight: bold;">
                                            ${profit >= 0 ? '+' : ''}${profit} CR
                                        </span>
                                        <button style="padding: 4px 12px; font-size: 0.75rem; background: var(--danger); border-color: var(--danger);" 
                                                onclick="game.ui.sellItem('${cargoItem.commodityId}', ${currentPrice})">SELL ALL</button>
                                    </div>
                                </div>
                            `;
                        }).join('')}
                    </div>`
                }
            </div>
        </div>
    `;
    
    this.createModal('COMMODITIES MARKET - ' + planet.name.toUpperCase(), content);
}
buyItem(commodityId, price) {
    const qtyInput = document.getElementById(`qty-${commodityId}`);
    const quantity = parseInt(qtyInput.value) || 1;
    
    const result = this.game.state.buyCommodity(commodityId, quantity, price, this.game.state.currentPlanet.id);
    this.showNotification(result.message, result.success ? 'success' : 'error');
    
    if (result.success) {
        this.renderMarket(); // Refresh market
    }
}
sellItem(commodityId, price) {
    const cargoItem = this.game.state.ship.cargo.items.find(i => i.commodityId === commodityId);
    if (!cargoItem) return;
    
    const result = this.game.state.sellCommodity(commodityId, cargoItem.quantity, price);
    this.showNotification(result.message, result.success ? 'success' : 'error');
    
    if (result.success) {
        this.renderMarket(); // Refresh market
    }
}
	
}

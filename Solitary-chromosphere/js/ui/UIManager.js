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
                <div class="crew-panel" data-crew-id="${c.id}" style="background: rgba(0,0,0,0.4); padding: 8px; margin-bottom: 8px; cursor: pointer; border-radius: 4px; border: 1px solid rgba(255,255,255,0.1); transition: all 0.2s;" onmouseover="this.style.borderColor='var(--secondary)'" onmouseout="this.style.borderColor='rgba(255,255,255,0.1)'">
                    <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 5px;">
                        <div style="flex: 1; font-size: 0.75rem; font-weight: bold; color: var(--secondary);">${c.name.split(' ')[0]}</div>
                        <div style="font-size: 0.65rem; color: var(--primary);">Lvl ${primaryLevel}</div>
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
        element.innerHTML = `
            <h3>${state.ship.name}</h3>
            <div class="stat-row"><span>CREDITS</span> <span class="stat-value">${state.credits} CR</span></div>
            <div class="stat-row"><span>HULL</span> <span class="stat-value">${state.ship.health}%</span></div>
            <div class="stat-row"><span>FUEL</span> <span class="stat-value">${state.ship.fuel}/${state.ship.maxFuel}</span></div>
            <div class="stat-row"><span>CREW</span> <span class="stat-value">${state.ship.crew.length}/${state.ship.maxCrew}</span></div>
            ${state.ship.crew.length > 0 ? `
                <div style="margin-top: 15px; padding-top: 15px; border-top: 1px solid rgba(255,255,255,0.1);">
                    <h4 style="font-size: 0.8rem; color: var(--secondary); margin-bottom: 10px;">CREW STATUS</h4>
                    <div style="max-height: 300px; overflow-y: auto;">
                        ${crewPanelsHTML}
                    </div>
                </div>
            ` : ''}
            
            <div style="margin-top: 15px; padding-top: 15px; border-top: 1px solid rgba(255,255,255,0.1); display: flex; gap: 10px;">
                <button id="btn-nav" style="flex: 1; padding: 10px; border-color: var(--primary); color: var(--primary); font-weight: bold;">NAVIGATION</button>
                <button id="btn-dock" 
                    ${state.currentPlanet && state.currentPlanet.hasStation ? '' : 'disabled style="opacity: 0.5; cursor: not-allowed;"'}
                    style="flex: 1; padding: 10px; border-color: var(--success); color: var(--success); font-weight: bold;">
                    ${state.currentPlanet && state.currentPlanet.hasStation ? 'DOCK' : 'NO STATION'}
                </button>
            </div>
        `;

        // Add click listeners to crew panels in HUD
        setTimeout(() => {
            const crewPanels = element.querySelectorAll('.crew-panel[data-crew-id]');
            crewPanels.forEach(panel => {
                panel.onclick = () => {
                    const crewId = parseInt(panel.dataset.crewId);
                    this.showCrewDetail(crewId);
                };
            });

            const btnNav = document.getElementById('btn-nav');
            if (btnNav) {
                btnNav.onclick = () => {
                    this.renderGalaxyMap();
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
        const overlay = document.createElement('div');
        overlay.style.cssText = `
            position: fixed; top: 0; left: 0; width: 100%; height: 100%;
            background: #000; z-index: 9999; display: flex; align-items: center; justify-content: center;
            flex-direction: column; overflow: hidden;
        `;

        if (type === 'WARP') {
            // Warp effect with streaking stars
            overlay.innerHTML = `
                <canvas id="warp-canvas" width="1920" height="1080" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%;"></canvas>
                <div style="position: relative; z-index: 10; color: var(--primary); font-family: var(--font-tech); font-size: 2rem; letter-spacing: 5px; text-shadow: 0 0 20px var(--primary);">
                    INITIATING WARP JUMP...
                </div>
            `;

            document.body.appendChild(overlay);

            // Create warp effect on canvas
            const canvas = document.getElementById('warp-canvas');
            const ctx = canvas.getContext('2d');
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;

            // Create stars
            const stars = [];
            for (let i = 0; i < 200; i++) {
                stars.push({
                    x: Math.random() * canvas.width,
                    y: Math.random() * canvas.height,
                    z: Math.random() * canvas.width,
                    speed: Math.random() * 20 + 10
                });
            }

            // Animation loop
            let animationId;
            const animate = () => {
                ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
                ctx.fillRect(0, 0, canvas.width, canvas.height);

                stars.forEach(star => {
                    star.z -= star.speed;
                    if (star.z <= 0) {
                        star.z = canvas.width;
                        star.x = Math.random() * canvas.width;
                        star.y = Math.random() * canvas.height;
                    }

                    const k = 128 / star.z;
                    const px = (star.x - canvas.width / 2) * k + canvas.width / 2;
                    const py = (star.y - canvas.height / 2) * k + canvas.height / 2;

                    const size = (1 - star.z / canvas.width) * 3;
                    const opacity = 1 - star.z / canvas.width;

                    ctx.fillStyle = `rgba(0, 240, 255, ${opacity})`;
                    ctx.fillRect(px, py, size, size);
                });

                animationId = requestAnimationFrame(animate);
            };
            animate();

            setTimeout(() => {
                cancelAnimationFrame(animationId);
                overlay.remove();
                if (callback) callback();
            }, 3000);

} else if (type === 'SUBLIGHT') {
    // Sublight effect with ship visible and planets/moons passing by
    overlay.innerHTML = `
        <canvas id="sublight-canvas" width="1920" height="1080" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%;"></canvas>
        <div style="position: absolute; top: 30px; left: 50%; transform: translateX(-50%); z-index: 10; color: var(--warning); font-family: var(--font-tech); font-size: 1.2rem; letter-spacing: 3px; text-shadow: 0 0 10px var(--warning); opacity: 0.7;">
            TRAVELLING...
        </div>
    `;
    
    document.body.appendChild(overlay);
    
    // Create planetary travel scene
    const canvas = document.getElementById('sublight-canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    // Create planets and moons
    const celestialBodies = [];
    const colors = ['#ff8844', '#4488ff', '#88ff44', '#ff4488', '#ffaa44', '#aaaaaa', '#8844ff'];
    for (let i = 0; i < 8; i++) {
        celestialBodies.push({
            x: Math.random() * canvas.width * 2 - canvas.width,
            y: Math.random() * canvas.height,
            size: Math.random() * 60 + 20,
            speedX: Math.random() * 3 + 2,
            color: colors[Math.floor(Math.random() * colors.length)],
            isMoon: Math.random() > 0.6
        });
    }
    
    // Add background stars
    const stars = [];
    for (let i = 0; i < 100; i++) {
        stars.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            size: Math.random() * 2 + 0.5,
            speedX: Math.random() * 1 + 0.5
        });
    }
    
    // Animation loop
    let animationId;
    const animate = () => {
        // Clear with space background
        ctx.fillStyle = 'rgba(0, 0, 10, 0.3)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Draw moving stars
        stars.forEach(star => {
            star.x += star.speedX;
            if (star.x > canvas.width) {
                star.x = -10;
                star.y = Math.random() * canvas.height;
            }
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(star.x, star.y, star.size, star.size);
        });
        
        // Draw planets/moons
        celestialBodies.forEach(body => {
            body.x += body.speedX;
            if (body.x > canvas.width + 100) {
                body.x = -100;
                body.y = Math.random() * canvas.height;
            }
            
            // Planet with glow
            ctx.shadowBlur = 20;
            ctx.shadowColor = body.color;
            ctx.fillStyle = body.color;
            ctx.beginPath();
            ctx.arc(body.x, body.y, body.size, 0, Math.PI * 2);
            ctx.fill();
            ctx.shadowBlur = 0;
            
            // Craters for moons
            if (body.isMoon) {
                ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
                for (let i = 0; i < 3; i++) {
                    const craterX = body.x + (Math.random() - 0.5) * body.size;
                    const craterY = body.y + (Math.random() - 0.5) * body.size;
                    const craterSize = Math.random() * body.size * 0.2 + 2;
                    ctx.beginPath();
                    ctx.arc(craterX, craterY, craterSize, 0, Math.PI * 2);
                    ctx.fill();
                }
            }
        });
        
        // Draw player ship in center
        const shipX = canvas.width / 2;
        const shipY = canvas.height / 2;
        const shipSize = 40;
        
        ctx.save();
        ctx.translate(shipX, shipY);
        
        // Ship body (triangle)
        ctx.fillStyle = '#00f0ff';
        ctx.shadowBlur = 20;
        ctx.shadowColor = '#00f0ff';
        ctx.beginPath();
        ctx.moveTo(shipSize, 0);
        ctx.lineTo(-shipSize / 2, -shipSize / 2);
        ctx.lineTo(-shipSize / 2, shipSize / 2);
        ctx.closePath();
        ctx.fill();
        
        // Engine glow
        ctx.fillStyle = '#ff8800';
        ctx.shadowColor = '#ff8800';
        ctx.beginPath();
        ctx.arc(-shipSize / 2, 0, shipSize / 4, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.shadowBlur = 0;
        ctx.restore();
        
        animationId = requestAnimationFrame(animate);
    };
    animate();
    
    setTimeout(() => {
        cancelAnimationFrame(animationId);
        overlay.remove();
        if (callback) callback();
    }, 5000);
 
        } else {
            // Fallback
            overlay.innerHTML = `<div style="color: #fff; font-family: var(--font-tech); font-size: 2rem;">TRAVELLING...</div>`;
            document.body.appendChild(overlay);
            setTimeout(() => {
                overlay.remove();
                if (callback) callback();
            }, 3000);
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
                <button id="btn-crew">CREW ROSTER</button>
                <button id="btn-contracts">CONTRACTS</button>
                <button id="btn-undock" style="border-color: var(--warning); color: var(--warning);">UNDOCK</button>
            </div>
        `;


        this.root.appendChild(container); // Use this.root instead of this.uiLayer for consistency


        document.getElementById('btn-shipyard').onclick = () => this.renderShipyard();
        document.getElementById('btn-tavern').onclick = () => this.renderTavern();
        document.getElementById('btn-crew').onclick = () => this.renderCrewRoster();
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
}

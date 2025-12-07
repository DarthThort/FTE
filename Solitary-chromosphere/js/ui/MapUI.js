class MapUI {
    constructor(game, root, uiManager) {
        this.game = game;
        this.root = root;
        this.uiManager = uiManager; // Need access to createModal
    }

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

            // Threat level indicator
            const threatLevel = sys.threatLevel ?? 0;
            const threatColor = threatLevel === 0 ? '#00ff55' :
                threatLevel <= 2 ? '#ffaa00' :
                    '#ff0055';
            const threatText = threatLevel === 0 ? '🟢' :
                threatLevel <= 2 ? '🟡' :
                    '🔴';

            return `
                            <div class="star-system" 
                                 data-system-id="${sys.id}"
                                 style="position: absolute; left: ${relX}px; top: ${relY}px; transform: translate(-50%, -50%); cursor: pointer; text-align: center; z-index: 10; pointer-events: auto;">
                                <div style="width: ${isCurrent ? 20 : 12}px; height: ${isCurrent ? 20 : 12}px; background: ${sys.color}; border-radius: 50%; box-shadow: 0 0 ${isCurrent ? 20 : 10}px ${sys.color}; margin: 0 auto; border: ${isCurrent ? '2px solid #fff' : 'none'};"></div>
                                <div style="color: ${inRange ? '#fff' : '#666'}; font-size: 0.7rem; margin-top: 5px; white-space: nowrap; text-shadow: 0 0 2px #000;">
                                    ${sys.name} <span style="color: ${threatColor}; font-weight: bold;" title="Threat Level ${threatLevel}">T${threatLevel}</span>
                                </div>
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

        this.uiManager.createModal('NAVIGATION', content);

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
                    const sys = state.galaxy.find(s => s.id == sysId);
                    if (!sys) return;

                    const dist = Math.sqrt(Math.pow(sys.x - currentSystem.x, 2) + Math.pow(sys.y - currentSystem.y, 2));
                    const inRange = dist <= state.ship.jumpRange;
                    const isCurrent = sys.id === currentSystem.id;

                    infoPanel.innerHTML = `
                        <h3 style="color: ${sys.color}; margin-bottom: 5px;">${sys.name}</h3>
                        <p style="color: #ccc; font-size: 0.9rem;">Type: ${sys.type}</p>
                        <p style="color: #ccc; font-size: 0.9rem;">Distance: ${dist.toFixed(2)} Light Years</p>
                        <p style="color: ${inRange ? 'var(--success)' : 'var(--danger)'}; font-size: 0.9rem; font-weight: bold;">
                            ${inRange ? '✓ In Jump Range' : '✗ Out of Range'}
                        </p>
                        ${isCurrent ? '<p style="color: var(--primary); font-weight: bold;">◉ Current Location</p>' : ''}
                        ${isCurrent ? `<button id="view-system-btn" style="margin-top: 10px;">VIEW SYSTEM MAP</button>` : ''}
                        ${inRange && !isCurrent ? `<button id="jump-btn" style="margin-top: 10px;">INITIATE JUMP</button>` : ''}
                    `;

                    if (isCurrent) {
                        const btnViewSystem = document.getElementById('view-system-btn');
                        btnViewSystem.onclick = () => {
                            document.querySelector('.modal-overlay').remove();
                            this.renderSystemMap();
                        };
                    }

                    if (inRange && !isCurrent) {
                        const btnJump = document.getElementById('jump-btn');
                        btnJump.onclick = () => {
                            const result = state.travelManager.travelToSystem(sys.id);
                            if (result.success) {
                                document.querySelector('.modal-overlay').remove();
                                this.uiManager.animationUI.showTravelAnimation('WARP', () => {
                                    // Wait for travel to complete in the game loop
                                    const checkTravelComplete = () => {
                                        if (!state.travelManager.isTraveling) {
                                            this.uiManager.hud.showNotification(`Arrived at ${state.currentSystem.name}`, 'success');
                                            this.renderSystemMap();
                                        } else {
                                            // Check again next frame
                                            setTimeout(checkTravelComplete, 50);
                                        }
                                    };
                                    checkTravelComplete();
                                });
                            } else {
                                this.uiManager.hud.showNotification(result.message, 'error');
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
            const basePeriod = 20;
            const period = basePeriod * Math.pow(orbitRadius / 100, 1.5);
            const animationName = `orbit-${planet.id}`;
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

        this.uiManager.createModal('SYSTEM MAP', content);

        setTimeout(() => {
            const planets = document.querySelectorAll('.planet-node');
            const infoPanel = document.getElementById('planet-info-panel');
            const mapContainer = document.querySelector('.modal-content');
            const planetarySystem = document.getElementById('planetary-system-container');

            // Panning logic for system map
            let isDragging = false;
            let startX, startY;
            let currentX = 0;
            let currentY = 0;

            mapContainer.addEventListener('mousedown', (e) => {
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

            planets.forEach(planet => {
                planet.onclick = () => {
                    const planetId = planet.dataset.planetId;
                    const planetData = system.planets.find(p => p.id === planetId);
                    if (!planetData) return;

                    const isCurrent = state.currentPlanet && state.currentPlanet.id === planetId;
                    const fuelCost = Math.abs(planetData.distance - (state.currentPlanet?.distance || 0)) / 10;

                    infoPanel.innerHTML = `
                        <div>
                            <h3 style="color: ${planetData.color}; margin-bottom: 5px;">${planetData.name}</h3>
                            <p style="color: #ccc; font-size: 0.9rem;">Type: ${planetData.type}</p>
                            <p style="color: #ccc; font-size: 0.9rem;">Distance: ${planetData.distance} million km</p>
                            ${planetData.hasStation ? '<p style="color: var(--success);">🏠 Station Available</p>' : ''}
                            ${isCurrent ? '<p style="color: var(--primary); font-weight: bold;">◉ Current Location</p>' : ''}
                        </div>
                        ${!isCurrent ? `
                            <div style="text-align: right;">
                                <p style="color: ${state.ship.fuel >= fuelCost ? 'var(--success)' : 'var(--danger)'}; font-size: 0.85rem;">
                                    Fuel Cost: ${fuelCost.toFixed(1)} units
                                </p>
                                <button id="travel-btn" style="margin-top: 10px;" ${state.ship.fuel < fuelCost ? 'disabled' : ''}>
                                    ${state.ship.fuel >= fuelCost ? 'TRAVEL' : 'INSUFFICIENT FUEL'}
                                </button>
                            </div>
                        ` : ''}
                    `;

                    if (!isCurrent && state.ship.fuel >= fuelCost) {
                        const btnTravel = document.getElementById('travel-btn');
                        btnTravel.onclick = () => {
                            const result = state.travelToPlanet(planetId);
                            if (result.success) {
                                document.querySelector('.modal-overlay').remove();
                                this.uiManager.animationUI.showTravelAnimation('SUBLIGHT', () => {
                                    this.uiManager.hud.showNotification(result.message, 'success');
                                });
                            } else {
                                this.uiManager.hud.showNotification(result.message, 'error');
                            }
                        };
                    }
                };
            });
        }, 100);
    }
}

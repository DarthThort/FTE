class CrewManager {
    constructor(gameState) {
        this.state = gameState;
        this.pathfinding = new Pathfinding(gameState);
    }

    hireCrew(crewId) {
        const crew = this.state.port.crew.find(c => c.id === crewId);
        if (!crew) return { success: false, message: 'Crew member not found!' };

        if (this.state.ship.crew.length >= this.state.ship.maxCrew) {
            return { success: false, message: 'Crew quarters are full!' };
        }

        if (this.state.credits < crew.cost) {
            return { success: false, message: 'Insufficient credits!' };
        }

        this.state.credits -= crew.cost;

        // Use tile-based spawning for hired crew
        const spawnTile = this.state.shipCoords.getRandomWalkableTile(this.state.ship.layout);
        const spawnPixels = this.state.shipCoords.tileToPixel(spawnTile.x, spawnTile.y);

        this.state.ship.crew.push({
            ...crew,
            tileX: spawnTile.x,
            tileY: spawnTile.y,
            x: spawnPixels.x,
            y: spawnPixels.y,
            targetX: null,
            targetY: null,
            path: [],
            speed: 1.5,
            state: 'idle',
            wanderTimer: 0,
            doorWaitTimer: 0,
            engineeringSkill: crew.role === 'Engineer' ? 3 : 0  // Engineers are better at repairs
        });
        this.state.port.crew = this.state.port.crew.filter(c => c.id !== crewId);
        this.state.saveGame();
        this.state.notify();

        return { success: true, message: `${crew.name} has joined your crew!` };
    }

    assignCrewToSystem(crewId, systemId) {
        const crew = this.state.ship.crew.find(c => c.id === crewId);
        const system = this.state.ship.systems.find(s => s.id === systemId);

        if (!crew || !system) {
            return { success: false, message: 'Invalid crew or system!' };
        }

        if (system.assignedCrew) {
            return { success: false, message: 'System already has assigned crew!' };
        }

        system.assignedCrew = crew;
        crew.targetX = system.x * 32 + 16;
        crew.targetY = system.y * 32 + 16;
        crew.state = 'moving';
        crew.path = [];

        this.state.saveGame();
        this.state.notify();

        // Refresh weapon panel to update AUTO/MANUAL status
        if (window.game && window.game.ui && window.game.ui.weaponUI) {
            window.game.ui.weaponUI.refreshWeaponsPanel();
        }

        return { success: true, message: `${crew.name} assigned to ${system.name}` };
    }

    unassignCrewFromSystem(systemId) {
        const system = this.state.ship.systems.find(s => s.id === systemId);

        if (!system || !system.assignedCrew) {
            return { success: false, message: 'No crew assigned to this system!' };
        }

        const crew = system.assignedCrew;
        crew.targetX = null;
        crew.targetY = null;
        crew.state = 'idle';
        crew.path = [];
        crew.wanderTimer = 0;

        const crewName = system.assignedCrew.name;
        system.assignedCrew = null;
        this.state.saveGame();
        this.state.notify();

        // Refresh weapon panel to update AUTO/MANUAL status
        if (window.game && window.game.ui && window.game.ui.weaponUI) {
            window.game.ui.weaponUI.refreshWeaponsPanel();
        }

        return { success: true, message: `${crewName} unassigned` };
    }

    getRolePrimarySkill(role) {
        const skillMap = {
            'Engineer': 'engineering',
            'Pilot': 'piloting',
            'Gunner': 'combat',
            'Medic': 'medical'
        };
        return skillMap[role] || 'engineering';
    }

    updateCrewAI() {
        // Don't move crew if combat is paused
        if (this.state.combatManager && this.state.combatManager.paused) {
            return;
        }

        // DEBUG: Log when updateCrewAI runs
        const fireCount = this.state.hazardManager?.fires?.length || 0;
        if (fireCount > 0 && Math.random() < 0.1) { // Log 10% of the time when there are fires
            console.log(`[CrewAI] Running with ${this.state.ship.crew.length} crew, ${fireCount} fires`);
        }

        for (const crew of this.state.ship.crew) {
            // PRIORITY 1: Fire fighting - ALL crew should fight fires (except if already doing so)
            if (crew.state !== 'fighting_fire' && crew.state !== 'repairing') {
                const nearbyFire = this.findNearbyFire(crew);
                if (nearbyFire) {
                    crew.state = 'fighting_fire';
                    crew.targetFire = nearbyFire;
                    crew.fireFightProgress = 0;
                    crew.targetX = nearbyFire.x * 32 + 16;
                    crew.targetY = nearbyFire.y * 32 + 16;
                    crew.path = [];
                    console.log(`[CrewManager] 🔥 ${crew.name} detected fire at (${nearbyFire.x}, ${nearbyFire.y}) and going to fight it`);
                    continue; // Skip everything else - fire is priority!
                }
            }

            // Check if crew is assigned to a system
            const assignedSystem = this.state.ship.systems.find(s => s.assignedCrew?.id === crew.id);

            // Don't wander if assigned to a system - stay at post (unless fighting fire)
            if (assignedSystem && crew.state !== 'moving' && crew.state !== 'fighting_fire') {
                crew.x = assignedSystem.x * 32 + 16;
                crew.y = assignedSystem.y * 32 + 16;
                crew.targetX = null;
                crew.targetY = null;
                crew.state = 'working';
                continue; // Skip normal AI for assigned crew
            }

            if (crew.state === 'idle' && (!crew.targetX || !crew.targetY)) {
                if (!crew.wanderTimer || crew.wanderTimer <= 0) {
                    const wanderSpot = this.getRandomWalkablePosition();
                    if (wanderSpot) {
                        crew.targetX = wanderSpot.x * 32 + 16;
                        crew.targetY = wanderSpot.y * 32 + 16;
                        crew.state = 'wandering';
                        crew.path = [];
                    }
                    crew.wanderTimer = 3 + Math.random() * 2;
                }
                crew.wanderTimer -= 1 / 60;
            }

            // Handle crew states: moving, wandering, AND fighting_fire
            if ((crew.state === 'moving' || crew.state === 'wandering' || crew.state === 'fighting_fire') && crew.targetX !== null && crew.targetY !== null) {
                // Fire fighter check: am I close enough to fight the fire?
                if (crew.state === 'fighting_fire' && crew.targetFire) {
                    const dist = Math.sqrt(
                        Math.pow(crew.x / 32 - crew.targetFire.x, 2) +
                        Math.pow(crew.y / 32 - crew.targetFire.y, 2)
                    );

                    // Close enough to fight fire (1.5 tiles range)
                    if (dist <= 1.5) {
                        const fire = this.state.hazardManager.getFireAt(crew.targetFire.x, crew.targetFire.y);

                        if (!fire) {
                            // Fire extinguished, return to idle
                            crew.state = 'idle';
                            crew.targetFire = null;
                            crew.fireFightProgress = 0;
                            crew.targetX = null;
                            crew.targetY = null;
                            console.log(`[CrewManager] ${crew.name} finished fighting fire (already out)`);
                            continue;
                        }

                        // Fight the fire!
                        crew.fireFightProgress += 1 / 60; // Assuming 60fps
                        const fightTime = Math.max(2, 5 - (crew.engineeringSkill || 0));

                        // Reduce fire intensity
                        fire.intensity = Math.max(0, fire.intensity - (15 / 60)); // 15% per second

                        if (fire.intensity <= 0 || crew.fireFightProgress >= fightTime) {
                            // Fire out!
                            this.state.hazardManager.extinguishFireAt(fire.x, fire.y);
                            crew.state = 'idle';
                            crew.targetFire = null;
                            crew.fireFightProgress = 0;
                            crew.targetX = null;
                            crew.targetY = null;
                            console.log(`[CrewManager] ${crew.name} extinguished fire!`);
                        }
                        continue; // Don't move, just fight fire
                    }
                }

                // Normal pathfinding and movement
                // DEBUG: Log if crew has targetBreach
                if (crew.targetBreach !== undefined) {
                    console.log(`[CrewManager] ${crew.name} moving to breach - state='${crew.state}' targetBreach=${crew.targetBreach} path.length=${crew.path?.length || 0}`);
                }

                if (!crew.path || crew.path.length === 0) {
                    const startX = Math.floor(crew.x / 32);
                    const startY = Math.floor(crew.y / 32);
                    const targetX = Math.floor(crew.targetX / 32);
                    const targetY = Math.floor(crew.targetY / 32);

                    let path = this.pathfinding.findPath(startX, startY, targetX, targetY);
                    path = this.pathfinding.smoothPath(path);

                    crew.path = path.map(node => ({
                        x: node.x,
                        y: node.y,
                        offsetX: (Math.random() - 0.5) * 4,
                        offsetY: (Math.random() - 0.5) * 4
                    }));
                }

                if (crew.path && crew.path.length > 0) {
                    const nextNode = crew.path[0];
                    const nextX = nextNode.x * 32 + 16 + (nextNode.offsetX || 0);
                    const nextY = nextNode.y * 32 + 16 + (nextNode.offsetY || 0);

                    const dx = nextX - crew.x;
                    const dy = nextY - crew.y;
                    const distance = Math.sqrt(dx * dx + dy * dy);

                    // Check if next tile is a closed door
                    const nextTile = this.state.ship.layout[nextNode.y]?.[nextNode.x];

                    if (nextTile === 4 && distance < 40) {
                        // Initialize timer if not present
                        if (crew.doorWaitTimer === undefined) {
                            crew.doorWaitTimer = 0;
                        }

                        // If timer not started, start it
                        if (crew.doorWaitTimer <= 0) {
                            crew.doorWaitTimer = 0.5; // 0.5 seconds wait
                        }

                        // Decrement timer
                        crew.doorWaitTimer -= 1 / 60;

                        // If timer finished, open door and proceed
                        if (crew.doorWaitTimer <= 0) {
                            this.state.ship.layout[nextNode.y][nextNode.x] = 5;
                            crew.doorWaitTimer = 0;
                            this.state.notify();
                        } else {
                            // Still waiting, skip movement
                            continue;
                        }
                    }

                    if (distance < 3) {
                        crew.path.shift();

                        if (crew.path.length === 0) {
                            crew.x = crew.targetX;
                            crew.y = crew.targetY;

                            // IMPORTANT: Check if this is a breach repair task BEFORE changing state
                            if (crew.state === 'moving' && crew.targetBreach !== undefined) {
                                const breach = this.state.hazardManager.breaches[crew.targetBreach];

                                if (breach) {
                                    const dx = crew.x - (breach.x * 32 + 16);
                                    const dy = crew.y - (breach.y * 32 + 16);
                                    const dist = Math.sqrt(dx * dx + dy * dy);

                                    // If at breach location, start repairing immediately
                                    if (dist < 48) {
                                        console.log(`[CrewManager] ✅ ${crew.name} ARRIVED at breach - Setting state='repairing'`);
                                        crew.state = 'repairing';
                                        crew.repairProgress = 0;
                                        continue; // Skip normal state change below
                                    }
                                }
                            }

                            // Normal state changes (only if not repairing)
                            if (crew.state === 'moving') {
                                crew.state = 'working';
                                crew.targetX = null;
                                crew.targetY = null;
                            } else if (crew.state === 'wandering') {
                                crew.state = 'idle';
                                crew.targetX = null;
                                crew.targetY = null;
                                crew.wanderTimer = 2 + Math.random() * 3;
                            }
                        }
                    } else {
                        const moveX = (dx / distance) * crew.speed;
                        const moveY = (dy / distance) * crew.speed;
                        crew.x += moveX;
                        crew.y += moveY;
                    }
                }
            }


            // NEW: Handle repairing state
            if (crew.state === 'repairing' && crew.targetBreach !== undefined) {
                const breach = this.state.hazardManager.breaches[crew.targetBreach];

                if (!breach) {
                    // Breach completed, return to idle
                    crew.state = 'idle';
                    crew.targetBreach = undefined;
                    crew.repairProgress = 0;
                    crew.targetX = null;
                    crew.targetY = null;
                    continue;
                }

                // Check if still in range
                const dx = crew.x - (breach.x * 32 + 16);
                const dy = crew.y - (breach.y * 32 + 16);
                const dist = Math.sqrt(dx * dx + dy * dy);

                if (dist > 48) {
                    // Moved away, go back to moving
                    crew.state = 'moving';
                    crew.targetX = breach.x * 32 + 16;
                    crew.targetY = breach.y * 32 + 16;
                    crew.path = [];
                    crew.repairProgress = 0;
                    continue;
                }

                // Progress repair (60 FPS assumed)
                const engineeringSkill = crew.engineeringSkill || 0;
                const repairTime = Math.max(2, 10 - engineeringSkill); // Same as player
                const progressPerFrame = (1 / 60) / repairTime;

                crew.repairProgress = (crew.repairProgress || 0) + progressPerFrame;
                console.log(`[CrewManager] ${crew.name} repairing - progress: ${(crew.repairProgress * 100).toFixed(1)}%`);

                // Complete repair
                if (crew.repairProgress >= 1.0) {
                    this.state.hazardManager.completeBreach(crew.targetBreach);
                    crew.state = 'idle';
                    crew.targetBreach = undefined;
                    crew.repairProgress = 0;
                    crew.targetX = null;
                    crew.targetY = null;
                }
            }
        }
    }

    getRandomWalkablePosition() {
        const layout = this.state.ship.layout;
        const maxAttempts = 50;

        for (let i = 0; i < maxAttempts; i++) {
            const x = Math.floor(Math.random() * layout[0].length);
            const y = Math.floor(Math.random() * layout.length);

            if (layout[y][x] === 2 || layout[y][x] === 3 || layout[y][x] === 5) {
                return { x, y };
            }
        }
        return null;
    }

    /**
     * Find a nearby fire to fight
     * @param {Object} crew - Crew member
     * @returns {Object|null} - Fire object or null
     */
    findNearbyFire(crew) {
        const fires = this.state.hazardManager.fires;
        if (!fires || fires.length === 0) return null;

        const crewTileX = Math.floor(crew.x / 32);
        const crewTileY = Math.floor(crew.y / 32);
        const detectionRange = 8; // tiles

        let nearestFire = null;
        let minDist = Infinity;

        for (const fire of fires) {
            const dx = fire.x - crewTileX;
            const dy = fire.y - crewTileY;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < minDist && dist <= detectionRange) {
                minDist = dist;
                nearestFire = fire;
            }
        }

        // Debug logging when fire detection runs
        if (fires.length > 0) {
            console.log(`[FireDetection] ${crew.name} state='${crew.state}' at (${crewTileX},${crewTileY}) - ${fires.length} fires, nearest=${nearestFire ? `(${nearestFire.x},${nearestFire.y}) dist=${minDist.toFixed(1)}` : 'none in range'}`);
        }

        return nearestFire;
    }
}

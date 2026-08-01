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
            engineeringSkill: crew.role === 'Engineer' ? 3 : 0
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
        if (this.state.combatManager && this.state.combatManager.paused) {
            return;
        }

        for (const crew of this.state.ship.crew) {
            // Auto-recovery: ONLY if crew is idle/standing motionless outside walkable tiles
            if (crew.state === 'idle' && (!crew.path || crew.path.length === 0)) {
                const tileX = Math.floor(crew.x / 32);
                const tileY = Math.floor(crew.y / 32);
                if (this.state.shipCoords && this.state.ship && this.state.ship.layout) {
                    if (!this.state.shipCoords.isWalkable(this.state.ship.layout, tileX, tileY)) {
                        console.warn(`[CrewAI] ${crew.name} was stuck outside walkable ship area at (${tileX}, ${tileY}). Repositioning inside!`);
                        const validTile = this.state.shipCoords.getRandomWalkableTile(this.state.ship.layout);
                        const validPos = this.state.shipCoords.tileToPixel(validTile.x, validTile.y);
                        crew.x = validPos.x;
                        crew.y = validPos.y;
                        crew.tileX = validTile.x;
                        crew.tileY = validTile.y;
                        crew.targetX = null;
                        crew.targetY = null;
                    }
                }
            }

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
                    continue;
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
                continue;
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
                        if (fire) {
                            crew.fireFightProgress += 1 / 60;
                            fire.intensity -= (1.0 + (crew.engineeringSkill || 0) * 0.2) * (1 / 60) * 25;

                            if (fire.intensity <= 0) {
                                this.state.hazardManager.extinguishFire(crew.targetFire.x, crew.targetFire.y);
                                crew.state = 'idle';
                                crew.targetFire = null;
                                crew.targetX = null;
                                crew.targetY = null;

                                if (this.state.hud) {
                                    this.state.hud.showNotification(`${crew.name} extinguió un incendio`, 'success');
                                }
                            }
                            continue;
                        } else {
                            crew.state = 'idle';
                            crew.targetFire = null;
                            crew.targetX = null;
                            crew.targetY = null;
                        }
                    }
                }

                // If path is empty, compute path using A*
                if (crew.path.length === 0) {
                    const currentTileX = Math.floor(crew.x / 32);
                    const currentTileY = Math.floor(crew.y / 32);
                    const targetTileX = Math.floor(crew.targetX / 32);
                    const targetTileY = Math.floor(crew.targetY / 32);

                    const path = this.pathfinding.findPath(currentTileX, currentTileY, targetTileX, targetTileY);
                    if (path && path.length > 0) {
                        crew.path = path;
                    } else {
                        crew.targetX = null;
                        crew.targetY = null;
                        crew.state = 'idle';
                        continue;
                    }
                }

                // Follow path waypoint by waypoint
                if (crew.path.length > 0) {
                    const nextTile = crew.path[0];

                    if (this.state.ship.doors) {
                        const isDoorBlocked = this.state.ship.doors.some(door => {
                            const isDoorLocation = (
                                (door.x1 === nextTile.x && door.y1 === nextTile.y) ||
                                (door.x2 === nextTile.x && door.y2 === nextTile.y)
                            );
                            return isDoorLocation && !door.isOpen;
                        });

                        if (isDoorBlocked) {
                            if (!crew.doorWaitTimer) crew.doorWaitTimer = 0;
                            crew.doorWaitTimer += 1 / 60;

                            if (crew.doorWaitTimer > 2.0) {
                                crew.path = [];
                                crew.targetX = null;
                                crew.targetY = null;
                                crew.state = 'idle';
                                crew.doorWaitTimer = 0;
                            }
                            continue;
                        }
                    }

                    crew.doorWaitTimer = 0;

                    const targetPixelX = nextTile.x * 32 + 16;
                    const targetPixelY = nextTile.y * 32 + 16;

                    const dx = targetPixelX - crew.x;
                    const dy = targetPixelY - crew.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);

                    const moveSpeed = crew.speed * 32 * (1 / 60);

                    if (dist <= moveSpeed) {
                        crew.x = targetPixelX;
                        crew.y = targetPixelY;
                        crew.path.shift();

                        if (crew.path.length === 0) {
                            if (crew.state === 'wandering' || crew.state === 'moving') {
                                crew.state = 'idle';
                                crew.targetX = null;
                                crew.targetY = null;
                            }
                        }
                    } else {
                        crew.x += (dx / dist) * moveSpeed;
                        crew.y += (dy / dist) * moveSpeed;
                    }
                }
            }
        }
    }

    findNearbyFire(crew) {
        if (!this.state.hazardManager || !this.state.hazardManager.fires) return null;
        if (this.state.hazardManager.fires.length === 0) return null;

        const crewTileX = Math.floor(crew.x / 32);
        const crewTileY = Math.floor(crew.y / 32);

        let nearestFire = null;
        let minDistance = Infinity;

        for (const fire of this.state.hazardManager.fires) {
            const dist = Math.sqrt(
                Math.pow(crewTileX - fire.x, 2) +
                Math.pow(crewTileY - fire.y, 2)
            );

            if (dist < minDistance) {
                minDistance = dist;
                nearestFire = fire;
            }
        }

        return nearestFire;
    }

    getRandomWalkablePosition() {
        return this.state.getRandomWalkablePosition();
    }
}

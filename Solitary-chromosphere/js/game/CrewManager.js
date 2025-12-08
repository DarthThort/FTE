class CrewManager {
    constructor(gameState) {
        this.state = gameState;
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

        for (const crew of this.state.ship.crew) {
            // Check if crew is assigned to a system
            const assignedSystem = this.state.ship.systems.find(s => s.assignedCrew?.id === crew.id);

            // Don't wander if assigned to a system - stay at post
            if (assignedSystem && crew.state !== 'moving') {
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

            if ((crew.state === 'moving' || crew.state === 'wandering') && crew.targetX !== null && crew.targetY !== null) {
                if (!crew.path || crew.path.length === 0) {
                    const startX = Math.floor(crew.x / 32);
                    const startY = Math.floor(crew.y / 32);
                    const targetX = Math.floor(crew.targetX / 32);
                    const targetY = Math.floor(crew.targetY / 32);

                    let path = this.findPath(startX, startY, targetX, targetY);
                    path = this.smoothPath(path);

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
        const walkableTiles = [];
        for (let y = 0; y < this.state.ship.layout.length; y++) {
            for (let x = 0; x < this.state.ship.layout[y].length; x++) {
                if (this.isWalkable(x, y)) {
                    walkableTiles.push({ x, y });
                }
            }
        }

        if (walkableTiles.length > 0) {
            return walkableTiles[Math.floor(Math.random() * walkableTiles.length)];
        }
        return null;
    }

    smoothPath(path) {
        if (path.length <= 2) return path;

        const smoothed = [path[0]];

        for (let i = 1; i < path.length - 1; i++) {
            const prev = path[i - 1];
            const current = path[i];
            const next = path[i + 1];

            const dx1 = current.x - prev.x;
            const dy1 = current.y - prev.y;
            const dx2 = next.x - current.x;
            const dy2 = next.y - current.y;

            // Check if current tile is a door
            const isDoor = this.state.ship.layout[current.y][current.x] === 4;

            if ((dx1 !== dx2 || dy1 !== dy2) || isDoor) {
                smoothed.push(current);
            }
        }

        smoothed.push(path[path.length - 1]);

        return smoothed;
    }

    findPath(startX, startY, targetX, targetY) {
        const openList = [];
        const closedList = new Set();

        const startNode = {
            x: startX,
            y: startY,
            g: 0,
            h: this.heuristic(startX, startY, targetX, targetY),
            f: 0,
            parent: null
        };
        startNode.f = startNode.g + startNode.h;

        openList.push(startNode);

        while (openList.length > 0) {
            openList.sort((a, b) => a.f - b.f);
            const current = openList.shift();

            if (current.x === targetX && current.y === targetY) {
                return this.reconstructPath(current);
            }

            closedList.add(`${current.x},${current.y}`);

            const neighbors = [
                { x: current.x + 1, y: current.y },
                { x: current.x - 1, y: current.y },
                { x: current.x, y: current.y + 1 },
                { x: current.x, y: current.y - 1 }
            ];

            for (const neighbor of neighbors) {
                const key = `${neighbor.x},${neighbor.y}`;

                if (closedList.has(key)) continue;
                if (!this.isWalkable(neighbor.x, neighbor.y)) continue;

                const g = current.g + 1;
                const h = this.heuristic(neighbor.x, neighbor.y, targetX, targetY);
                const f = g + h;

                const existingNode = openList.find(n => n.x === neighbor.x && n.y === neighbor.y);

                if (existingNode) {
                    if (g < existingNode.g) {
                        existingNode.g = g;
                        existingNode.f = f;
                        existingNode.parent = current;
                    }
                } else {
                    openList.push({
                        x: neighbor.x,
                        y: neighbor.y,
                        g: g,
                        h: h,
                        f: f,
                        parent: current
                    });
                }
            }
        }

        return [];
    }

    heuristic(x1, y1, x2, y2) {
        return Math.abs(x1 - x2) + Math.abs(y1 - y2);
    }

    isWalkable(x, y) {
        if (!this.state.ship.layout[y] || !this.state.ship.layout[y][x]) return false;

        const tile = this.state.ship.layout[y][x];
        // Walkable: Floor (2), Slot (3), Closed Door (4), Open Door (5)
        return tile === 2 || tile === 3 || tile === 4 || tile === 5;
    }

    reconstructPath(node) {
        const path = [];
        let current = node;

        while (current.parent) {
            path.unshift({ x: current.x, y: current.y });
            current = current.parent;
        }

        return path;
    }
}

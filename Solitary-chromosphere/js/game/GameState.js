class GameState {
    constructor() {
        this.credits = 1000;

        this.ship = {
            name: "Rusty Tub",
            type: "Frigate Class",
            health: 100,
            maxHealth: 100,
            shield: 50,
            maxShield: 50,
            cargo: {
                capacity: 50,
                items: []
            },
            level: 1,
            jumpRange: 6, // Light Years
            layout: [
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 2, 2, 2, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 2, 3, 2, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 2, 4, 2, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 2, 2, 2, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 1, 2, 2, 3, 2, 2, 2, 2, 2, 3, 2, 2, 1, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 4, 1, 1, 4, 1, 1, 4, 1, 1, 1, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 2, 1, 0, 2, 0, 1, 2, 1, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 2, 1, 0, 2, 0, 1, 2, 1, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 4, 1, 1, 4, 1, 1, 4, 1, 1, 1, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 4, 4, 4, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 2, 2, 2, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 2, 3, 2, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
            ],
            systems: [
                { x: 13, y: 5, id: 'bridge', name: 'Bridge Console', type: 'bridge', color: '#00f0ff', level: 1, maxPower: 1, currentPower: 1, health: 100, maxHealth: 100, damaged: false, ionized: 0, effectiveness: 1.0 },
                { x: 13, y: 19, id: 'engines', name: 'Engine Control', type: 'engine', color: '#ff5500', level: 1, maxPower: 2, currentPower: 1, health: 100, maxHealth: 100, damaged: false, ionized: 0, effectiveness: 0.75 },
                { x: 10, y: 8, id: 'weapons', name: 'Weapons Array', type: 'weapon', color: '#ff0055', level: 1, maxPower: 2, currentPower: 1, health: 100, maxHealth: 100, damaged: false, ionized: 0, effectiveness: 0.75 },
                { x: 16, y: 8, id: 'shields', name: 'Shield Generator', type: 'shield', color: '#00ff55', level: 2, maxPower: 2, currentPower: 1, health: 100, maxHealth: 100, damaged: false, ionized: 0, effectiveness: 0.75 }
            ],
            reactor: {
                level: 1,
                maxPower: 8,
                usedPower: 4  // 1 power per system initially
            },
            shields: {
                level: 2,
                maxLayers: 2,  // Will be calculated: level + (crew ? 1 : 0)
                currentLayers: 2,
                layerHP: 10,  // Damage each layer can absorb
                currentLayerHP: 10,  // HP of topmost layer
                rechargeRate: 1.0,  // Base recharge rate
                rechargeTimer: 0,
                powerPerLayer: 1
            },
            weapons: [
                {
                    id: 'weapon_1',
                    name: 'Burst Laser I',
                    type: 'burst_laser',
                    chargeTime: 8,
                    cooldownTime: 2,
                    shots: 2,
                    damagePerShot: 15,
                    powerRequired: 1,
                    currentCharge: 0,
                    state: 'idle',
                    target: null
                }
            ],
            rooms: [],  // Will be generated
            doors: [],  // Will be generated
            modules: [],
            crew: [],  // Will be populated after shipCoords is initialized
            maxCrew: 6,
            fuel: 100,
            maxFuel: 100
        };

        this.inventory = [
            { id: 'fuel', name: 'Fuel Cells', quantity: 10, value: 50 },
            { id: 'rations', name: 'Rations', quantity: 20, value: 10 },
            { id: 'engine_mod_mk1', name: 'Engine Booster Mk1', quantity: 1, value: 200, type: 'module', systemType: 'engine' },
            { id: 'weapon_mod_laser', name: 'Pulse Laser', quantity: 1, value: 350, type: 'module', systemType: 'weapon' }
        ];

        this.port = {
            ships: [],
            crew: [],
            contracts: []
        };

        this.market = [
            { id: 'fuel', name: 'Fuel Cells', price: 55, stock: 100 },
            { id: 'rations', name: 'Rations', price: 12, stock: 200 },
            { id: 'scrap', name: 'Scrap Metal', price: 25, stock: 50 },
            { id: 'electronics', name: 'Microchips', price: 150, stock: 10 }
        ];

        // Initialize coordinate system
        this.shipCoords = new ShipCoordinates(32);

        // Initialize combat managers first
        this.powerManager = new PowerManager(this);
        this.lifeSupportManager = new LifeSupportManager(this);
        this.weaponManager = new WeaponManager(this);
        this.shieldManager = new ShieldManager(this);

        // Initialize other managers
        this.galaxyManager = new GalaxyManager(this);
        this.cargoManager = new CargoManager(this);
        this.travelManager = new TravelManager(this);
        this.portGenerator = new PortGenerator(this);
        this.crewManager = new CrewManager(this);

        // Combat system managers
        this.encounterManager = new EncounterManager(this);
        this.combatManager = null; // Created when combat starts
        this.currentEnemy = null; // Current enemy ship in combat

        // Detect and initialize rooms AFTER all managers are created
        this.ship.rooms = this.lifeSupportManager.detectRooms();
        this.ship.doors = this.generateDoors();
        console.log(`Detected ${this.ship.rooms.length} rooms in ship`);

        // Star Systems (Sol + 10 nearest real systems)
        this.galaxy = null;
        this.currentSystem = null;
        this.currentPlanet = null;
        this.initializeGalaxy();

        this.portGenerator.generatePortContent();
        this.listeners = [];
        this.loadGame();
    }

    generatePortContent() {
        return this.portGenerator.generatePortContent();
    }

    loadGame() {
        const savedData = localStorage.getItem('spaceSimSave');
        if (savedData) {
            try {
                const data = JSON.parse(savedData);
                this.credits = data.credits;
                this.ship = { ...this.ship, ...data.ship };

                // Migrate old saves: add cargo if missing
                if (!this.ship.cargo) {
                    this.ship.cargo = {
                        capacity: 50,
                        items: []
                    };
                    console.log('Migrated save: added cargo system');
                }

                this.port.crew = data.portCrew || this.port.crew;
                this.port.contracts = data.contracts || this.port.contracts;

                if (data.galaxy) {
                    this.galaxy = data.galaxy;
                    this.currentSystem = data.currentSystem || this.galaxy[0];
                    this.currentPlanet = data.currentPlanet || (this.currentSystem.planets && this.currentSystem.planets[0]);
                } else {
                    this.initializeGalaxy();
                }

                if (data.ship.crew) {
                    this.ship.crew = data.ship.crew.map(c => {
                        // Migrate crew positions from 20x18 to 25x25 grid
                        let newX = c.x;
                        let newY = c.y;

                        // If crew is at old coordinates (< 400px), migrate them
                        if (c.x < 400) {
                            newX = c.x + 160;  // Add 5 tiles * 32px
                            newY = c.y + 96;   // Add 3 tiles * 32px
                            console.log(`Migrated ${c.name} from (${c.x}, ${c.y}) to (${newX}, ${newY})`);
                        }

                        return {
                            ...c,
                            x: newX,
                            y: newY,
                            targetX: null,
                            targetY: null,
                            path: [],
                            state: 'idle',
                            wanderTimer: 0,
                            doorWaitTimer: 0
                        };
                    });
                }

                // Move crew to their assigned systems after load
                this.ship.systems.forEach(system => {
                    if (system.assignedCrew) {
                        const crew = this.ship.crew.find(c => c.id === system.assignedCrew.id);
                        if (crew) {
                            crew.x = system.x * 32 + 16;
                            crew.y = system.y * 32 + 16;
                            crew.targetX = system.x * 32 + 16;
                            crew.targetY = system.y * 32 + 16;
                            crew.state = 'moving';
                            crew.path = [];
                        }
                    }
                });


                console.log('Game Loaded');
            } catch (e) {
                console.error('Failed to load save:', e);
                this.initializeGalaxy();
            }
        } else {
            this.galaxyManager.initializeGalaxy();
        }

        // Load pre-travel save LAST to override hull health
        const preTravelData = localStorage.getItem('pre_travel_save');
        if (preTravelData) {
            try {
                const saveData = JSON.parse(preTravelData);
                console.log('[RETRY] Restoring hull from pre-travel save:', saveData.shipHealth);
                this.ship.health = saveData.shipHealth;
                localStorage.removeItem('pre_travel_save');
                console.log('[RETRY] Hull restored to:', this.ship.health);
            } catch (e) {
                console.error('[RETRY] Failed to load pre-travel save:', e);
                localStorage.removeItem('pre_travel_save');
            }
        }
    }

    saveGame() {
        const data = {
            credits: this.credits,
            ship: {
                ...this.ship,
                crew: this.ship.crew.map(c => ({
                    ...c,
                    targetX: null,
                    targetY: null,
                    path: [],
                    state: 'idle'
                }))
            },
            portCrew: this.port.crew,
            contracts: this.port.contracts,
            galaxy: this.galaxy,
            currentSystem: this.currentSystem,
            currentPlanet: this.currentPlanet
        };
        localStorage.setItem('spaceSimSave', JSON.stringify(data));
        console.log('Game Saved');
    }

    initializeGalaxy() {
        return this.galaxyManager.initializeGalaxy();
    }

    subscribe(callback) {
        this.listeners.push(callback);
    }

    notify() {
        this.listeners.forEach(cb => cb(this));
    }

    updateCredits(amount) {
        this.credits += amount;
        this.saveGame();
        this.notify();
    }

    damageShip(amount) {
        this.ship.health = Math.max(0, this.ship.health - amount);
        this.saveGame();
        this.notify();
    }

    buyItem(itemId, amount) {
        const item = this.market.find(i => i.id === itemId);
        if (!item || item.stock < amount) return false;

        const cost = item.price * amount;
        if (this.credits < cost) return false;

        this.credits -= cost;
        item.stock -= amount;
        this.saveGame();
        this.notify();
        return true;
    }

    sellItem(itemId, amount) {
        this.saveGame();
        this.notify();
        return true;
    }

    uninstallSystem(system) {
        this.ship.systems = this.ship.systems.filter(s => s !== system);
        this.saveGame();
        this.notify();
    }

    installSystem(item, x, y) {
        if (this.ship.systems.find(s => s.x === x && s.y === y)) return false;

        this.ship.systems.push({
            x: x,
            y: y,
            id: item.systemType + '_' + Date.now(),
            name: item.name.replace(' Module', ''),
            type: item.systemType,
            color: this.getSystemColor(item.systemType)
        });

        // Remove from inventory if it exists there
        const inventoryIndex = this.inventory.findIndex(i => i.id === item.id);
        if (inventoryIndex > -1) {
            this.inventory.splice(inventoryIndex, 1);
        }

        this.saveGame();
        this.notify();
        return true;
    }

    toggleDoor(x, y) {
        const tile = this.ship.layout[y][x];
        if (tile === 4) {
            this.ship.layout[y][x] = 5;
        } else if (tile === 5) {
            this.ship.layout[y][x] = 4;
        }
        this.saveGame();
        this.notify();
    }

    travelToSystem(systemId) {
        return this.travelManager.travelToSystem(systemId);
    }

    travelToPlanet(planetId) {
        return this.travelManager.travelToPlanet(planetId);
    }

    getSystemColor(type) {
        return this.galaxyManager.getSystemColor(type);
    }

    hireCrew(crewId) {
        return this.crewManager.hireCrew(crewId);
    }

    assignCrewToSystem(crewId, systemId) {
        return this.crewManager.assignCrewToSystem(crewId, systemId);
    }

    unassignCrewFromSystem(systemId) {
        return this.crewManager.unassignCrewFromSystem(systemId);
    }

    getRolePrimarySkill(role) {
        return this.crewManager.getRolePrimarySkill(role);
    }

    updateCrewAI() {
        for (const crew of this.ship.crew) {
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
                    const nextTile = this.ship.layout[nextNode.y]?.[nextNode.x];

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
                            this.ship.layout[nextNode.y][nextNode.x] = 5;
                            crew.doorWaitTimer = 0;
                            this.notify();
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
        }
    }

    getRandomWalkablePosition() {
        const walkableTiles = [];
        for (let y = 0; y < this.ship.layout.length; y++) {
            for (let x = 0; x < this.ship.layout[y].length; x++) {
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
            const isDoor = this.ship.layout[current.y][current.x] === 4;

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
        if (!this.ship.layout[y] || !this.ship.layout[y][x]) return false;

        const tile = this.ship.layout[y][x];
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

    // Travel System Methods
    travelToSystem(systemId) {
        const targetSystem = this.galaxy.find(s => s.id === systemId);
        if (!targetSystem) {
            return { success: false, message: 'System not found' };
        }

        // Calculate distance
        const dx = targetSystem.x - this.currentSystem.x;
        const dy = targetSystem.y - this.currentSystem.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        // Check jump range
        if (distance > this.ship.jumpRange) {
            return {
                success: false,
                message: `Target system is ${distance.toFixed(1)} LY away. Your jump drive can only reach ${this.ship.jumpRange} LY.`
            };
        }

        // Execute jump
        this.currentSystem = targetSystem;
        this.currentSystem.visited = true;

        // Select first planet with station, or first planet
        const stationPlanet = targetSystem.planets.find(p => p.hasStation);
        this.currentPlanet = stationPlanet || targetSystem.planets[0];

        this.saveGame();
        this.notify();

        return {
            success: true,
            message: `Jumped to ${targetSystem.name}. Now orbiting ${this.currentPlanet.name}.`
        };
    }



    // Cargo Management Methods
    getCargoUsed() {
        return this.cargoManager.getCargoUsed();
    }
    getCargoValue() {
        return this.cargoManager.getCargoValue();
    }
    buyCommodity(commodityId, quantity, price, stationId) {
        return this.cargoManager.buyCommodity(commodityId, quantity, price, stationId);
    }
    sellCommodity(commodityId, quantity, price) {
        return this.cargoManager.sellCommodity(commodityId, quantity, price);
    }

    // Room & Door Generation
    generateRooms() {
        // For MVP, define rooms manually based on ship layout
        // In future, could analyze layout grid automatically
        return [
            {
                id: 'cockpit',
                tiles: [[7, 1], [8, 1], [9, 1], [7, 2], [8, 2], [9, 2], [7, 3], [8, 3], [9, 3]],
                oxygen: 100,
                onFire: false,
                fireIntensity: 0,
                breached: false,
                connectedRooms: ['main_hall'],
                doors: { 'main_hall': { open: true, id: 'door_cockpit_main' } }
            },
            {
                id: 'main_hall',
                tiles: [[3, 4], [4, 4], [5, 4], [6, 4], [7, 4], [8, 4], [9, 4], [10, 4], [11, 4], [12, 4], [13, 4], [14, 4],
                [3, 5], [4, 5], [5, 5], [6, 5], [7, 5], [8, 5], [9, 5], [10, 5], [11, 5], [12, 5], [13, 5], [14, 5]],
                oxygen: 100,
                onFire: false,
                fireIntensity: 0,
                breached: false,
                connectedRooms: ['cockpit', 'left_wing', 'right_wing', 'engine_room'],
                doors: {
                    'cockpit': { open: true, id: 'door_cockpit_main' },
                    'left_wing': { open: true, id: 'door_main_left' },
                    'right_wing': { open: true, id: 'door_main_right' },
                    'engine_room': { open: true, id: 'door_main_engine' }
                }
            },
            {
                id: 'left_wing',
                tiles: [[5, 7], [5, 8]],
                oxygen: 100,
                onFire: false,
                fireIntensity: 0,
                breached: false,
                connectedRooms: ['main_hall'],
                doors: { 'main_hall': { open: true, id: 'door_main_left' } }
            },
            {
                id: 'right_wing',
                tiles: [[12, 7], [12, 8]],
                oxygen: 100,
                onFire: false,
                fireIntensity: 0,
                breached: false,
                connectedRooms: ['main_hall'],
                doors: { 'main_hall': { open: true, id: 'door_main_right' } }
            },
            {
                id: 'engine_room',
                tiles: [[7, 16], [8, 16], [9, 16], [7, 17], [8, 17], [9, 17]],
                oxygen: 100,
                onFire: false,
                fireIntensity: 0,
                breached: false,
                connectedRooms: ['main_hall'],
                doors: { 'main_hall': { open: true, id: 'door_main_engine' } }
            }
        ];
    }

    generateDoors() {
        return [
            { id: 'door_cockpit_main', room1: 'cockpit', room2: 'main_hall', open: true, locked: false, position: { x: 8, y: 3 } },
            { id: 'door_main_left', room1: 'main_hall', room2: 'left_wing', open: true, locked: false, position: { x: 5, y: 6 } },
            { id: 'door_main_right', room1: 'main_hall', room2: 'right_wing', open: true, locked: false, position: { x: 12, y: 6 } },
            { id: 'door_main_engine', room1: 'main_hall', room2: 'engine_room', open: true, locked: false, position: { x: 8, y: 15 } }
        ];
    }

    /**
     * Save state before travel (for retry on defeat)
     */
    savePreTravelState() {
        try {
            const saveData = {
                credits: this.credits,
                shipHealth: this.ship.health,
                shipFuel: this.ship.fuel,
                currentPlanet: this.currentPlanet,
                currentSystem: this.currentSystem,
                crew: this.ship.crew.map(c => ({ ...c })),
                weapons: this.ship.weapons.map(w => ({ ...w })),
                // Don't save complex objects like managers
                timestamp: Date.now()
            };

            localStorage.setItem('pre_travel_save', JSON.stringify(saveData));
            console.log('[Save] Pre-travel state saved');
        } catch (e) {
            console.error('[Save] Failed to save pre-travel state:', e);
        }
    }

    /**
     * Load pre-travel save (retry combat)
     */    loadPreTravelSave() {
        // Just reload - loadGame() will check for pre_travel_save and restore it
        location.reload();
    }

}

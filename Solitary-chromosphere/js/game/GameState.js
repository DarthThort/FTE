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
            cargo: 0,
            maxCargo: 50,
            level: 1,
            layout: [
                [0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 1, 2, 2, 2, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 1, 2, 3, 2, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 1, 2, 4, 2, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 1, 1, 1, 1, 1, 2, 2, 2, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0],
                [0, 0, 1, 2, 2, 3, 2, 2, 2, 2, 2, 3, 2, 2, 1, 0, 0, 0, 0, 0],
                [0, 0, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1, 0, 0, 0, 0, 0],
                [0, 0, 1, 1, 1, 4, 1, 1, 4, 1, 1, 4, 1, 1, 1, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 1, 2, 1, 0, 2, 0, 1, 2, 1, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 1, 2, 1, 0, 2, 0, 1, 2, 1, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 1, 1, 1, 4, 1, 1, 4, 1, 1, 4, 1, 1, 1, 0, 0, 0, 0, 0],
                [0, 0, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1, 0, 0, 0, 0, 0],
                [0, 0, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1, 0, 0, 0, 0, 0],
                [0, 0, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1, 0, 0, 0, 0, 0],
                [0, 0, 1, 1, 1, 1, 1, 4, 4, 4, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 1, 2, 2, 2, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 1, 2, 3, 2, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0]
            ],
            systems: [
                { x: 8, y: 2, id: 'bridge', name: 'Bridge Console', type: 'bridge', color: '#00f0ff' },
                { x: 8, y: 16, id: 'engines', name: 'Engine Control', type: 'engine', color: '#ff5500' },
                { x: 5, y: 5, id: 'weapons', name: 'Weapons Array', type: 'weapon', color: '#ff0055' },
                { x: 11, y: 5, id: 'shields', name: 'Shield Generator', type: 'shield', color: '#00ff55' }
            ],
            modules: [],
            crew: [],
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

        this.generatePortContent();
        this.listeners = [];
    }

    generatePortContent() {
        this.port.ships = [
            { id: 1, name: "Kestrel Class", type: "Frigate", cost: 1500, hull: 100, slots: 4, desc: "Versatile starter ship." },
            { id: 2, name: "Mantis Class", type: "Interceptor", cost: 800, hull: 60, slots: 2, desc: "Fast and deadly." },
            { id: 3, name: "Behemoth Class", type: "Hauler", cost: 2500, hull: 200, slots: 6, desc: "Heavy cargo transport." }
        ];

        this.port.crew = [
            {
                id: 1,
                name: "Bolt",
                species: "Human",
                gender: "Male",
                age: 32,
                role: "Engineer",
                health: 100,
                maxHealth: 100,
                morale: 85,
                cost: 150,
                skills: {
                    engineering: { level: 5, xp: 0, xpToNext: 100 },
                    piloting: { level: 2, xp: 0, xpToNext: 100 },
                    combat: { level: 1, xp: 0, xpToNext: 100 },
                    medical: { level: 1, xp: 0, xpToNext: 100 }
                },
                background: "Former military engineer turned freelancer."
            },
            {
                id: 2,
                name: "Nova",
                species: "Human",
                gender: "Female",
                age: 28,
                role: "Pilot",
                health: 100,
                maxHealth: 100,
                morale: 90,
                cost: 200,
                skills: {
                    piloting: { level: 7, xp: 0, xpToNext: 100 },
                    engineering: { level: 2, xp: 0, xpToNext: 100 },
                    combat: { level: 3, xp: 0, xpToNext: 100 },
                    medical: { level: 1, xp: 0, xpToNext: 100 }
                },
                background: "Ace pilot with racing history."
            },
            {
                id: 3,
                name: "Xar'thos",
                species: "Alien",
                gender: "Male",
                age: 45,
                role: "Gunner",
                health: 120,
                maxHealth: 120,
                morale: 75,
                cost: 180,
                skills: {
                    combat: { level: 6, xp: 0, xpToNext: 100 },
                    piloting: { level: 2, xp: 0, xpToNext: 100 },
                    engineering: { level: 1, xp: 0, xpToNext: 100 },
                    medical: { level: 1, xp: 0, xpToNext: 100 }
                },
                background: "Veteran soldier seeking new horizons."
            },
            {
                id: 4,
                name: "Dr. Chen",
                species: "Human",
                gender: "Female",
                age: 41,
                role: "Medic",
                health: 90,
                maxHealth: 90,
                morale: 95,
                cost: 220,
                skills: {
                    medical: { level: 8, xp: 0, xpToNext: 100 },
                    engineering: { level: 1, xp: 0, xpToNext: 100 },
                    piloting: { level: 1, xp: 0, xpToNext: 100 },
                    combat: { level: 2, xp: 0, xpToNext: 100 }
                },
                background: "Experienced field medic from the outer colonies."
            },
            {
                id: 5,
                name: "Rax",
                species: "Robot",
                gender: "N/A",
                age: 12,
                role: "Engineer",
                health: 150,
                maxHealth: 150,
                morale: 100,
                cost: 300,
                skills: {
                    engineering: { level: 9, xp: 50, xpToNext: 100 },
                    piloting: { level: 3, xp: 0, xpToNext: 100 },
                    combat: { level: 1, xp: 0, xpToNext: 100 },
                    medical: { level: 0, xp: 0, xpToNext: 100 }
                },
                background: "Advanced maintenance droid with adaptive learning."
            },
            {
                id: 6,
                name: "Luna Swift",
                species: "Human",
                gender: "Female",
                age: 24,
                role: "Pilot",
                health: 95,
                maxHealth: 95,
                morale: 88,
                cost: 160,
                skills: {
                    piloting: { level: 6, xp: 30, xpToNext: 100 },
                    combat: { level: 4, xp: 0, xpToNext: 100 },
                    engineering: { level: 1, xp: 0, xpToNext: 100 },
                    medical: { level: 1, xp: 0, xpToNext: 100 }
                },
                background: "Young hotshot pilot looking for adventure."
            },
            {
                id: 7,
                name: "Grimm",
                species: "Alien",
                gender: "Male",
                age: 52,
                role: "Gunner",
                health: 140,
                maxHealth: 140,
                morale: 70,
                cost: 190,
                skills: {
                    combat: { level: 8, xp: 80, xpToNext: 100 },
                    engineering: { level: 2, xp: 0, xpToNext: 100 },
                    piloting: { level: 3, xp: 0, xpToNext: 100 },
                    medical: { level: 1, xp: 0, xpToNext: 100 }
                },
                background: "Grizzled mercenary with countless battles under his belt."
            },
            {
                id: 8,
                name: "Kai",
                species: "Human",
                gender: "Male",
                age: 29,
                role: "Engineer",
                health: 100,
                maxHealth: 100,
                morale: 82,
                cost: 140,
                skills: {
                    engineering: { level: 4, xp: 60, xpToNext: 100 },
                    piloting: { level: 3, xp: 0, xpToNext: 100 },
                    combat: { level: 2, xp: 0, xpToNext: 100 },
                    medical: { level: 1, xp: 0, xpToNext: 100 }
                },
                background: "Self-taught mechanic from a backwater station."
            },
            {
                id: 9,
                name: "Zara",
                species: "Alien",
                gender: "Female",
                age: 35,
                role: "Medic",
                health: 85,
                maxHealth: 85,
                morale: 92,
                cost: 175,
                skills: {
                    medical: { level: 6, xp: 40, xpToNext: 100 },
                    engineering: { level: 2, xp: 0, xpToNext: 100 },
                    piloting: { level: 1, xp: 0, xpToNext: 100 },
                    combat: { level: 3, xp: 0, xpToNext: 100 }
                },
                background: "Compassionate healer with knowledge of alien biology."
            },
            {
                id: 10,
                name: "Ghost",
                species: "Human",
                gender: "Male",
                age: 38,
                role: "Pilot",
                health: 80,
                maxHealth: 80,
                morale: 65,
                cost: 250,
                skills: {
                    piloting: { level: 9, xp: 90, xpToNext: 100 },
                    combat: { level: 5, xp: 50, xpToNext: 100 },
                    engineering: { level: 2, xp: 0, xpToNext: 100 },
                    medical: { level: 1, xp: 0, xpToNext: 100 }
                },
                background: "Mysterious pilot who rarely speaks of their past."
            }
        ];

        this.port.contracts = [
            { id: 1, title: "Cargo Haul", description: "Deliver supplies to Sector 7.", reward: 500, difficulty: 1 },
            { id: 2, title: "Bounty Hunt", description: "Destroy the pirate vessel 'Red Skull'.", reward: 1200, difficulty: 3 },
            { id: 3, title: "Escort Duty", description: "Protect the mining convoy.", reward: 800, difficulty: 2 }
        ];
    }

    subscribe(callback) {
        this.listeners.push(callback);
    }

    notify() {
        this.listeners.forEach(cb => cb(this));
    }

    notifyObservers() {
        this.notify();
    }

    updateCredits(amount) {
        this.credits += amount;
        this.notify();
    }

    damageShip(amount) {
        this.ship.health = Math.max(0, this.ship.health - amount);
        this.notify();
    }

    buyItem(itemId, amount) {
        const item = this.market.find(i => i.id === itemId);
        if (!item || item.stock < amount) return false;

        const cost = item.price * amount;
        if (this.credits < cost) return false;

        this.credits -= cost;
        item.stock -= amount;
        this.notify();
        return true;
    }

    sellItem(itemId, amount) {
        this.notify();
        return true;
    }

    uninstallSystem(system) {
        this.ship.systems = this.ship.systems.filter(s => s !== system);
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
        this.notify();
    }

    getSystemColor(type) {
        switch (type) {
            case 'bridge': return '#00f0ff';
            case 'engine': return '#ff5500';
            case 'weapon': return '#ff0055';
            case 'shield': return '#00ff55';
            default: return '#ffffff';
        }
    }

    hireCrew(crewId) {
        const crew = this.port.crew.find(c => c.id === crewId);
        if (!crew) return { success: false, message: 'Crew member not found!' };

        if (this.ship.crew.length >= this.ship.maxCrew) {
            return { success: false, message: 'Crew quarters are full!' };
        }

        if (this.credits < crew.cost) {
            return { success: false, message: 'Insufficient credits!' };
        }

        this.credits -= crew.cost;
        this.ship.crew.push({
            ...crew,
            x: 250,
            y: 160,
            targetX: null,
            targetY: null,
            path: [],
            speed: 1.5,
            state: 'idle',
            wanderTimer: 0,
            doorWaitTimer: 0
        });
        this.port.crew = this.port.crew.filter(c => c.id !== crewId);
        this.notify();

        return { success: true, message: `${crew.name} has joined your crew!` };
    }

    assignCrewToSystem(crewId, systemId) {
        const crew = this.ship.crew.find(c => c.id === crewId);
        const system = this.ship.systems.find(s => s.id === systemId);

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

        this.notify();

        return { success: true, message: `${crew.name} assigned to ${system.name}` };
    }

    unassignCrewFromSystem(systemId) {
        const system = this.ship.systems.find(s => s.id === systemId);

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
        this.notify();

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

                    // Check if next tile is a closed door
                    const nextTile = this.ship.layout[nextNode.y]?.[nextNode.x];

                    if (nextTile === 4) {
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

                    const nextX = nextNode.x * 32 + 16 + (nextNode.offsetX || 0);
                    const nextY = nextNode.y * 32 + 16 + (nextNode.offsetY || 0);

                    const dx = nextX - crew.x;
                    const dy = nextY - crew.y;
                    const distance = Math.sqrt(dx * dx + dy * dy);

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
}

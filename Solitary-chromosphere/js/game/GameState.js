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
            // Layout: 0=Void, 1=Wall, 2=Floor, 3=Slot, 4=Door(Closed), 5=Door(Open)
            layout: [
                [0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 1, 2, 2, 2, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 1, 2, 3, 2, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0], // Bridge
                [0, 0, 0, 0, 0, 0, 1, 2, 4, 2, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0], // Door (8,3)
                [0, 0, 1, 1, 1, 1, 1, 2, 2, 2, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0],
                [0, 0, 1, 2, 2, 3, 2, 2, 2, 2, 2, 3, 2, 2, 1, 0, 0, 0, 0, 0],
                [0, 0, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1, 0, 0, 0, 0, 0],
                [0, 0, 1, 1, 1, 4, 1, 1, 4, 1, 1, 4, 1, 1, 1, 0, 0, 0, 0, 0], // Doors to corridors
                [0, 0, 0, 0, 1, 2, 1, 0, 2, 0, 1, 2, 1, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 1, 2, 1, 0, 2, 0, 1, 2, 1, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 1, 1, 1, 4, 1, 1, 4, 1, 1, 4, 1, 1, 1, 0, 0, 0, 0, 0], // Doors to cargo
                [0, 0, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1, 0, 0, 0, 0, 0],
                [0, 0, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1, 0, 0, 0, 0, 0],
                [0, 0, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1, 0, 0, 0, 0, 0],
                [0, 0, 1, 1, 1, 1, 1, 4, 4, 4, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0], // Wide door to engine
                [0, 0, 0, 0, 0, 0, 1, 2, 2, 2, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 1, 2, 3, 2, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0], // Engine
                [0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0]
            ],
            systems: [
                { x: 8, y: 2, id: 'bridge', name: 'Bridge Console', type: 'bridge', color: '#00f0ff' },
                { x: 8, y: 16, id: 'engines', name: 'Engine Control', type: 'engine', color: '#ff5500' },
                { x: 5, y: 5, id: 'weapons', name: 'Weapons Array', type: 'weapon', color: '#ff0055' },
                { x: 11, y: 5, id: 'shields', name: 'Shield Generator', type: 'shield', color: '#00ff55' }
            ],
            modules: [], // Installed modules
            crew: [], // Hired crew members
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

        // Initialize Port Content
        this.generatePortContent();

        // Simple observer pattern for UI updates
        this.listeners = [];
    }

    generatePortContent() {
        // Mock Data Generation
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

        // Simplified inventory check
        this.credits -= cost;
        item.stock -= amount;

        // Add to inventory logic (simplified)
        this.notify();
        return true;
    }

    sellItem(itemId, amount) {
        // Simplified
        this.notify();
        return true;
    }

    uninstallSystem(system) {
        this.ship.systems = this.ship.systems.filter(s => s !== system);
        this.notify();
    }

    installSystem(item, x, y) {
        // Check if slot is empty
        if (this.ship.systems.find(s => s.x === x && s.y === y)) return false;

        // Add to systems
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
            this.ship.layout[y][x] = 5; // Open
        } else if (tile === 5) {
            this.ship.layout[y][x] = 4; // Close
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

    // === CREW MANAGEMENT ===

    hireCrew(crewId) {
        const crew = this.port.crew.find(c => c.id === crewId);
        if (!crew) return { success: false, message: 'Crew member not found!' };

        if (this.ship.crew.length >= this.ship.maxCrew) {
            return { success: false, message: 'Crew quarters are full!' };
        }

        if (this.credits < crew.cost) {
            return { success: false, message: 'Insufficient credits!' };
        }

        // Hire the crew
        this.credits -= crew.cost;
        this.ship.crew.push({ ...crew }); // Deep copy
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

        // Check if system already has assigned crew
        if (system.assignedCrew) {
            return { success: false, message: 'System already has assigned crew!' };
        }

        // Assign crew
        system.assignedCrew = crew;
        this.notify();

        return { success: true, message: `${crew.name} assigned to ${system.name}` };
    }

    unassignCrewFromSystem(systemId) {
        const system = this.ship.systems.find(s => s.id === systemId);

        if (!system || !system.assignedCrew) {
            return { success: false, message: 'No crew assigned to this system!' };
        }

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
}

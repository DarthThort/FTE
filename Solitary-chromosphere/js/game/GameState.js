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
            modules: [] // Installed modules
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
            { id: 1, name: "John Doe", role: "Engineer", skill: 5, cost: 100, desc: "Reliable with a wrench." },
            { id: 2, name: "Jane Smith", role: "Pilot", skill: 7, cost: 150, desc: "Ace pilot." },
            { id: 3, name: "Xar'thos", role: "Gunner", skill: 6, cost: 120, desc: "Never misses." }
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
}

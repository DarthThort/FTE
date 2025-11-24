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
            crew: [],
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
                { x: 8, y: 2, id: 'bridge', name: 'Bridge Console', type: 'bridge', color: '#00f0ff', assignedCrew: null },
                { x: 8, y: 16, id: 'engines', name: 'Engine Control', type: 'engine', color: '#ff5500', assignedCrew: null },
                { x: 5, y: 5, id: 'weapons', name: 'Weapons Array', type: 'weapon', color: '#ff0055', assignedCrew: null },
                { x: 11, y: 5, id: 'shields', name: 'Shield Generator', type: 'shield', color: '#00ff55', assignedCrew: null }
            ],
            modules: []
        };

        this.inventory = [
            { id: 'fuel', name: 'Fuel Cells', quantity: 10, value: 50 },
            { id: 'rations', name: 'Rations', quantity: 20, value: 10 },
            { id: 'engine_mod_mk1', name: 'Engine Booster Mk1', quantity: 1, value: 200, type: 'module', systemType: 'engine' },
            { id: 'weapon_mod_laser', name: 'Pulse Laser', quantity: 1, value: 350, type: 'module', systemType: 'weapon' }
        ];

        this.port = { ships: [], crew: [], contracts: [] };
        this.activeContracts = [];
        this.market = [
            { id: 'fuel', name: 'Fuel Cells', price: 55, stock: 100 },
            { id: 'rations', name: 'Rations', price: 12, stock: 200 },
            { id: 'scrap', name: 'Scrap Metal', price: 25, stock: 50 },
            { id: 'electronics', name: 'Microchips', price: 150, stock: 10 }
        ];

        this.generatePortContent();
        this.listeners = [];
        this.crewMembers = [];
    }

    generatePortContent() {
        this.port.ships = [
            { id: 1, name: "Dart Scout", type: "Scout", cost: 500, hull: 40, slots: 1, desc: "Cheap and nimble. Good for beginners." },
            { id: 2, name: "Mantis Interceptor", type: "Interceptor", cost: 800, hull: 60, slots: 2, desc: "Fast attack ship with light armor." },
            { id: 3, name: "Kestrel Frigate", type: "Frigate", cost: 1500, hull: 100, slots: 4, desc: "Balanced and versatile workhorse." },
            { id: 4, name: "Viper Corvette", type: "Corvette", cost: 1800, hull: 90, slots: 3, desc: "Agile combat vessel with superior firepower." },
            { id: 5, name: "Hauler MK-II", type: "Freighter", cost: 2000, hull: 120, slots: 6, desc: "Dedicated cargo transport." },
            { id: 6, name: "Titan Destroyer", type: "Destroyer", cost: 3500, hull: 180, slots: 5, desc: "Heavy combat ship with thick armor." },
            { id: 7, name: "Mining Barge", type: "Industrial", cost: 3000, hull: 150, slots: 4, desc: "Specialized for asteroid mining operations." },
            { id: 8, name: "Stealth Phantom", type: "Stealth", cost: 4200, hull: 70, slots: 3, desc: "Advanced cloaking technology." },
            { id: 9, name: "Colossus Battleship", type: "Battleship", cost: 6500, hull: 250, slots: 7, desc: "Massive warship. Slow but devastating." },
            { id: 10, name: "Nexus Carrier", type: "Carrier", cost: 7000, hull: 200, slots: 8, desc: "Supports fighter drones and large crew." },
            { id: 11, name: "Leviathan Dreadnought", type: "Dreadnought", cost: 9000, hull: 300, slots: 6, desc: "The ultimate combat vessel." },
            { id: 12, name: "Quantum Explorer", type: "Explorer", cost: 5500, hull: 110, slots: 5, desc: "Long-range exploration ship with advanced sensors." }
        ];

        const crewPool = [
            {
                id: 1, name: "Marcus Kane", role: "Engineer", skill: 5, cost: 100, desc: "Veteran mechanic from the outer colonies.",
                gender: "Male", species: "Human", age: 42, background: "20 years maintaining colony ships"
            },
            {
                id: 2, name: "Dr. Sarah Chen", role: "Engineer", skill: 8, cost: 250, desc: "PhD in quantum mechanics. Expensive but worth it.",
                gender: "Female", species: "Human", age: 35, background: "Former research scientist"
            },
            {
                id: 3, name: "Bolt", role: "Engineer", skill: 3, cost: 50, desc: "Self-taught tinkerer. Cheap labor.",
                gender: "Male", species: "Android", age: 5, background: "Decommissioned service droid"
            },
            {
                id: 4, name: "Jane 'Ace' Morrison", role: "Pilot", skill: 9, cost: 300, desc: "Former military pilot. Nerves of steel.",
                gender: "Female", species: "Human", age: 38, background: "Ex-Navy fighter pilot"
            },
            {
                id: 5, name: "Zara Volkov", role: "Pilot", skill: 6, cost: 150, desc: "Experienced smuggler with quick reflexes.",
                gender: "Female", species: "Human", age: 29, background: "Smuggler for 10 years"
            },
            {
                id: 6, name: "Rookie Tom", role: "Pilot", skill: 2, cost: 60, desc: "Fresh out of flight academy.",
                gender: "Male", species: "Human", age: 22, background: "Just graduated academy"
            },
            {
                id: 7, name: "Xar'thos", role: "Gunner", skill: 7, cost: 180, desc: "Alien mercenary. Never misses.",
                gender: "Male", species: "Kryllian", age: 45, background: "Mercenary for 20 years"
            },
            {
                id: 8, name: "Dimitri Kasparov", role: "Gunner", skill: 5, cost: 120, desc: "Former artillery officer.",
                gender: "Male", species: "Human", age: 50, background: "Ex-military artillery"
            },
            {
                id: 9, name: "Dr. Elena Vasquez", role: "Doctor", skill: 8, cost: 220, desc: "Top-tier medic. Keeps crew alive.",
                gender: "Female", species: "Human", age: 40, background: "Chief medical officer"
            },
            {
                id: 10, name: "Nurse Petrovsky", role: "Doctor", skill: 4, cost: 90, desc: "Combat medic with field experience.",
                gender: "Non-binary", species: "Human", age: 32, background: "Battlefield medic"
            },
            {
                id: 11, name: "Nav Officer Park", role: "Navigator", skill: 7, cost: 160, desc: "Expert in hyperspace routes.",
                gender: "Male", species: "Human", age: 47, background: "Navigation specialist"
            },
            {
                id: 12, name: "Prof. Aldrin", role: "Scientist", skill: 9, cost: 280, desc: "Brilliant researcher in xenobiology.",
                gender: "Male", species: "Human", age: 55, background: "Xenobiology professor"
            },
            {
                id: 13, name: "Kai Tanaka", role: "Navigator", skill: 5, cost: 110, desc: "Reliable pathfinder.",
                gender: "Female", species: "Human", age: 30, background: "Scout navigator"
            },
            {
                id: 14, name: "Security Chief Ramos", role: "Security", skill: 6, cost: 140, desc: "Former station guard. Handles boarders.",
                gender: "Male", species: "Human", age: 44, background: "Station security chief"
            },
            {
                id: 15, name: "Comms Officer Wei", role: "Comms", skill: 5, cost: 100, desc: "Skilled negotiator and hacker.",
                gender: "Female", species: "Human", age: 27, background: "Communications expert"
            }
        ];

        crewPool.forEach(crew => {
            crew.health = 100;
            crew.maxHealth = 100;
            crew.morale = Math.floor(Math.random() * 30 + 60);

            const primarySkill = this.getRolePrimarySkill(crew.role);
            crew.skills = {
                engineering: { level: primarySkill === 'engineering' ? crew.skill : Math.max(1, Math.floor(crew.skill / 2)), xp: 0, xpToNext: 100 },
                combat: { level: primarySkill === 'combat' ? crew.skill : Math.max(1, Math.floor(crew.skill / 2)), xp: 0, xpToNext: 100 },
                medical: { level: primarySkill === 'medical' ? crew.skill : Math.max(1, Math.floor(crew.skill / 2)), xp: 0, xpToNext: 100 },
                piloting: { level: primarySkill === 'piloting' ? crew.skill : Math.max(1, Math.floor(crew.skill / 2)), xp: 0, xpToNext: 100 }
            };
        });

        const availableCount = 8 + Math.floor(Math.random() * 3);
        this.port.crew = this.shuffleArray([...crewPool]).slice(0, availableCount);

        const contractTemplates = [
            {
                type: "cargo", titles: ["Cargo Run to {dest}", "Emergency Supplies Needed"],
                descs: ["Deliver cargo to {dest}.", "Rush delivery required."], rewardBase: 200, diffRange: [1, 2]
            },
            {
                type: "bounty", titles: ["Hunt the {target}", "Eliminate {target}"],
                descs: ["Dangerous pirate spotted in sector.", "Wanted dead or alive."], rewardBase: 800, diffRange: [2, 4]
            },
            {
                type: "escort", titles: ["Escort {target}", "Protect Convoy"],
                descs: ["Guard civilian ships.", "Defend against raiders."], rewardBase: 500, diffRange: [2, 3]
            },
            {
                type: "salvage", titles: ["Salvage Operation", "Recover Lost Cargo"],
                descs: ["Retrieve valuable materials.", "Search derelict vessel."], rewardBase: 400, diffRange: [1, 3]
            },
            {
                type: "recon", titles: ["Scout {dest}", "Survey Mission"],
                descs: ["Chart unexplored territory.", "Gather intelligence."], rewardBase: 300, diffRange: [1, 2]
            }
        ];

        const destinations = ["Sector 7", "Alpha Station", "Beta Outpost", "Nebula X", "The Frontier", "Juno Colony"];
        const targets = ["Red Skull", "The Marauder", "Ghost Ship", "Pirate Lord Vex", "Rogue AI"];
        const contractCount = 5 + Math.floor(Math.random() * 3);
        this.port.contracts = [];

        for (let i = 0; i < contractCount; i++) {
            const template = contractTemplates[Math.floor(Math.random() * contractTemplates.length)];
            const titleTemplate = template.titles[Math.floor(Math.random() * template.titles.length)];
            const descTemplate = template.descs[Math.floor(Math.random() * template.descs.length)];
            const dest = destinations[Math.floor(Math.random() * destinations.length)];
            const target = targets[Math.floor(Math.random() * targets.length)];
            const title = titleTemplate.replace("{dest}", dest).replace("{target}", target);
            const description = descTemplate.replace("{dest}", dest).replace("{target}", target);
            const difficulty = template.diffRange[0] + Math.floor(Math.random() * (template.diffRange[1] - template.diffRange[0] + 1));
            const reward = Math.floor(template.rewardBase * (1 + (difficulty - 1) * 0.5));

            this.port.contracts.push({ id: i + 1, title, description, reward, difficulty, type: template.type });
        }
    }

    getRolePrimarySkill(role) {
        switch (role) {
            case 'Engineer': return 'engineering';
            case 'Pilot': case 'Navigator': return 'piloting';
            case 'Gunner': case 'Security': return 'combat';
            case 'Doctor': return 'medical';
            default: return 'engineering';
        }
    }

    shuffleArray(array) {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }

    subscribe(callback) { this.listeners.push(callback); }
    notify() { this.listeners.forEach(cb => cb(this)); }
    updateCredits(amount) { this.credits += amount; this.notify(); }
    damageShip(amount) { this.ship.health = Math.max(0, this.ship.health - amount); this.notify(); }

    buyShip(shipId) {
        const ship = this.port.ships.find(s => s.id === shipId);
        if (!ship) return { success: false, message: 'Ship not found!' };
        if (this.credits < ship.cost) return { success: false, message: `Insufficient credits! Need ${ship.cost} CR.` };

        this.credits -= ship.cost;
        this.ship.name = ship.name;
        this.ship.type = ship.type;
        this.ship.maxHealth = ship.hull;
        this.ship.health = ship.hull;
        this.ship.maxCargo = ship.slots * 25;
        this.notify();
        return { success: true, message: `Purchased ${ship.name}!` };
    }

    hireCrew(crewId) {
        const crew = this.port.crew.find(c => c.id === crewId);
        if (!crew) return { success: false, message: 'Crew member not found!' };
        if (this.credits < crew.cost) return { success: false, message: `Insufficient credits! Need ${crew.cost} CR.` };
        if (this.ship.crew.length >= 5) return { success: false, message: 'Crew roster full! (Max 5)' };

        this.credits -= crew.cost;
        this.ship.crew.push({ ...crew });

        const crewMember = new CrewMember({ ...crew, x: 8, y: 12 }, this);
        this.crewMembers.push(crewMember);
        this.port.crew = this.port.crew.filter(c => c.id !== crewId);
        this.notify();
        return { success: true, message: `Hired ${crew.name}!` };
    }

    acceptContract(contractId) {
        const contract = this.port.contracts.find(c => c.id === contractId);
        if (!contract) return { success: false, message: 'Contract not found!' };

        this.activeContracts.push({ ...contract, status: 'active' });
        this.port.contracts = this.port.contracts.filter(c => c.id !== contractId);
        this.notify();
        return { success: true, message: `Contract accepted: ${contract.title}` };
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
        // Simplified
        return false;
    }

    installSystem(item, x, y) {
        if (this.ship.systems.find(s => s.x === x && s.y === y)) return false;
        this.ship.systems.push({
            x, y, id: item.systemType + '_' + Date.now(),
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

    assignCrewToSystem(crewId, systemId) {
        const crew = this.ship.crew.find(c => c.id === crewId);
        const system = this.ship.systems.find(s => s.id === systemId);
        if (!crew) return { success: false, message: 'Crew member not found!' };
        if (!system) return { success: false, message: 'System not found!' };

        const currentAssignment = this.ship.systems.find(s => s.assignedCrew?.id === crewId);
        if (currentAssignment) return { success: false, message: `${crew.name} is already assigned to ${currentAssignment.name}!` };
        if (system.assignedCrew) return { success: false, message: `${system.name} already has ${system.assignedCrew.name} assigned!` };

        system.assignedCrew = { id: crew.id, name: crew.name, role: crew.role, skill: crew.skill };
        const crewMember = this.crewMembers.find(cm => cm.id === crewId);
        if (crewMember) crewMember.assignToStation(system.x, system.y);
        this.notify();
        return { success: true, message: `${crew.name} assigned to ${system.name}!` };
    }

    unassignCrewFromSystem(systemId) {
        const system = this.ship.systems.find(s => s.id === systemId);
        if (!system) return { success: false, message: 'System not found!' };
        if (!system.assignedCrew) return { success: false, message: 'No crew assigned to this system!' };

        const crewName = system.assignedCrew.name;
        const crewId = system.assignedCrew.id;
        system.assignedCrew = null;
        const crewMember = this.crewMembers.find(cm => cm.id === crewId);
        if (crewMember) crewMember.unassign();
        this.notify();
        return { success: true, message: `${crewName} unassigned from ${system.name}!` };
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

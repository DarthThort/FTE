class GameState {
    constructor() {
        this.credits = 10000; // Testing: Start with more credits
        this.scrap = 0; // Phase 11: Scrap resource for upgrades
        this.fuel = 100; // Starting fuel
        // State modules
        this.saveManager = null;  // Will be initialized after all properties
        this.portGenerator = null;
        this.moduleManager = null;
        this.pathfinding = null;
        this.shipLayoutManager = null;

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
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 2, 3, 2, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 2, 2, 2, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 2, 2, 3, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 2, 2, 2, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 1, 2, 3, 2, 2, 2, 2, 2, 2, 2, 3, 2, 1, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 4, 1, 1, 4, 1, 1, 4, 1, 1, 1, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 2, 1, 3, 2, 3, 1, 2, 1, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 2, 1, 2, 2, 2, 1, 2, 1, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 4, 1, 1, 4, 1, 1, 4, 1, 1, 1, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 1, 7, 7, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 1, 7, 7, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 4, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 2, 2, 2, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 2, 3, 2, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
            ],
            systems: [
                { x: 13, y: 4, id: 'bridge', name: 'Consola de Puente', type: 'bridge', color: '#00f0ff', level: 1, maxPower: 1, currentPower: 1, health: 100, maxHealth: 100, damaged: false, ionized: 0, effectiveness: 1.0 },
                { x: 13, y: 19, id: 'engines', name: 'Control de Motores', type: 'engine', color: '#ff5500', level: 1, maxPower: 2, currentPower: 1, health: 100, maxHealth: 100, damaged: false, ionized: 0, effectiveness: 0.75 },
                { x: 9, y: 8, id: 'weapons1', name: 'Matriz de Armas 1', type: 'weapon', color: '#ff0055', level: 1, maxPower: 2, currentPower: 1, health: 100, maxHealth: 100, damaged: false, ionized: 0, effectiveness: 0.75 },
                { x: 17, y: 8, id: 'weapons2', name: 'Matriz de Armas 2', type: 'weapon', color: '#ff0055', level: 1, maxPower: 2, currentPower: 1, health: 100, maxHealth: 100, damaged: false, ionized: 0, effectiveness: 0.75 },
                { x: 14, y: 6, id: 'shields', name: 'Generador de Escudos', type: 'shield', color: '#00ff55', level: 2, maxPower: 2, currentPower: 1, health: 100, maxHealth: 100, damaged: false, ionized: 0, effectiveness: 0.75 },
                { x: 14, y: 11, id: 'jump', name: 'Motor FTL', type: 'jumpdrive', color: '#ff00ff', level: 1, maxPower: 1, currentPower: 1, health: 100, maxHealth: 100, damaged: false, ionized: 0, effectiveness: 1.0 },
                { x: 12, y: 11, id: 'reactor', name: 'Núcleo del Reactor', type: 'reactor', color: '#ffaa00', level: 1, maxPower: 1, currentPower: 1, health: 100, maxHealth: 100, damaged: false, ionized: 0, effectiveness: 1.0 }
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
                layerHP: 5,  // Damage each layer can absorb
                currentLayerHP: 5,  // HP of topmost layer
                rechargeRate: 2.0,  // Base recharge rate (seconds per layer)
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

            // Module hardpoints - Start with basic modules installed
            hardpoints: {
                weapon1: 'laser_mk1',    // Start with basic laser
                weapon2: null,           // Empty second slot
                shield: 'shield_basic',  // Pre-installed basic modules
                engine: 'engine_basic',
                jumpDrive: 'jumpdrive_basic',
                reactor: 'reactor_basic',
                bridge: 'bridge_basic'
            },

            maxWeaponHardpoints: 2,

            // Stats computed from equipped modules (recalculated on module change)
            totalPower: 8,
            fleeChance: 0.3,
            o2Regen: 1.0,
            dialogueBonus: 0,

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

        // Owned modules (purchased but not equipped)
        this.ownedModules = [];

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
        this.moduleManager = new ModuleManager(this);
        this.pathfinding = new Pathfinding(this);
        this.shipLayoutManager = new ShipLayoutManager(this);
        this.saveManager = new SaveManager(this);
        this.crewManager = new CrewManager(this);

        // Combat system managers
        this.encounterManager = new EncounterManager(this);
        this.combatManager = null; // Created when combat starts
        this.currentEnemy = null; // Current enemy ship in combat

        // Detect and initialize rooms AFTER all managers are created
        this.ship.rooms = this.lifeSupportManager.detectRooms();
        this.ship.doors = this.generateDoors();
        console.log(`Detected ${this.ship.rooms.length} rooms in ship`);

        // Initialize hazard manager for breaches, fires, and oxygen
        this.hazardManager = new HazardManager(this);
        this.hazardUI = new HazardUI(this);

        // Star Systems
        this.galaxy = null;
        this.currentSystem = null;
        this.currentPlanet = null;

        // Initialize listeners BEFORE loadGame
        this.listeners = [];

        // Generate initial port content
        this.portGenerator.generatePortContent();

        // Load saved game
        this.loadGame();

        // Initialize weapons from equipped modules
        this.recalculateShipStats();

        // Log system coordinates for debugging
        console.log('═══════════════════════════════════════');
        console.log('SHIP SYSTEMS COORDINATES:');
        console.log('═══════════════════════════════════════');
        this.ship.systems.forEach(sys => {
            console.log(`${sys.name.padEnd(25)} (${sys.x}, ${sys.y})`);
        });
        console.log('═══════════════════════════════════════');
    }

    loadGame() {
        // Delegate to SaveManager
        const loaded = this.saveManager.loadGame();

        // If no save exists, initialize galaxy
        if (!loaded) {
            console.log('[GameState] No save found - initializing new game');
            this.galaxyManager.initializeGalaxy();
        }

        // Handle pre-travel save (retry mechanism)
        if (loaded) {
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

        return loaded;
    }

    saveGame() {
        this.saveManager.saveGame();
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
        if (this.ship.health <= 0) {
            this.triggerShipDestruction();
        }
    }

    triggerShipDestruction() {
        console.warn('[GameState] SHIP DESTROYED! Displaying Game Over modal...');
        if (this.combatManager) {
            this.combatManager.paused = true;
        }
        if (window.game && window.game.ui) {
            window.game.ui.showShipDestroyedModal();
        }
    }

    savePreTravelState() {
        try {
            const saveData = {
                credits: this.credits,
                scrap: this.scrap,
                fuel: this.fuel,
                shipHealth: this.ship.health > 0 ? this.ship.health : (this.ship.maxHealth || 100),
                shipFuel: this.ship.fuel,
                currentPlanet: this.currentPlanet,
                currentSystem: this.currentSystem,
                crew: this.ship.crew.map(c => ({ ...c })),
                timestamp: Date.now()
            };
            localStorage.setItem('system_checkpoint_save', JSON.stringify(saveData));
            console.log('[GameState] System entry checkpoint saved');
        } catch (e) {
            console.error('[GameState] Failed to save system checkpoint:', e);
        }
    }

    restoreSystemEntryPoint() {
        console.log('[GameState] Restoring system entry checkpoint...');
        const checkpointData = localStorage.getItem('system_checkpoint_save') || localStorage.getItem('pre_travel_save');
        
        // Restore hull health back to 100% or checkpoint value
        this.ship.health = this.ship.maxHealth || 100;

        // Extinguish fires and repair breaches
        if (this.hazardManager) {
            this.hazardManager.fires = [];
            this.hazardManager.breaches = [];
        }

        // Close active combat
        if (this.combatManager) {
            this.combatManager.active = false;
            this.combatManager.paused = false;
        }

        if (checkpointData) {
            try {
                const data = JSON.parse(checkpointData);
                if (data.credits !== undefined) this.credits = data.credits;
                if (data.fuel !== undefined) this.fuel = data.fuel;
                if (data.shipHealth !== undefined) this.ship.health = data.shipHealth;
            } catch (e) {
                console.error('[GameState] Error parsing checkpoint:', e);
            }
        }

        this.saveGame();
        this.notify();

        if (window.game && window.game.sceneManager) {
            window.game.sceneManager.changeScene('PORT');
        }
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

    upgradeSystem(systemId) {
        const system = this.ship.systems.find(s => s.id === systemId);
        if (!system) return { success: false, message: 'Sistema no encontrado' };

        const currentLevel = system.level || 1;
        const scrapCost = currentLevel * 30;

        if (this.scrap < scrapCost) {
            return { success: false, message: `Chatarra insuficiente (tienes ${this.scrap}, requiere ${scrapCost})` };
        }

        this.scrap -= scrapCost;
        system.level = currentLevel + 1;
        system.maxPower = (system.maxPower || 1) + 1;

        if (system.type === 'reactor') {
            this.ship.reactor.maxPower += 1;
        }

        this.saveGame();
        this.notify();

        return { success: true, message: `¡${system.name} mejorado a Nivel ${system.level}! (+1 Potencia Máxima)` };
    }

    assignCaptainToSystem(systemId) {
        const system = this.ship.systems.find(s => s.id === systemId);
        if (!system) return { success: false, message: 'Sistema no encontrado' };

        // Unassign Captain from any previous system
        this.ship.systems.forEach(s => {
            s.assignedCaptain = false;
            if (s.assignedCrew && s.assignedCrew.id === 'captain') {
                s.assignedCrew = null;
            }
        });

        // Assign Captain to this system
        system.assignedCaptain = true;
        system.assignedCrew = {
            id: 'captain',
            name: '👨‍✈️ Capitán (Jugador)',
            role: 'Capitán',
            skills: { piloting: { level: 3 }, engineering: { level: 3 }, combat: { level: 3 } }
        };

        // Position Player character right at the console tile
        if (window.game && window.game.player) {
            window.game.player.x = system.x * 32 + 4;
            window.game.player.y = system.y * 32 + 4;
        }

        this.saveGame();
        this.notify();

        return { success: true, message: `👨‍✈️ El Capitán ha tomado el mando de ${system.name} (+25% Bonificación de Eficiencia)` };
    }

    updateCaptainConsolePresence() {
        if (!window.game || !window.game.player || !this.ship || !this.ship.systems) return;

        const player = window.game.player;
        const playerTileX = Math.floor((player.x + 12) / 32);
        const playerTileY = Math.floor((player.y + 12) / 32);

        let changed = false;

        this.ship.systems.forEach(system => {
            if (system.assignedCaptain) {
                // Calculate distance in tiles from Captain to system console
                const dist = Math.hypot(playerTileX - system.x, playerTileY - system.y);

                // If Captain moves more than 1.5 tiles away from console, remove bonus!
                if (dist > 1.5) {
                    console.log(`[Captain] Player walked away from ${system.name}. Removing bonus.`);
                    system.assignedCaptain = false;
                    if (system.assignedCrew && system.assignedCrew.id === 'captain') {
                        system.assignedCrew = null;
                    }
                    changed = true;
                    if (window.game.ui && window.game.ui.hud) {
                        window.game.ui.hud.showNotification(`Capitán se alejó de ${system.name}. Bonificación desactivada.`, 'info');
                    }
                }
            }
        });

        if (changed) {
            this.saveGame();
            this.notify();
        }
    }

    unassignCaptainFromSystem(systemId) {
        const system = this.ship.systems.find(s => s.id === systemId);
        if (!system) return { success: false, message: 'Sistema no encontrado' };

        system.assignedCaptain = false;
        if (system.assignedCrew && system.assignedCrew.id === 'captain') {
            system.assignedCrew = null;
        }

        this.saveGame();
        this.notify();

        return { success: true, message: `Capitán liberado de la consola ${system.name}` };
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
        // Delegate to CrewManager which has all the AI logic including fire fighting
        if (this.crewManager) {
            this.crewManager.updateCrewAI();
        }
    }

    /**
     * Pathfinding methods - delegated to Pathfinding module
     */
    getRandomWalkablePosition() {
        return this.pathfinding.getRandomWalkablePosition();
    }

    smoothPath(path) {
        return this.pathfinding.smoothPath(path);
    }

    findPath(startX, startY, targetX, targetY) {
        return this.pathfinding.findPath(startX, startY, targetX, targetY);
    }

    heuristic(x1, y1, x2, y2) {
        return this.pathfinding.heuristic(x1, y1, x2, y2);
    }

    isWalkable(x, y) {
        return this.pathfinding.isWalkable(x, y);
    }

    reconstructPath(node) {
        return this.pathfinding.reconstructPath(node);
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

        // Save pre-travel checkpoint before executing jump
        this.savePreTravelState();

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
     */    /**
* Load pre-travel save (retry combat)
*/
    loadPreTravelSave() {
        // Just reload - loadGame() will check for pre_travel_save and restore it
        location.reload();
    }

    /**
     * ========== MODULE SYSTEM METHODS ==========
     */

    /**
     * Buy a module from shop and add to ownedModules
     */
    buyModule(moduleId) {
        return this.moduleManager.buyModule(moduleId);
    }

    /**
     * Install a module in a hardpoint
     */
    installModule(hardpoint, moduleId) {
        return this.moduleManager.installModule(hardpoint, moduleId);
    }

    /**
     * Unequip a module from hardpoint (return to inventory)
     */
    unequipModule(hardpoint) {
        return this.moduleManager.unequipModule(hardpoint);
    }

    /**
     * Recalculate ship stats from equipped modules
     */
    recalculateShipStats() {
        this.moduleManager.recalculateShipStats();
    }

    /**
     * PHASE 11: Upgrade an installed module to next tier using scrap
     */
    upgradeModule(hardpoint) {
        return this.moduleManager.upgradeModule(hardpoint);
    }

    /**
     * Get equipped weapons as module objects with combat-ready stats
     */
    getEquippedWeapons() {
        return this.moduleManager.getEquippedWeapons();
    }
}

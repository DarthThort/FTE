/**
 * SaveManager.js
 * Handles game saving, loading, and save migration
 * Extracted from GameState.js
 */

class SaveManager {
    constructor(gameState) {
        this.state = gameState;
        this.SAVE_KEY = 'spaceSimSave';
    }

    /**
     * Save game to localStorage
     */
    saveGame() {
        const saveData = {
            credits: this.state.credits,
            scrap: this.state.scrap,
            fuel: this.state.fuel,
            ownedModules: this.state.ownedModules,
            ship: {
                name: this.state.ship.name,
                health: this.state.ship.health,
                maxHealth: this.state.ship.maxHealth,
                shield: this.state.ship.shield,
                maxShield: this.state.ship.maxShield,
                level: this.state.ship.level,
                jumpRange: this.state.ship.jumpRange,
                cargo: this.state.ship.cargo,
                crew: this.state.ship.crew,
                hardpoints: this.state.ship.hardpoints,
                maxWeaponHardpoints: this.state.ship.maxWeaponHardpoints
            },
            portCrew: this.state.port.crew,
            contracts: this.state.port.contracts,
            galaxy: this.state.galaxy,
            currentSystem: this.state.currentSystem,
            currentPlanet: {
                id: this.state.currentPlanet?.id,
                name: this.state.currentPlanet?.name
            }
        };

        localStorage.setItem(this.SAVE_KEY, JSON.stringify(saveData));
        console.log('[SaveManager] Game saved');
    }

    /**
     * Load game from localStorage
     * @returns {boolean} Success
     */
    loadGame() {
        const savedData = localStorage.getItem(this.SAVE_KEY);
        if (!savedData) {
            console.log('[SaveManager] No save found');
            return false;
        }

        try {
            const data = JSON.parse(savedData);

            // Apply migration fixes
            this.migrateSaveData(data);

            // Load basic state
            this.state.credits = data.credits;
            this.state.scrap = data.scrap || 0;
            this.state.fuel = data.fuel || 0;
            this.state.ownedModules = data.ownedModules || [];

            // Store fresh system positions before merging
            const freshSystems = [...this.state.ship.systems];

            // Merge ship data
            this.state.ship = { ...this.state.ship, ...data.ship };

            // Restore fresh system positions
            this.state.ship.systems = freshSystems;

            // Add cargo if missing (migration)
            if (!this.state.ship.cargo) {
                this.state.ship.cargo = {
                    capacity: 50,
                    items: []
                };
                console.log('[SaveManager] Migrated: added cargo system');
            }

            // Load port data
            this.state.port.crew = data.portCrew || this.state.port.crew;
            this.state.port.contracts = data.contracts || this.state.port.contracts;

            // Load galaxy data
            if (data.galaxy) {
                this.state.galaxy = data.galaxy;
                this.state.currentSystem = data.currentSystem || this.state.galaxy[0];

                // Find current planet by ID
                if (data.currentPlanet && data.currentPlanet.id) {
                    this.state.currentPlanet = this.state.currentSystem.planets?.find(
                        p => p.id === data.currentPlanet.id
                    );
                }

                // Fallback to first planet
                if (!this.state.currentPlanet && this.state.currentSystem.planets?.length > 0) {
                    this.state.currentPlanet = this.state.currentSystem.planets[0];
                    console.log('[SaveManager] Planet not found, using first planet');
                }
            } else {
                this.state.initializeGalaxy();
            }

            // Migrate crew data
            if (data.ship.crew) {
                this.state.ship.crew = this.migrateCrew(data.ship.crew);
            }

            // Move crew to assigned systems & validate walkable positions
            this.repositionAssignedCrew();

            console.log('[SaveManager] Game loaded successfully');
            return true;

        } catch (e) {
            console.error('[SaveManager] Load failed:', e);
            return false;
        }
    }

    /**
     * Apply migration fixes to save data
     */
    migrateSaveData(data) {
        // Remove old system coordinates
        if (data.ship && data.ship.systems) {
            const hasOldCoords = data.ship.systems.some(s => s.x > 19 || s.y > 19);
            if (hasOldCoords) {
                console.warn('[SaveManager] Migrating: removing outdated system positions');
                delete data.ship.systems;
            }
        }
    }

    /**
     * Migrate crew from old grid to new grid
     */
    migrateCrew(crewList) {
        return crewList.map(c => {
            let newX = c.x;
            let newY = c.y;

            // Migrate from old 20x18 coordinates if out of bounds
            if (c.x < 200 || c.y < 150) {
                newX = c.x + 160;
                newY = c.y + 96;
                console.log(`[SaveManager] Migrated ${c.name} coordinates`);
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

    /**
     * Move crew to their assigned systems or valid walkable tiles after load
     */
    repositionAssignedCrew() {
        this.state.ship.systems.forEach(system => {
            if (system.assignedCrew) {
                const crew = this.state.ship.crew.find(c => c.id === system.assignedCrew.id);
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

        // Ensure all crew members (including unassigned) are inside walkable tiles
        if (this.state.shipCoords && this.state.ship && this.state.ship.layout) {
            this.state.ship.crew.forEach(crew => {
                const tileX = Math.floor(crew.x / 32);
                const tileY = Math.floor(crew.y / 32);
                if (!this.state.shipCoords.isWalkable(this.state.ship.layout, tileX, tileY)) {
                    console.warn(`[SaveManager] Repositioning ${crew.name} to a valid walkable tile`);
                    const validTile = this.state.shipCoords.getRandomWalkableTile(this.state.ship.layout);
                    const validPos = this.state.shipCoords.tileToPixel(validTile.x, validTile.y);
                    crew.x = validPos.x;
                    crew.y = validPos.y;
                    crew.targetX = null;
                    crew.targetY = null;
                    crew.path = [];
                    crew.state = 'idle';
                }
            });
        }
    }

    /**
     * Clear save data
     */
    clearSave() {
        localStorage.removeItem(this.SAVE_KEY);
        console.log('[SaveManager] Save cleared');
    }

    /**
     * Check if save exists
     */
    hasSave() {
        return localStorage.getItem(this.SAVE_KEY) !== null;
    }
}

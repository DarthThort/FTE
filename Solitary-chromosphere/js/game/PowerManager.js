class PowerManager {
    constructor(gameState) {
        this.state = gameState;
    }

    // Reactor Management
    getMaxPower() {
        return this.state.ship.reactor.maxPower;
    }

    getAvailablePower() {
        return this.getMaxPower() - this.state.ship.reactor.usedPower;
    }

    // Power Allocation
    setPowerLevel(systemId, level) {
        const system = this.getSystem(systemId);
        if (!system) return false;

        // Validate level
        if (level < 0 || level > system.maxPower) return false;

        // Check if we have enough available power
        const powerDiff = level - system.currentPower;
        if (powerDiff > this.getAvailablePower()) return false;

        // Update power
        system.currentPower = level;
        this.recalculateUsedPower();
        this.updateSystemEffectiveness(systemId);

        // Special handling for shields
        if (system.type === 'shield') {
            this.updateShieldLayers();
        }


        if (system.currentPower > 0) {
            return this.setPowerLevel(systemId, system.currentPower - 1);
        }
        return false;
    }

    // System Effectiveness
    calculateEffectiveness(system) {
        if (!system) return 0;

        // Base effectiveness from health (0-100%)
        const healthFactor = system.health / system.maxHealth;

        // Ionized systems are offline
        if (system.ionized > 0) return 0;

        // System offline if no power
        if (system.currentPower === 0) return 0;

        // Power factor: 50% at minimum power, 100% at max power
        const powerRatio = system.currentPower / system.maxPower;
        const powerFactor = 0.5 + (powerRatio * 0.5);

        return healthFactor * powerFactor;
    }

    updateSystemEffectiveness(systemId) {
        const system = this.getSystem(systemId);
        if (system) {
            system.effectiveness = this.calculateEffectiveness(system);
        }
    }

    updateAllEffectiveness() {
        this.state.ship.systems.forEach(sys => {
            this.updateSystemEffectiveness(sys.id);
        });
    }

    // Shield-specific
    updateShieldLayers() {
        const shieldSystem = this.state.ship.systems.find(s => s.type === 'shield');
        if (!shieldSystem) return;

        const shields = this.state.ship.shields;

        // Max layers based on power allocated
        shields.maxLayers = Math.min(
            shieldSystem.level * 2, // Shield level determines max possible
            shieldSystem.currentPower  // But limited by power
        );

        // Can't have more current layers than max
        shields.currentLayers = Math.min(shields.currentLayers, shields.maxLayers);
    }

    // Damage Handling
    damageSystem(systemId, amount) {
        const system = this.getSystem(systemId);
        if (!system) return;

        system.health = Math.max(0, system.health - amount);
        system.damaged = system.health < system.maxHealth;

        // If system destroyed, remove all power
        if (system.health === 0) {
            this.setPowerLevel(systemId, 0);
        }

        this.updateSystemEffectiveness(systemId);
    }

    repairSystem(systemId, amount) {
        const system = this.getSystem(systemId);
        if (!system) return;

        system.health = Math.min(system.maxHealth, system.health + amount);
        system.damaged = system.health < system.maxHealth;
        this.updateSystemEffectiveness(systemId);
    }

    // Ion Damage
    ionizeSystem(systemId, duration) {
        const system = this.getSystem(systemId);
        if (!system) return;

        system.ionized = Math.max(system.ionized, duration);
        this.updateSystemEffectiveness(systemId);
    }

    updateIonization(deltaTime) {
        this.state.ship.systems.forEach(sys => {
            if (sys.ionized > 0) {
                sys.ionized = Math.max(0, sys.ionized - deltaTime);
                if (sys.ionized === 0) {
                    this.updateSystemEffectiveness(sys.id);
                }
            }
        });
    }

    // Helpers
    getSystem(systemId) {
        return this.state.ship.systems.find(s => s.id === systemId);
    }

    recalculateUsedPower() {
        this.state.ship.reactor.usedPower = this.state.ship.systems
            .reduce((sum, sys) => sum + sys.currentPower, 0);
    }

    // Status Information
    getSystemStatus(systemId) {
        const system = this.getSystem(systemId);
        if (!system) return null;

        return {
            name: system.name,
            type: system.type,
            health: system.health,
            maxHealth: system.maxHealth,
            currentPower: system.currentPower,
            maxPower: system.maxPower,
            effectiveness: system.effectiveness,
            damaged: system.damaged,
            ionized: system.ionized > 0,
            offline: system.currentPower === 0 || system.health === 0
        };
    }

    getPowerDistribution() {
        return {
            maxPower: this.getMaxPower(),
            usedPower: this.state.ship.reactor.usedPower,
            availablePower: this.getAvailablePower(),
            systems: this.state.ship.systems.map(sys => ({
                id: sys.id,
                name: sys.name,
                power: sys.currentPower,
                maxPower: sys.maxPower
            }))
        };
    }
}

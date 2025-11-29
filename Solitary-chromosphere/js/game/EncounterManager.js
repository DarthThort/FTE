/**
 * EncounterManager - Manages random enemy encounters during travel
 * 
 * Triggers encounters based on:
 * - System danger level
 * - Distance from safe zones
 * - Travel progress
 * - Random chance
 */

class EncounterManager {
    constructor(gameState) {
        this.state = gameState;
        this.currentEncounter = null;
        this.encounterCooldown = 0; // Prevent back-to-back encounters
    }

    /**
     * Check if an encounter should occur during travel
     * @param {number} customChance - Optional custom encounter chance (0.0-1.0)
     * @returns {EnemyShip|null} Enemy ship if encounter triggered
     */
    checkForEncounter(customChance = null) {
        // Cooldown between encounters (minimum 30 seconds)
        if (this.encounterCooldown > 0) {
            this.encounterCooldown -= 1.0;
            return null;
        }

        const system = this.state.currentSystem;
        if (!system) return null;

        // Use custom chance if provided, otherwise calculate based on system danger
        let encounterChance;
        if (customChance !== null) {
            encounterChance = customChance;
        } else {
            const baseChance = 0.30;
            const dangerMultiplier = this.getSystemDangerLevel(system);
            encounterChance = baseChance * dangerMultiplier * 0.016;
        }

        if (Math.random() < encounterChance) {
            this.encounterCooldown = 30; // 30 second cooldown
            return this.spawnEnemy(system);
        }

        return null;
    }

    /**
     * Get system danger level (0.5 - 2.0)
     */
    getSystemDangerLevel(system) {
        // Safer systems
        if (system.name === 'Sol' || system.hasStation) {
            return 0.5; // Half as dangerous
        }

        // Distance from Sol increases danger
        const distanceFromSol = system.distance || 0;

        if (distanceFromSol < 5) {
            return 0.7; // Close to Sol = safer
        } else if (distanceFromSol < 10) {
            return 1.0; // Normal danger
        } else if (distanceFromSol < 15) {
            return 1.5; // Higher danger
        } else {
            return 2.0; // Frontier = very dangerous
        }
    }

    /**
     * Spawn an enemy ship based on system
     */
    spawnEnemy(system) {
        const dangerLevel = this.getSystemDangerLevel(system);

        // Select enemy type based on danger
        const type = this.selectEnemyType(dangerLevel);
        const threatLevel = this.calculateThreatLevel(dangerLevel);

        const enemy = new EnemyShip(type, threatLevel);

        console.log(`Encounter: ${enemy.name} (${type}, threat ${threatLevel}) in ${system.name}`);

        return enemy;
    }

    /**
     * Select enemy type based on danger level
     */
    selectEnemyType(dangerLevel) {
        const roll = Math.random();

        if (dangerLevel < 1.0) {
            // Safe systems: more merchants, fewer pirates
            if (roll < 0.4) return 'merchant';
            if (roll < 0.7) return 'patrol_ship';
            if (roll < 0.9) return 'pirate_scout';
            return 'pirate_raider';
        } else if (dangerLevel < 1.5) {
            // Normal systems: balanced
            if (roll < 0.2) return 'merchant';
            if (roll < 0.4) return 'patrol_ship';
            if (roll < 0.7) return 'pirate_scout';
            return 'pirate_raider';
        } else {
            // Dangerous systems: mostly pirates
            if (roll < 0.1) return 'merchant';
            if (roll < 0.2) return 'patrol_ship';
            if (roll < 0.6) return 'pirate_scout';
            return 'pirate_raider';
        }
    }

    /**
     * Calculate threat level (1-5) based on danger
     */
    calculateThreatLevel(dangerLevel) {
        // Base threat level
        let baseThreat = 1;

        if (dangerLevel < 1.0) {
            baseThreat = 1; // Low threat
        } else if (dangerLevel < 1.5) {
            baseThreat = 2; // Medium threat
        } else {
            baseThreat = 3; // High base threat
        }

        // Add some randomness (+/- 1 level)
        const variation = Math.floor(Math.random() * 3) - 1; // -1, 0, or +1
        const finalThreat = baseThreat + variation;

        // Clamp to 1-5
        return Math.max(1, Math.min(5, finalThreat));
    }

    /**
     * Determine if pre-combat dialogue should occur
     * High threat enemies attack immediately, others may talk
     */
    shouldShowDialogue(enemy) {
        // Very high threat: immediate attack
        if (enemy.threatLevel >= 4) {
            return false;
        }

        // Merchants and low-threat enemies: usually dialogue
        if (enemy.type === 'merchant' || enemy.threatLevel <= 2) {
            return true;
        }

        // 50/50 for medium threat
        return Math.random() < 0.5;
    }

    /**
     * Get dialogue options for an encounter
     */
    getDialogueOptions(enemy) {
        const options = [];

        // Always available: Fight
        options.push({
            id: 'fight',
            text: '⚔️ Attack',
            action: 'combat'
        });

        // Flee (requires engines)
        const playerEngines = this.state.ship.systems.find(s => s.type === 'engines');
        if (playerEngines && !playerEngines.offline) {
            options.push({
                id: 'flee',
                text: '🚀 Attempt to Flee',
                action: 'flee',
                successChance: this.calculateFleeChance(enemy)
            });
        }

        // Negotiate (merchants, low threat)
        if (enemy.type === 'merchant' || enemy.threatLevel <= 2) {
            const demandCredits = Math.floor(50 + enemy.threatLevel * 30);
            options.push({
                id: 'negotiate',
                text: `💰 Pay ${demandCredits} credits`,
                action: 'negotiate',
                cost: demandCredits
            });
        }

        // Surrender (if weak)
        const playerHullPercent = this.state.ship.health / this.state.ship.maxHealth;
        if (playerHullPercent < 0.4 || enemy.threatLevel >= 4) {
            options.push({
                id: 'surrender',
                text: '🏳️ Surrender',
                action: 'surrender'
            });
        }

        return options;
    }

    /**
     * Calculate chance to successfully flee
     */
    calculateFleeChance(enemy) {
        const playerEngines = this.state.ship.systems.find(s => s.type === 'engines');
        const enemyEngines = enemy.systems.find(s => s.type === 'engines');

        let baseChance = 0.5; // 50% base

        // Player engine effectiveness
        if (playerEngines) {
            baseChance += (playerEngines.health / 100) * 0.2;
        }

        // Enemy engine status
        if (enemyEngines && enemyEngines.health < 50) {
            baseChance += 0.2; // Easier to flee from damaged enemies
        }

        // Enemy type modifiers
        if (enemy.type === 'pirate_scout') {
            baseChance -= 0.2; // Scouts are fast
        } else if (enemy.type === 'merchant') {
            baseChance += 0.2; // Merchants are slow
        }

        return Math.max(0.2, Math.min(0.9, baseChance)); // 20-90%
    }

    /**
     * Handle dialogue choice
     */
    handleDialogueChoice(choice, enemy) {
        switch (choice.action) {
            case 'combat':
                return { outcome: 'combat', enemy: enemy };

            case 'flee':
                const fleeSuccess = Math.random() < choice.successChance;
                if (fleeSuccess) {
                    return { outcome: 'fled', message: 'Successfully escaped!' };
                } else {
                    return { outcome: 'combat', enemy: enemy, message: 'Flee failed! Entering combat!' };
                }

            case 'negotiate':
                if (this.state.credits >= choice.cost) {
                    this.state.credits -= choice.cost;
                    this.state.saveGame();
                    return { outcome: 'negotiated', message: `Paid ${choice.cost} credits. Enemy stands down.` };
                } else {
                    return { outcome: 'combat', enemy: enemy, message: 'Insufficient credits! They attack!' };
                }

            case 'surrender':
                const lostCredits = Math.floor(this.state.credits * 0.5);
                const lostCargo = Math.floor(this.state.ship.cargo.items.length * 0.3);

                this.state.credits -= lostCredits;
                this.state.ship.cargo.items.splice(0, lostCargo);
                this.state.saveGame();

                return {
                    outcome: 'surrendered',
                    message: `Lost ${lostCredits} credits and ${lostCargo} cargo items.`
                };

            default:
                return { outcome: 'combat', enemy: enemy };
        }
    }

    /**
     * Get encounter greeting message
     */
    getEncounterMessage(enemy) {
        const messages = {
            pirate_scout: [
                "A pirate scout approaches! They're scanning your ship...",
                "Pirate vessel detected! They're powering weapons!",
                "A small raider appears on sensors. They're closing in!"
            ],
            pirate_raider: [
                "Heavy pirate ship incoming! This looks dangerous!",
                "A well-armed raider drops out of FTL! Prepare for combat!",
                "Pirate vessel detected! They're hailing: 'Your cargo or your life!'"
            ],
            patrol_ship: [
                "Patrol vessel approaching. They're running a security scan.",
                "Law enforcement ship detected. Remain calm.",
                "A patrol cruiser hails: 'Stand by for inspection.'"
            ],
            merchant: [
                "Merchant ship detected. They seem nervous.",
                "A trader vessel appears. They're attempting to flee!",
                "Small merchant ship on sensors. They look vulnerable."
            ]
        };

        const typeMessages = messages[enemy.type] || messages.pirate_scout;
        return typeMessages[Math.floor(Math.random() * typeMessages.length)];
    }
}

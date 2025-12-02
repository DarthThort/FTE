/**
 * EncounterManager - Manages random encounters during travel
 * Now uses threat-based encounter system with dialogue options
 */

class EncounterManager {
    constructor(gameState) {
        this.state = gameState;
        this.currentEncounter = null;
        this.encounterCooldown = 0; // Travels remaining before next encounter
    }

    /**
     * Check if an encounter should occur during travel
     */
    checkForEncounter() {
        // Cooldown between encounters
        if (this.encounterCooldown > 0) {
            this.encounterCooldown -= 1;
            return null;
        }

        const system = this.state.currentSystem;
        if (!system) return null;

        // Calculate encounter chance based on threat level
        const threatLevel = system.threatLevel ?? 0;
        let encounterChance = 0.05; // Base 5%

        // Threat modifier: 0-5 adds 0-10%
        encounterChance += (threatLevel * 0.02);

        // Near stations = safer
        const hasStation = system.planets?.some(p => p.hasStation);
        if (hasStation) {
            encounterChance *= 0.5; // Halve chance near stations
        }

        console.log(`[Encounter] Threat: ${threatLevel}, Chance: ${(encounterChance * 100).toFixed(1)}%`);

        if (Math.random() < encounterChance) {
            // Set cooldown to 3-5 travels
            this.encounterCooldown = Math.floor(Math.random() * 3) + 3;

            // Generate encounter
            return this.generateEncounter(system);
        }

        return null;
    }

    /**
     * Generate encounter based on system threat level
     */
    generateEncounter(system) {
        const threatLevel = system.threatLevel ?? 0;

        // Select encounter type based on threat
        const encounterType = selectRandomEncounter(threatLevel);

        console.log(`[Encounter] Generated: ${encounterType.id} (Threat ${threatLevel})`);

        // Create encounter data
        const encounter = {
            ...encounterType,
            systemName: system.name,
            threatLevel: threatLevel
        };

        this.currentEncounter = encounter;
        return encounter;
    }

    /**
     * Trigger encounter (called by TravelManager)
     */
    triggerEncounter(encounter) {
        console.log('[Encounter] Triggering encounter:', encounter.id);

        // Instant combat for aggressive enemies
        if (encounter.skipDialogue) {
            this.startCombatFromDialogue(encounter);
        } else {
            // Show dialogue UI
            if (this.state.game && this.state.game.ui && this.state.game.ui.dialogueUI) {
                this.state.game.ui.dialogueUI.show(encounter);
            } else {
                console.error('[Encounter] DialogueUI not available, starting combat directly');
                this.startCombatFromDialogue(encounter);
            }
        }
    }

    /**
     * Start combat from dialogue choice
     */
    startCombatFromDialogue(encounter) {
        console.log('[Encounter] Starting combat with', encounter.enemyType);

        // Spawn enemy ship
        const enemy = this.spawnEnemy(encounter);

        // Initialize combat
        if (this.state.combatManager) {
            this.state.combatManager.active = false;
        }

        this.state.combatManager = new CombatManager(this.state, enemy);
        this.state.combatManager.active = true;

        console.log('[Combat] Combat started with', enemy.name);
    }

    /**
     * Spawn enemy ship based on encounter type
     */
    spawnEnemy(encounter) {
        const enemyType = encounter.enemyType || 'pirate_scout';
        const threatLevel = encounter.threatLevel || 0;

        // Create enemy based on type
        let enemy;

        switch (enemyType) {
            case 'pirate_raider':
                enemy = this.createPirateRaider(threatLevel);
                break;
            case 'pirate_scout':
                enemy = this.createPirateScout(threatLevel);
                break;
            default:
                enemy = this.createPirateScout(threatLevel);
        }

        return enemy;
    }

    /**
     * Create pirate raider (aggressive)
     */
    createPirateRaider(threatLevel) {
        return new EnemyShip({
            name: 'Pirate Raider',
            type: 'pirate_raider',
            health: 60 + (threatLevel * 10),
            maxHealth: 60 + (threatLevel * 10),
            shields: {
                maxLayers: Math.min(2 + Math.floor(threatLevel / 2), 3),
                currentLayers: Math.min(2 + Math.floor(threatLevel / 2), 3),
                layerHP: 5,
                currentLayerHP: 5
            },
            weapons: this.generateWeapons(threatLevel, 2), // 2 weapons
            aiAggressiveness: 0.8
        });
    }

    /**
     * Create pirate scout (lighter)
     */
    createPirateScout(threatLevel) {
        return new EnemyShip({
            name: 'Pirate Scout',
            type: 'pirate_scout',
            health: 40 + (threatLevel * 8),
            maxHealth: 40 + (threatLevel * 8),
            shields: {
                maxLayers: Math.min(1 + Math.floor(threatLevel / 2), 2),
                currentLayers: Math.min(1 + Math.floor(threatLevel / 2), 2),
                layerHP: 5,
                currentLayerHP: 5
            },
            weapons: this.generateWeapons(threatLevel, 1), // 1 weapon
            aiAggressiveness: 0.6
        });
    }

    /**
     * Generate weapons based on threat level
     */
    generateWeapons(threatLevel, count) {
        const weapons = [];

        for (let i = 0; i < count; i++) {
            weapons.push({
                id: `weapon_${i}`,
                name: 'Laser Cannon',
                type: 'laser',
                damage: 8 + (threatLevel * 2),
                damagePerShot: 8 + (threatLevel * 2),
                shots: 1,
                chargeTime: 8 - Math.min(threatLevel, 3), // Faster at higher threat
                currentCharge: 0,
                state: 'charging',
                cooldown: 2
            });
        }

        return weapons;
    }
}

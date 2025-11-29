class TravelManager {
    constructor(gameState) {
        this.state = gameState;

        // Travel state
        this.isTraveling = false;
        this.travelProgress = 0;
        this.travelDuration = 5.0; // 5 seconds travel time
        this.targetSystem = null;
        this.encounterChecked = false;
    }

    travelToSystem(systemId) {
        const targetSystem = this.state.galaxy.find(s => s.id === systemId);
        if (!targetSystem) return { success: false, message: "System not found." };

        // Calculate distance
        const dx = targetSystem.x - this.state.currentSystem.x;
        const dy = targetSystem.y - this.state.currentSystem.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance > this.state.ship.jumpRange) {
            return { success: false, message: `Target out of jump range (${distance.toFixed(1)} LY > ${this.state.ship.jumpRange} LY)` };
        }

        // Start FTL travel
        this.isTraveling = true;
        this.travelProgress = 0;
        this.targetSystem = targetSystem;
        this.encounterChecked = false;

        console.log(`Starting FTL jump to ${targetSystem.name}...`);

        return { success: true, message: `Jumping to ${targetSystem.name}...` };
    }

    /**
     * Update active FTL travel
     */
    updateTravel(dt) {
        if (!this.isTraveling) return;

        this.travelProgress += dt;
        const progress = this.travelProgress / this.travelDuration;

        // Check for encounter at 50% progress (midway through jump)
        if (progress >= 0.5 && !this.encounterChecked) {
            this.encounterChecked = true;
            this.checkForEncounterDuringTravel();
        }

        // Complete travel
        if (this.travelProgress >= this.travelDuration) {
            this.completeTravel();
        }
    }

    /**
     * Check for encounter during FTL travel
     */
    checkForEncounterDuringTravel() {
        if (!this.state.encounterManager) return;

        const enemy = this.state.encounterManager.checkForEncounter(1.0); // Single check

        if (enemy) {
            // Encounter! Interrupt travel
            this.interruptTravel(enemy);
        }
    }

    /**
     * Interrupt travel with an encounter
     */
    interruptTravel(enemy) {
        console.log(`Travel interrupted by ${enemy.name}!`);

        this.isTraveling = false;
        this.state.currentEnemy = enemy;

        // Check if dialogue should occur
        const showDialogue = this.state.encounterManager.shouldShowDialogue(enemy);

        if (showDialogue) {
            // TODO: Show dialogue UI
            // For now, immediately start combat
            this.startCombat(enemy);
        } else {
            // Immediate combat
            this.startCombat(enemy);
        }
    }

    /**
     * Complete travel successfully
     */
    completeTravel() {
        console.log(`Arrived at ${this.targetSystem.name}`);

        this.state.currentSystem = this.targetSystem;
        this.state.currentPlanet = null;
        this.targetSystem.visited = true;

        this.isTraveling = false;
        this.targetSystem = null;

        this.state.saveGame();
        this.state.notify();
    }

    /**
     * Start combat with enemy
     */
    startCombat(enemy) {
        console.log(`Starting combat with ${enemy.name}`);

        // Create combat manager
        this.state.combatManager = new CombatManager(this.state, enemy);
        this.state.combatManager.start();

        // Switch to combat scene
        if (this.state.game && this.state.game.sceneManager) {
            this.state.game.sceneManager.changeScene('COMBAT');
        }
    }

    travelToPlanet(planetId) {
        const targetPlanet = this.state.currentSystem.planets.find(p => p.id === planetId);
        if (!targetPlanet) return { success: false, message: "Planet not found." };

        const fuelCost = 5; // Fixed cost for now
        if (this.state.ship.fuel < fuelCost) {
            return { success: false, message: "Insufficient fuel for planetary travel." };
        }

        this.state.ship.fuel -= fuelCost;
        this.state.currentPlanet = targetPlanet;

        this.state.saveGame();
        this.state.notify();
        return { success: true, message: `Traveling to ${targetPlanet.name}...` };
    }
}

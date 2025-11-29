class TravelManager {
    constructor(gameState) {
        this.state = gameState;
    }

    travelToSystem(systemId) {
        const targetSystem = this.state.galaxy.find(s => s.id === systemId);
        if (!targetSystem) return { success: false, message: "System not found." };

        // Calculate distance
        const dx = targetSystem.x - this.state.currentSystem.x;
        const dy = targetSystem.y - this.state.currentSystem.y;
        // Simplified distance for grid, but realDist is for flavor/lore
        const distance = Math.sqrt(dx * dx + dy * dy);

        // Use realDist if available and jumping from Sol (or relative logic)
        // For now, let's use the grid distance as the mechanic

        if (distance > this.state.ship.jumpRange) {
            return { success: false, message: `Target out of jump range (${distance.toFixed(1)} LY > ${this.state.ship.jumpRange} LY)` };
        }

        this.state.currentSystem = targetSystem;
        this.state.currentPlanet = null; // Reset planet when jumping systems

        // Mark as visited
        targetSystem.visited = true;

        this.state.saveGame();
        this.state.notify();
        return { success: true, message: `Jumping to ${targetSystem.name}...` };
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

    /**
     * Check for random encounters during travel
     * @param {number} dt - Delta time in seconds
     */
    checkForEncounters(dt) {
        // Don't check if already in combat or at a station
        if (this.state.currentPlanet || !this.state.encounterManager) {
            return;
        }

        const enemy = this.state.encounterManager.checkForEncounter(dt);

        if (enemy) {
            this.triggerEncounter(enemy);
        }
    }

    /**
     * Trigger an encounter with an enemy ship
     */
    triggerEncounter(enemy) {
        console.log(`Encounter triggered: ${enemy.name}`);

        this.state.currentEnemy = enemy;

        // Check if dialogue should occur
        const showDialogue = this.state.encounterManager.shouldShowDialogue(enemy);

        if (showDialogue) {
            // Show dialogue UI (will be handled by UIManager)
            const options = this.state.encounterManager.getDialogueOptions(enemy);
            const message = this.state.encounterManager.getEncounterMessage(enemy);

            // For now, immediately start combat (dialogue UI integration comes later)
            this.startCombat(enemy);
        } else {
            // Immediate combat
            this.startCombat(enemy);
        }
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
}

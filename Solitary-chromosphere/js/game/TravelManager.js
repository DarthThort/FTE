class TravelManager {
    constructor(gameState) {
        this.state = gameState;

        // Travel state
        this.isTraveling = false;
        this.travelProgress = 0;
        this.travelDuration = 5.0; // 5 seconds travel time
        this.targetSystem = null;
        this.targetPlanet = null; // For planetary travel
        this.encounterChecked = false;
        this.isPlanetaryTravel = false; // Flag for lower encounter chance
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

        // Save state before travel (for retry if combat is lost)
        if (this.state.savePreTravelState) {
            this.state.savePreTravelState();
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

        // Check for encounter using new threat-based system
        const encounter = this.state.encounterManager.checkForEncounter();

        if (encounter) {
            // Encounter! Interrupt travel
            this.interruptTravel(encounter);
        }
    }

    /**
     * Interrupt travel with an encounter
     */
    interruptTravel(encounter) {
        console.log(`Travel interrupted by ${encounter.id}!`);

        // Stop travel
        this.stopTravel();

        // Trigger encounter (shows dialogue or starts combat)
        if (this.state.encounterManager) {
            this.state.encounterManager.triggerEncounter(encounter);
        }
    }

    /**
     * Stop travel
     */
    stopTravel() {
        this.isTraveling = false;
    }

    /**
     * Complete travel successfully
     */
    completeTravel() {
        if (this.targetSystem) {
            // System jump
            console.log(`Arrived at ${this.targetSystem.name}`);
            this.state.currentSystem = this.targetSystem;
            this.state.currentPlanet = null;
            this.targetSystem.visited = true;
        } else if (this.targetPlanet) {
            // Planetary travel
            console.log(`Arrived at ${this.targetPlanet.name}`);
            this.state.currentPlanet = this.targetPlanet;
        }

        this.isTraveling = false;
        this.targetSystem = null;
        this.targetPlanet = null;
        this.isPlanetaryTravel = false;

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

        // Combat renders as overlay in SHIP scene (no scene change)
        console.log('[Combat] Combat active - rendering as overlay');
    }

    travelToPlanet(planetId) {
        const targetPlanet = this.state.currentSystem.planets.find(p => p.id === planetId);
        if (!targetPlanet) return { success: false, message: "Planet not found." };

        const fuelCost = 5; // Fixed cost for now
        if (this.state.ship.fuel < fuelCost) {
            return { success: false, message: "Insufficient fuel for planetary travel." };
        }

        // Save state before travel (for retry if combat is lost)
        if (this.state.savePreTravelState) {
            this.state.savePreTravelState();
        }

        this.state.ship.fuel -= fuelCost;

        // Start planetary travel (shorter duration, lower encounter chance)
        this.isTraveling = true;
        this.travelProgress = 0;
        this.travelDuration = 3.0; // 3 seconds for planetary travel
        this.targetPlanet = targetPlanet;
        this.targetSystem = null; // Mark as planetary travel
        this.encounterChecked = false;
        this.isPlanetaryTravel = true; // Flag for lower encounter chance

        console.log(`[TRAVEL] Starting planetary travel to ${targetPlanet.name}...`);

        return { success: true, message: `Traveling to ${targetPlanet.name}...` };
    }
}

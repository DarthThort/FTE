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
}

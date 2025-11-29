// =============================================================================
// SEASONS.JS - Seasonal Cycle System
// =============================================================================

class SeasonalCycle {
    constructor() {
        this.seasons = ['SPRING', 'SUMMER', 'FALL', 'WINTER'];
        this.currentSeasonIndex = 0;
        this.seasonDuration = 180; // 3 minutes per season (12 min for full year)
        this.seasonTime = 0;
    }

    update(deltaTime) {
        this.seasonTime += deltaTime;

        if (this.seasonTime >= this.seasonDuration) {
            this.seasonTime = 0;
            this.currentSeasonIndex = (this.currentSeasonIndex + 1) % 4;
            if (window.game && window.game.ui) {
                window.game.ui.logEvent(`La estación ha cambiado a: ${this.getCurrentSeason()}`, 'event-mutation');
            }
        }
    }

    getCurrentSeason() {
        return this.seasons[this.currentSeasonIndex];
    }

    getSeasonProgress() {
        return this.seasonTime / this.seasonDuration;
    }

    // Get temperature modifier for current season
    getTemperatureModifier() {
        switch (this.getCurrentSeason()) {
            case 'WINTER': return -0.3;
            case 'SUMMER': return +0.2;
            case 'SPRING': return +0.05;
            case 'FALL': return -0.05;
            default: return 0;
        }
    }

    // Apply seasonal effects to world
    applyToWorld(world) {
        const tempMod = this.getTemperatureModifier();
        const season = this.getCurrentSeason();

        for (let row of world.tiles) {
            for (let tile of row) {
                // Store base temperature if not already stored
                if (tile.baseTemperature === undefined) {
                    tile.baseTemperature = tile.temperature;
                }

                // Apply seasonal temperature
                tile.temperature = Utils.clamp(tile.baseTemperature + tempMod, 0, 1);

                // Winter effects
                if (season === 'WINTER') {
                    // Reduce biomass growth in cold areas
                    if (tile.temperature < 0.3) {
                        tile.biomassGrowthRate = 0.1; // Slow growth
                    }
                } else {
                    tile.biomassGrowthRate = 1.0; // Normal growth
                }

                // Summer effects
                if (season === 'SUMMER' && tile.humidity < 0.3) {
                    // Drought in hot, dry areas
                    tile.biomass *= 0.99; // Slow decay
                }

                // Reclassify biome based on new conditions
                tile.biome = world.classifyBiome(tile);
            }
        }
    }

    getSeasonEmoji() {
        switch (this.getCurrentSeason()) {
            case 'SPRING': return '🌱';
            case 'SUMMER': return '☀️';
            case 'FALL': return '🍂';
            case 'WINTER': return '❄️';
            default: return '';
        }
    }
}

class StatisticsManager {
    constructor(world) {
        this.world = world;
        this.history = [];
        this.maxHistoryPoints = 100; // Limit history to avoid memory issues
        this.updateInterval = 60; // Update every 60 frames (approx 1 sec)
        this.frameCount = 0;

        // Data structure for current stats
        this.currentStats = {
            creatures: {},
            plants: {},
            pathogens: {}
        };
    }

    update(creatures, pathogens) {
        this.frameCount++;
        if (this.frameCount >= this.updateInterval) {
            this.frameCount = 0;
            this.recordSnapshot(creatures, pathogens);
        }
    }

    recordSnapshot(creatures, pathogens) {
        const snapshot = {
            time: Date.now(),
            creatures: {},
            plants: {},
            pathogens: []
        };

        // 1. Creature Stats (by species/genetic similarity)
        // For simplicity, we'll group by diet type for now, or we could try to identify "species"
        // Let's group by Diet Type + Main Body Color (as a proxy for species)
        creatures.forEach(c => {
            if (!c || c.isDead || !c.dna || !c.dna.genes) return;

            const key = `${c.dna.genes.diet_type.toFixed(1)}-${c.dna.genes.body_color_r},${c.dna.genes.body_color_g},${c.dna.genes.body_color_b}`;

            if (!snapshot.creatures[key]) {
                // Safely get skin color with fallback
                let color;
                if (typeof c.getSkinColor === 'function') {
                    color = c.getSkinColor();
                } else {
                    // Fallback: generate color from DNA genes directly
                    const r = Math.round((c.dna.genes.color_r || 0.5) * 255);
                    const g = Math.round((c.dna.genes.color_g || 0.5) * 255);
                    const b = Math.round((c.dna.genes.color_b || 0.5) * 255);
                    color = `rgb(${r},${g},${b})`;
                }

                snapshot.creatures[key] = {
                    count: 0,
                    diet: c.dna.genes.diet_type,
                    color: color
                };
            }
            snapshot.creatures[key].count++;
        });

        // 2. Plant Stats (by biome/type)
        // We iterate tiles to count biomass
        for (let row = 0; row < this.world.rows; row++) {
            for (let col = 0; col < this.world.cols; col++) {
                const tile = this.world.tiles[row][col];
                if (tile.biomass > 0) {
                    const key = tile.biome;
                    if (!snapshot.plants[key]) snapshot.plants[key] = 0;
                    snapshot.plants[key] += tile.biomass;
                }
            }
        }

        // 3. Pathogen Stats
        // Pathogens are global objects in PathogenManager (passed as pathogens array)
        if (pathogens) {
            pathogens.forEach(p => {
                snapshot.pathogens.push({
                    name: p.name,
                    infectivity: p.transmissibility,
                    lethality: p.lethality,
                    infectedCount: creatures.filter(c => c.diseaseSystem && c.diseaseSystem.infected && c.diseaseSystem.pathogenId === p.id).length
                });
            });
        }

        this.history.push(snapshot);
        if (this.history.length > this.maxHistoryPoints) {
            this.history.shift();
        }
    }

    getHistory() {
        return this.history;
    }

    getPathogenStats() {
        // Return latest snapshot's pathogen data or empty
        if (this.history.length === 0) return [];
        return this.history[this.history.length - 1].pathogens;
    }
}

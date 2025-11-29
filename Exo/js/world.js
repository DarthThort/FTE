// =============================================================================
// WORLD.JS - Procedural World Generation and Biome System
// =============================================================================

// =============================================================================
// Perlin Noise Implementation (Simplified)
// =============================================================================
class PerlinNoise {
    constructor(seed = Math.random()) {
        this.rng = new SeededRandom(seed);
        this.permutation = [];
        for (let i = 0; i < 256; i++) {
            this.permutation[i] = i;
        }
        // Shuffle using Fisher-Yates
        for (let i = 255; i > 0; i--) {
            const j = Math.floor(this.rng.next() * (i + 1));
            [this.permutation[i], this.permutation[j]] = [this.permutation[j], this.permutation[i]];
        }
        // Duplicate for overflow handling
        this.p = [...this.permutation, ...this.permutation];
    }

    fade(t) {
        return t * t * t * (t * (t * 6 - 15) + 10);
    }

    grad(hash, x, y) {
        const h = hash & 15;
        const u = h < 8 ? x : y;
        const v = h < 4 ? y : h === 12 || h === 14 ? x : 0;
        return ((h & 1) === 0 ? u : -u) + ((h & 2) === 0 ? v : -v);
    }

    noise(x, y) {
        const X = Math.floor(x) & 255;
        const Y = Math.floor(y) & 255;

        x -= Math.floor(x);
        y -= Math.floor(y);

        const u = this.fade(x);
        const v = this.fade(y);

        const a = this.p[X] + Y;
        const aa = this.p[a];
        const ab = this.p[a + 1];
        const b = this.p[X + 1] + Y;
        const ba = this.p[b];
        const bb = this.p[b + 1];

        const gradAA = this.grad(this.p[aa], x, y);
        const gradBA = this.grad(this.p[ba], x - 1, y);
        const gradAB = this.grad(this.p[ab], x, y - 1);
        const gradBB = this.grad(this.p[bb], x - 1, y - 1);

        const lerpX1 = Utils.lerp(gradAA, gradBA, u);
        const lerpX2 = Utils.lerp(gradAB, gradBB, u);

        return Utils.lerp(lerpX1, lerpX2, v);
    }

    octaveNoise(x, y, octaves = 4, persistence = 0.5) {
        let total = 0;
        let frequency = 1;
        let amplitude = 1;
        let maxValue = 0;

        for (let i = 0; i < octaves; i++) {
            total += this.noise(x * frequency, y * frequency) * amplitude;
            maxValue += amplitude;
            amplitude *= persistence;
            frequency *= 2;
        }

        return total / maxValue;
    }
}

// =============================================================================
// Biome Definitions
// =============================================================================
const BIOMES = {
    OCEAN_DEEP: {
        name: 'Océano Profundo',
        color: '#1a3a52',
        movementCost: 1.0,
        biomassMax: 5,
        oxygenLevel: 0.3
    },
    OCEAN_SHALLOW: {
        name: 'Océano Costero',
        color: '#2e5f7a',
        movementCost: 1.0,
        biomassMax: 15,
        oxygenLevel: 0.8
    },
    BEACH: {
        name: 'Playa',
        color: '#d4c4a0',
        movementCost: 1.3,
        biomassMax: 8,
        oxygenLevel: 1.0
    },
    DESERT: {
        name: 'Desierto',
        color: '#e6c79c',
        movementCost: 1.5,
        biomassMax: 10,
        dehydrationRate: 3.0,
        oxygenLevel: 1.0
    },
    PLAINS: {
        name: 'Llanura',
        color: '#90b878',
        movementCost: 1.0,
        biomassMax: 60,
        oxygenLevel: 1.0
    },
    FOREST: {
        name: 'Bosque',
        color: '#4a7c59',
        movementCost: 1.2,
        biomassMax: 90,
        oxygenLevel: 1.2
    },
    JUNGLE: {
        name: 'Selva',
        color: '#2d5a3d',
        movementCost: 1.4,
        biomassMax: 100,
        oxygenLevel: 1.3
    },
    TUNDRA: {
        name: 'Tundra',
        color: '#b8c9d9',
        movementCost: 1.3,
        biomassMax: 15,
        oxygenLevel: 1.0
    },
    TAIGA: {
        name: 'Taiga',
        color: '#5a7a65',
        movementCost: 1.2,
        biomassMax: 50,
        oxygenLevel: 1.0
    },
    MOUNTAIN: {
        name: 'Montaña',
        color: '#888888',
        movementCost: 2.0,
        biomassMax: 20,
        oxygenLevel: 0.7
    },
    SNOW_PEAK: {
        name: 'Pico Nevado',
        color: '#f0f0f0',
        movementCost: 2.5,
        biomassMax: 0,
        oxygenLevel: 0.4
    }
};

// =============================================================================
// Tile Class
// =============================================================================
class Tile {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.elevation = 0;      // 0.0 to 1.0
        this.temperature = 0;    // 0.0 to 1.0
        this.humidity = 0;       // 0.0 to 1.0
        this.biome = null;       // BIOMES key
        this.biomass = 0;        // Current plant matter (0-100)
        this.waterLevel = 0;     // For aquatic tiles
    }

    update(deltaTime) {
        // Grow biomass based on biome and conditions
        if (this.biome && BIOMES[this.biome]) {
            const biomeData = BIOMES[this.biome];
            const growthRate = 0.1; // Base growth per second
            const tempFactor = 1.0 - Math.abs(this.temperature - 0.5) * 2; // Optimal at 0.5
            const humidityFactor = this.humidity;

            const nutrientBonus = typeof NutrientManager !== 'undefined' ? NutrientManager.getGrowthBonus(this) : 1.0;
            const growth = growthRate * tempFactor * humidityFactor * nutrientBonus * deltaTime;
            this.biomass = Utils.clamp(this.biomass + growth, 0, biomeData.biomassMax);
            
            // Actualizar nutrientes del suelo
            if (typeof NutrientManager !== 'undefined') {
                NutrientManager.updateSoilNutrients(this, deltaTime);
            }
        }
    }
}

// =============================================================================
// World Map Class
// =============================================================================
class WorldMap {
    constructor(width, height, tileSize = 8, seed = Date.now()) {
        this.width = width;
        this.height = height;
        this.tileSize = tileSize;
        this.cols = Math.floor(width / tileSize);
        this.rows = Math.floor(height / tileSize);
        this.tiles = [];
        this.seed = seed;

        // Sistema de Biomasa Global Limitada
        this.MAX_GLOBAL_BIOMASS = 50000;
        this.currentBiomass = 0;
        this.BASE_GROWTH_SPEED = 100;

        this.generate();
    }

    generate() {
        console.log('Generating world...');

        // Create noise generators
        const elevationNoise = new PerlinNoise(this.seed);
        const temperatureNoise = new PerlinNoise(this.seed + 1000);
        const humidityNoise = new PerlinNoise(this.seed + 2000);

        const scale = 0.05; // Noise scale (smaller = smoother terrain)

        // Generate tiles
        for (let row = 0; row < this.rows; row++) {
            this.tiles[row] = [];
            for (let col = 0; col < this.cols; col++) {
                const tile = new Tile(col, row);

                // Elevation (with island effect)
                const nx = col * scale;
                const ny = row * scale;
                const e = elevationNoise.octaveNoise(nx, ny, 4, 0.5);

                // Island effect: reduce elevation near edges
                const dx = (col / this.cols) * 2 - 1; // -1 to 1
                const dy = (row / this.rows) * 2 - 1;
                const distanceFromCenter = Math.sqrt(dx * dx + dy * dy);
                const islandFactor = Math.max(0, 1 - distanceFromCenter * 0.8);

                tile.elevation = Utils.clamp((e + 1) / 2 * islandFactor, 0, 1);

                // Temperature (colder at poles)
                const latitudeFactor = Math.abs((row / this.rows) - 0.5) * 2; // 0 at equator, 1 at poles
                const tempBase = 1 - latitudeFactor * 0.7; // Warmer at equator
                const tempNoise = (temperatureNoise.octaveNoise(nx, ny, 2, 0.5) + 1) / 2;
                tile.temperature = Utils.clamp(tempBase * 0.7 + tempNoise * 0.3, 0, 1);

                // Humidity
                const humidNoise = (humidityNoise.octaveNoise(nx, ny, 3, 0.5) + 1) / 2;
                tile.humidity = Utils.clamp(humidNoise, 0, 1);

                //Classify biome
                tile.biome = this.classifyBiome(tile);

                // Initialize plant genetics based on biome
                const plantGenes = {
                    water_need: tile.humidity,
                    heat_tolerance: tile.temperature,
                    growth_speed: 0.3 + Math.random() * 0.4,
                    max_biomass: 0.5 + Math.random() * 0.5,
                    toxicity: Math.random() * 0.3, // Empezar con baja toxicidad
                    defense: Math.random() * 0.3,  // Empezar con baja defensa
                    plant_type: this.getPlantTypeForBiome(tile.biome)
                };

                tile.plantDNA = new PlantDNA(plantGenes);
                tile.grazingPressure = 0;

                // Initialize biomass
                if (BIOMES[tile.biome]) {
                    const maxBiomass = BIOMES[tile.biome].biomassMax * tile.plantDNA.genes.max_biomass;
                    tile.biomass = maxBiomass * 0.8; // Start at 80%
                    tile.maxBiomass = maxBiomass; // Store max for regeneration
                }

                this.tiles[row][col] = tile;
            }
        }

        console.log(`World generated: ${this.cols}x${this.rows} tiles`);
    }

    classifyBiome(tile) {
        const e = tile.elevation;
        const t = tile.temperature;
        const h = tile.humidity;

        // Water bodies
        if (e < 0.3) return 'OCEAN_DEEP';
        if (e < 0.4) return 'OCEAN_SHALLOW';
        if (e < 0.45) return 'BEACH';

        // High elevation
        if (e > 0.8) return 'SNOW_PEAK';
        if (e > 0.7) return 'MOUNTAIN';

        // Whittaker diagram (simplified)
        // Cold biomes
        if (t < 0.3) {
            return h > 0.5 ? 'TAIGA' : 'TUNDRA';
        }

        // Hot biomes
        if (t > 0.7) {
            if (h < 0.2) return 'DESERT';
            if (h > 0.7) return 'JUNGLE';
            return 'PLAINS';
        }

        // Temperate biomes
        if (h < 0.3) return 'PLAINS';
        if (h > 0.6) return 'FOREST';
        return 'PLAINS';
    }

    getPlantTypeForBiome(biomeName) {
        // Acuática: 0.7-1.0
        if (biomeName.includes('OCEAN') || biomeName.includes('DEEP')) {
            return 0.8 + Math.random() * 0.2;
        }
        // Anfibia: 0.3-0.7
        else if (biomeName.includes('BEACH') || biomeName.includes('SWAMP') || biomeName.includes('SHALLOW')) {
            return 0.4 + Math.random() * 0.3;
        }
        // Terrestre: 0.0-0.3
        else {
            return Math.random() * 0.3;
        }
    }

    getTile(col, row) {
        if (row >= 0 && row < this.rows && col >= 0 && col < this.cols) {
            return this.tiles[row][col];
        }
        return null;
    }

    getTileAt(x, y) {
        const col = Math.floor(x / this.tileSize);
        const row = Math.floor(y / this.tileSize);
        return this.getTile(col, row);
    }

    update(deltaTime) {
        // Calcular biomasa total
        this.currentBiomass = 0;
        for (let row of this.tiles) {
            for (let tile of row) {
                this.currentBiomass += tile.biomass;
            }
        }

        // Crecimiento logístico
        let growthModifier = 1.0;
        if (this.currentBiomass < this.MAX_GLOBAL_BIOMASS) {
            growthModifier = (1 - (this.currentBiomass / this.MAX_GLOBAL_BIOMASS)) * (this.BASE_GROWTH_SPEED / 100);
        } else {
            growthModifier = 0;
        }

        // Actualizar tiles con modificador
        const tilesPerUpdate = 100;
        for (let i = 0; i < tilesPerUpdate; i++) {
            const row = Utils.randomInt(0, this.rows - 1);
            const col = Utils.randomInt(0, this.cols - 1);
            const tile = this.tiles[row][col];

            const biomeData = BIOMES[tile.biome];
            if (biomeData && tile.plantDNA && tile.biomass < tile.maxBiomass) {
                const growthRate = tile.plantDNA.genes.growth_speed * this.BASE_GROWTH_SPEED / 100 * growthModifier;
                tile.biomass = Math.min(tile.maxBiomass, tile.biomass + growthRate * deltaTime);

                // Mutación bajo alta presión de pastoreo
                if (tile.biomass >= tile.maxBiomass * 0.9 && tile.plantDNA.grazingPressure > 0.7) {
                    tile.plantDNA = tile.plantDNA.mutate();
                    tile.plantDNA.grazingPressure = 0;
                }
            }
        }

        // Dispersión de semillas
        this.disperseSeeds(deltaTime);
    }

    disperseSeeds(deltaTime) {
        this.seedDispersalTimer = (this.seedDispersalTimer || 0) + deltaTime;

        if (this.seedDispersalTimer > 10) {
            this.seedDispersalTimer = 0;

            for (let i = 0; i < 10; i++) {
                const row = Utils.randomInt(0, this.rows - 1);
                const col = Utils.randomInt(0, this.cols - 1);
                const sourceTile = this.tiles[row][col];

                if (sourceTile && sourceTile.plantDNA && sourceTile.biomass > sourceTile.maxBiomass * 0.7) {
                    const neighbors = this.getAdjacentTiles(col, row);
                    if (neighbors.length > 0) {
                        const targetTile = neighbors[Math.floor(Math.random() * neighbors.length)];

                        if (targetTile && targetTile.plantDNA && Math.random() < 0.3) {
                            targetTile.plantDNA = sourceTile.plantDNA.mutate();
                        }
                    }
                }
            }
        }
    }

    getAdjacentTiles(col, row) {
        const adjacent = [];
        const directions = [[-1, 0], [1, 0], [0, -1], [0, 1]];

        for (let [dc, dr] of directions) {
            const newRow = row + dr;
            const newCol = col + dc;

            if (newRow >= 0 && newRow < this.rows && newCol >= 0 && newCol < this.cols) {
                adjacent.push(this.tiles[newRow][newCol]);
            }
        }

        return adjacent;
    }
}

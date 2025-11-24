import { BiomeType, Biome } from './Biome.js';
import { Plant } from '../entities/Plant.js';
import { Creature, DietType } from '../entities/Creature.js';
import { Genetics, TraitType } from '../entities/Genetics.js';
import { DensityField } from '../rendering/DensityField.js';

export class World {
    constructor(width, height, eventBus) {
        this.width = width;
        this.height = height;
        this.eventBus = eventBus;
        this.tileSize = 20;
        this.cols = Math.ceil(width / this.tileSize);
        this.rows = Math.ceil(height / this.tileSize);
        this.grid = [];
        this.entities = [];

        this.biomeSpawnCooldowns = {};

        // Sistema de renderizado por densidad orgánica (0.5 = mejor nitidez)
        this.densityField = new DensityField(width, height, 0.5);

        this.generate();
        this.spawnInitialCreatures();
        this.spawnInitialPlants();
    }

    spawnInitialPlants() {
        for (let i = 0; i < 200; i++) {
            const x = Math.random() * this.width;
            const y = Math.random() * this.height;

            const col = Math.floor(x / this.tileSize);
            const row = Math.floor(y / this.tileSize);

            if (col >= 0 && col < this.cols && row >= 0 && row < this.rows) {
                const biomeType = this.grid[row][col];
                const biomeStats = Biome.get(biomeType);

                if (Math.random() < biomeStats.foodProduction) {
                    this.entities.push(new Plant(x, y, biomeType));
                }
            }
        }
    }

    spawnInitialCreatures() {
        const biomeCounts = {
            'Tundra': 0,
            'Mountain': 0,
            'Forest': 0,
            'Desert': 0,
            'Sea': 0
        };

        for (let row = 0; row < this.rows; row++) {
            for (let col = 0; col < this.cols; col++) {
                const biome = this.grid[row][col];
                biomeCounts[biome]++;
            }
        }

        const totalTiles = this.rows * this.cols;
        const totalHerbivores = 30;
        const totalCarnivores = 10;
        const totalOmnivores = 5;

        Object.keys(biomeCounts).forEach(biomeType => {
            const proportion = biomeCounts[biomeType] / totalTiles;
            const herbivoresToSpawn = Math.floor(totalHerbivores * proportion);

            for (let i = 0; i < herbivoresToSpawn; i++) {
                const pos = this.getRandomPositionInBiome(biomeType);
                if (pos) {
                    this.entities.push(new Creature(pos.x, pos.y, DietType.HERBIVORE, null, this));
                }
            }
        });

        for (let i = 0; i < totalCarnivores; i++) {
            const x = Math.random() * this.width;
            const y = Math.random() * this.height;
            this.entities.push(new Creature(x, y, DietType.CARNIVORE, null, this));
        }

        for (let i = 0; i < totalOmnivores; i++) {
            const x = Math.random() * this.width;
            const y = Math.random() * this.height;
            this.entities.push(new Creature(x, y, DietType.OMNIVORE, null, this));
        }
    }

    getRandomPositionInBiome(biomeType) {
        const validPositions = [];

        for (let row = 0; row < this.rows; row++) {
            for (let col = 0; col < this.cols; col++) {
                if (this.grid[row][col] === biomeType) {
                    validPositions.push({
                        x: col * this.tileSize + Math.random() * this.tileSize,
                        y: row * this.tileSize + Math.random() * this.tileSize
                    });
                }
            }
        }

        if (validPositions.length > 0) {
            return validPositions[Math.floor(Math.random() * validPositions.length)];
        }
        return null;
    }

    generate() {
        for (let y = 0; y < this.rows; y++) {
            const row = [];
            for (let x = 0; x < this.cols; x++) {
                row.push(this.determineBiome(x, y));
            }
            this.grid.push(row);
        }
    }

    determineBiome(x, y) {
        const ny = y / this.rows;

        if (ny < 0.15) return BiomeType.TUNDRA;
        if (ny < 0.3) return BiomeType.MOUNTAIN;
        if (ny < 0.6) return BiomeType.FOREST;
        if (ny < 0.8) return BiomeType.DESERT;
        return BiomeType.SEA;
    }

    getBiomeAt(x, y) {
        const col = Math.floor(x / this.tileSize);
        const row = Math.floor(y / this.tileSize);

        if (col >= 0 && col < this.cols && row >= 0 && row < this.rows) {
            return this.grid[row][col];
        }
        return BiomeType.FOREST;
    }

    update(deltaTime) {
        this.spawnPlants();
        this.checkAndSpawnHerbivores(deltaTime);
        this.checkAndSpawnCarnivores(deltaTime);
        this.checkAndSpawnOmnivores(deltaTime);
        this.entities.forEach(entity => entity.update(deltaTime, this));
        this.entities = this.entities.filter(e => !e.isDead);
    }

    checkAndSpawnHerbivores(deltaTime) {
        const plantCountByBiome = {};

        Object.keys(this.biomeSpawnCooldowns).forEach(biome => {
            this.biomeSpawnCooldowns[biome] -= deltaTime;
            if (this.biomeSpawnCooldowns[biome] <= 0) {
                delete this.biomeSpawnCooldowns[biome];
            }
        });

        this.entities.forEach(entity => {
            if (entity.type === 'plant') {
                const biome = entity.biomeType;
                plantCountByBiome[biome] = (plantCountByBiome[biome] || 0) + 1;
            }
        });

        Object.keys(plantCountByBiome).forEach(biomeType => {
            if (this.biomeSpawnCooldowns[biomeType]) {
                return;
            }

            const plantCount = plantCountByBiome[biomeType];
            let spawnChance = 0;

            if (plantCount >= 3) {
                spawnChance = 1.0;
            } else if (plantCount === 2) {
                spawnChance = 0.5;
            } else if (plantCount === 1) {
                spawnChance = 0.25;
            }

            if (spawnChance > 0 && Math.random() < spawnChance) {
                this.spawnHerbivoreInBiome(biomeType, plantCount);
                this.biomeSpawnCooldowns[biomeType] = 3000;
            }
        });
    }

    spawnHerbivoreInBiome(biomeType, plantCount) {
        const pos = this.getRandomPositionInBiome(biomeType);
        if (pos) {
            const genetics = Genetics.random();
            genetics.traits[TraitType.ADAPTABILITY] = Math.random() * 0.4 + 0.6;

            const newHerbivore = new Creature(pos.x, pos.y, DietType.HERBIVORE, genetics, this);
            this.entities.push(newHerbivore);
        }
    }

    checkAndSpawnCarnivores(deltaTime) {
        const herbivoreCountByBiome = {};
        let totalHerbivores = 0;

        Object.keys(this.biomeSpawnCooldowns).forEach(biome => {
            const key = `carnivore_${biome}`;
            if (this.biomeSpawnCooldowns[key]) {
                this.biomeSpawnCooldowns[key] -= deltaTime;
                if (this.biomeSpawnCooldowns[key] <= 0) {
                    delete this.biomeSpawnCooldowns[key];
                }
            }
        });

        this.entities.forEach(entity => {
            if (entity.type === 'creature' && entity.diet === DietType.HERBIVORE && !entity.isDead) {
                const biome = entity.currentBiome || entity.birthBiome;
                herbivoreCountByBiome[biome] = (herbivoreCountByBiome[biome] || 0) + 1;
                totalHerbivores++;
            }
        });

        // Sin límites artificiales - la población se regula naturalmente
        Object.keys(herbivoreCountByBiome).forEach(biomeType => {
            const key = `carnivore_${biomeType}`;
            if (this.biomeSpawnCooldowns[key]) {
                return;
            }

            const herbivoreCount = herbivoreCountByBiome[biomeType];
            let spawnChance = 0;

            if (herbivoreCount >= 5) {
                spawnChance = 0.7;
            } else if (herbivoreCount >= 3) {
                spawnChance = 0.5;
            } else if (herbivoreCount >= 2) {
                spawnChance = 0.25;
            }

            if (spawnChance > 0 && Math.random() < spawnChance) {
                this.spawnCarnivoreInBiome(biomeType, herbivoreCount);
                this.biomeSpawnCooldowns[key] = 4000;
            }
        });
    }

    spawnCarnivoreInBiome(biomeType, herbivoreCount) {
        const pos = this.getRandomPositionInBiome(biomeType);
        if (pos) {
            const genetics = Genetics.random();
            genetics.traits[TraitType.ATTACK] = Math.random() * 0.3 + 0.7;

            const newCarnivore = new Creature(pos.x, pos.y, DietType.CARNIVORE, genetics, this);
            this.entities.push(newCarnivore);
        }
    }

    checkAndSpawnOmnivores(deltaTime) {
        const key = 'omnivore_global';
        if (this.biomeSpawnCooldowns[key]) {
            this.biomeSpawnCooldowns[key] -= deltaTime;
            if (this.biomeSpawnCooldowns[key] <= 0) {
                delete this.biomeSpawnCooldowns[key];
            }
            return;
        }

        const totalPlants = this.entities.filter(e => e.type === 'plant').length;
        const totalHerbivores = this.entities.filter(e => e.type === 'creature' && e.diet === DietType.HERBIVORE).length;
        const totalOmnivores = this.entities.filter(e => e.type === 'creature' && e.diet === DietType.OMNIVORE).length;

        const totalFood = totalPlants + totalHerbivores;

        // Sin límite de población - se regula naturalmente por disponibilidad de comida
        if (totalFood >= 20 && Math.random() < 0.5) {
            const x = Math.random() * this.width;
            const y = Math.random() * this.height;

            const genetics = Genetics.random();
            genetics.traits[TraitType.ADAPTABILITY] = Math.random() * 0.2 + 0.8;

            const newOmnivore = new Creature(x, y, DietType.OMNIVORE, genetics, this);
            this.entities.push(newOmnivore);
            this.biomeSpawnCooldowns[key] = 5000; // Cooldown reducido
        }
    }

    spawnPlants() {
        for (let i = 0; i < 12; i++) {
            const x = Math.random() * this.width;
            const y = Math.random() * this.height;

            const col = Math.floor(x / this.tileSize);
            const row = Math.floor(y / this.tileSize);

            if (col >= 0 && col < this.cols && row >= 0 && row < this.rows) {
                const biomeType = this.grid[row][col];
                const biomeStats = Biome.get(biomeType);

                if (Math.random() < biomeStats.foodProduction * 0.2) {
                    this.entities.push(new Plant(x, y, biomeType));
                }
            }
        }
    }

    render(ctx) {
        for (let y = 0; y < this.rows; y++) {
            for (let x = 0; x < this.cols; x++) {
                const biome = this.grid[y][x];
                ctx.fillStyle = Biome.getColor(biome);
                ctx.fillRect(x * this.tileSize, y * this.tileSize, this.tileSize, this.tileSize);
            }
        }

        this.densityField.update(this.entities);
        this.densityField.render(ctx);

        this.renderBiomeStats(ctx);
    }

    renderBiomeStats(ctx) {
        const biomeStats = this.getBiomeStats();
        const biomes = ['Tundra', 'Mountain', 'Forest', 'Desert', 'Sea'];
        const colors = {
            'Tundra': '#FFFFFF',
            'Mountain': '#888888',
            'Forest': '#228B22',
            'Desert': '#FFD700',
            'Sea': '#1E90FF'
        };

        const biomeYPositions = {
            'Tundra': 40,
            'Mountain': 120,
            'Forest': 200,
            'Desert': 280,
            'Sea': 360
        };

        biomes.forEach(biomeName => {
            const stats = biomeStats[biomeName];
            const y = biomeYPositions[biomeName];

            ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
            ctx.fillRect(10, y - 35, 140, 70);

            ctx.strokeStyle = colors[biomeName];
            ctx.lineWidth = 2;
            ctx.strokeRect(10, y - 35, 140, 70);

            ctx.fillStyle = colors[biomeName];
            ctx.font = 'bold 12px Arial';
            ctx.fillText(biomeName, 20, y - 20);

            ctx.fillStyle = 'white';
            ctx.font = '10px Arial';
            ctx.fillText(`🌿 ${stats.plants}`, 20, y);
            ctx.fillText(`🔲 ${stats.herbivores}`, 20, y + 12);
            ctx.fillText(`⚫ ${stats.carnivores}`, 80, y);
            ctx.fillText(`⬡ ${stats.omnivores}`, 80, y + 12);

            const total = stats.plants + stats.herbivores + stats.carnivores + stats.omnivores;
            ctx.fillStyle = colors[biomeName];
            ctx.font = 'bold 10px Arial';
            ctx.fillText(`Total: ${total}`, 20, y + 26);
        });
    }

    handleGodPower(data) {
        if (data.type === 'RAIN') {
            this.entities.forEach(e => {
                if (e.type === 'plant') e.growth = Math.min(e.maxGrowth, e.growth + 20);
            });
            for (let i = 0; i < 20; i++) this.spawnPlants();
        } else if (data.type === 'METEOR') {
            const killCount = Math.floor(this.entities.length * 0.2);
            for (let i = 0; i < killCount; i++) {
                const idx = Math.floor(Math.random() * this.entities.length);
                if (this.entities[idx]) this.entities[idx].isDead = true;
            }
        }
    }

    getStats() {
        const stats = {
            plants: 0,
            creatures: 0,
            herbivores: 0,
            carnivores: 0,
            omnivores: 0
        };

        this.entities.forEach(e => {
            if (e.type === 'plant') stats.plants++;
            if (e.type === 'creature') {
                stats.creatures++;
                if (e.diet === DietType.HERBIVORE) stats.herbivores++;
                if (e.diet === DietType.CARNIVORE) stats.carnivores++;
                if (e.diet === DietType.OMNIVORE) stats.omnivores++;
            }
        });

        return stats;
    }

    getBiomeStats() {
        const biomeStats = {
            'Tundra': { plants: 0, herbivores: 0, carnivores: 0, omnivores: 0 },
            'Mountain': { plants: 0, herbivores: 0, carnivores: 0, omnivores: 0 },
            'Forest': { plants: 0, herbivores: 0, carnivores: 0, omnivores: 0 },
            'Desert': { plants: 0, herbivores: 0, carnivores: 0, omnivores: 0 },
            'Sea': { plants: 0, herbivores: 0, carnivores: 0, omnivores: 0 }
        };

        this.entities.forEach(entity => {
            if (entity.isDead) return;

            const col = Math.floor(entity.x / this.tileSize);
            const row = Math.floor(entity.y / this.tileSize);

            if (col >= 0 && col < this.cols && row >= 0 && row < this.rows) {
                const biome = this.grid[row][col];

                if (entity.type === 'plant') {
                    biomeStats[biome].plants++;
                } else if (entity.type === 'creature') {
                    if (entity.diet === DietType.HERBIVORE) biomeStats[biome].herbivores++;
                    if (entity.diet === DietType.CARNIVORE) biomeStats[biome].carnivores++;
                    if (entity.diet === DietType.OMNIVORE) biomeStats[biome].omnivores++;
                }
            }
        });

        return biomeStats;
    }
}


// ==== src/core/EventBus.js ====
class EventBus {
    constructor() {
        this.listeners = {};
    }

    on(event, callback) {
        if (!this.listeners[event]) {
            this.listeners[event] = [];
        }
        this.listeners[event].push(callback);
    }

    off(event, callback) {
        if (!this.listeners[event]) return;
        this.listeners[event] = this.listeners[event].filter(cb => cb !== callback);
    }

    emit(event, data) {
        if (!this.listeners[event]) return;
        this.listeners[event].forEach(callback => callback(data));
    }
}

// ==== src/core/TimeSystem.js ====
class TimeSystem {
    constructor(eventBus) {
        this.eventBus = eventBus;
        this.dayDuration = 5000; // 5 seconds per day
        this.accumulatedTime = 0;
        this.day = 0;
        this.year = 0;
        this.timeScale = 1;
        this.isPaused = false;
    }

    update(deltaTime) {
        if (this.isPaused) return;

        this.accumulatedTime += deltaTime * this.timeScale;

        while (this.accumulatedTime >= this.dayDuration) {
            this.accumulatedTime -= this.dayDuration;
            this.advanceDay();
        }
    }

    advanceDay() {
        this.day++;
        if (this.day % 365 === 0) {
            this.year++;
            this.eventBus.emit('yearChanged', this.year);
        }
        this.eventBus.emit('dayChanged', this.day);
    }

    setSpeed(scale) {
        this.timeScale = scale;
    }

    pause() {
        this.isPaused = true;
    }

    resume() {
        this.isPaused = false;
    }
}

// ==== src/world/Biome.js ====
const BiomeType = {
    TUNDRA: 'Tundra',
    FOREST: 'Forest',
    DESERT: 'Desert',
    SEA: 'Sea',
    MOUNTAIN: 'Mountain'
};

const BiomeStats = {
    [BiomeType.TUNDRA]: {
        color: '#E0F7FA',
        foodProduction: 0.3,
        temperature: -10,
        description: 'Cold and barren, hard to survive.'
    },
    [BiomeType.FOREST]: {
        color: '#4CAF50',
        foodProduction: 1.0,
        temperature: 20,
        description: 'Lush and full of life.'
    },
    [BiomeType.DESERT]: {
        color: '#FFF59D',
        foodProduction: 0.2,
        temperature: 40,
        description: 'Hot and dry, scarce food.'
    },
    [BiomeType.SEA]: {
        color: '#2196F3',
        foodProduction: 0.8,
        temperature: 15,
        description: 'Water world, rich in marine life.'
    },
    [BiomeType.MOUNTAIN]: {
        color: '#9E9E9E',
        foodProduction: 0.4,
        temperature: 5,
        description: 'High altitude, rocky terrain.'
    }
};

class Biome {
    static get(type) {
        return BiomeStats[type];
    }

    static getColor(type) {
        return BiomeStats[type].color;
    }
}

// ==== src/entities/Entity.js ====
class Entity {
    constructor(x, y, type) {
        this.x = x;
        this.y = y;
        this.type = type;
        this.isDead = false;
        this.age = 0;
        this.id = Math.random().toString(36).substr(2, 9);
    }

    update(deltaTime) {
        this.age += deltaTime;
    }

    render(ctx) {
        ctx.fillStyle = 'white';
        ctx.fillRect(this.x, this.y, 5, 5);
    }
}

// ==== src/entities/Plant.js ====

// Configuración de plantas por bioma
const PlantConfig = {
    [BiomeType.TUNDRA]: {
        name: 'Musgo Ártico',
        color: '#81C784',
        growthRate: 0.05,
        energy: 5,
        survivalDays: 5,
        minSize: 4,
        maxSize: 8,
        shape: 'circle'
    },
    [BiomeType.MOUNTAIN]: {
        name: 'Arbusto Rocoso',
        color: '#558B2F',
        growthRate: 0.07,
        energy: 8,
        survivalDays: 4,
        minSize: 6,
        maxSize: 12,
        shape: 'pentagon'
    },
    [BiomeType.FOREST]: {
        name: 'Helecho Frondoso',
        color: '#4CAF50',
        growthRate: 0.15,
        energy: 15,
        survivalDays: 3,
        minSize: 8,
        maxSize: 16,
        shape: 'triangle'
    },
    [BiomeType.DESERT]: {
        name: 'Cactus',
        color: '#26A69A',
        growthRate: 0.04,
        energy: 6,
        survivalDays: 7,
        minSize: 5,
        maxSize: 14,
        shape: 'cactus'
    },
    [BiomeType.SEA]: {
        name: 'Alga Marina',
        color: '#00897B',
        growthRate: 0.12,
        energy: 12,
        survivalDays: 3,
        minSize: 6,
        maxSize: 14,
        shape: 'seaweed'
    }
};

class Plant extends Entity {
    constructor(x, y, biomeType) {
        super(x, y, 'plant');
        this.biomeType = biomeType;

        // Obtener configuración según el bioma
        const config = PlantConfig[biomeType] || PlantConfig[BiomeType.FOREST];

        this.name = config.name;
        this.color = config.color;
        this.growthRate = config.growthRate;
        this.energy = config.energy;
        this.survivalDays = config.survivalDays;
        this.minSize = config.minSize;
        this.maxSize = config.maxSize;
        this.shape = config.shape;

        this.growth = 0;
        this.maxGrowth = 100;
        this.reproductionThreshold = 80;
    }

    update(deltaTime, world) {
        super.update(deltaTime);

        // Crecimiento con tasa específica del bioma
        if (this.growth < this.maxGrowth) {
            this.growth += this.growthRate;
        }
    }

    markAsEaten() {
        this.hasBeenEaten = true;
    }

    render(ctx) {
        const growthPercent = this.growth / this.maxGrowth;
        const size = this.minSize + (this.maxSize - this.minSize) * growthPercent;

        ctx.fillStyle = this.color;

        switch (this.shape) {
            case 'circle': // Musgo Ártico (Tundra)
                ctx.beginPath();
                ctx.arc(this.x, this.y, size / 2, 0, Math.PI * 2);
                ctx.fill();
                break;

            case 'pentagon': // Arbusto Rocoso (Mountain)
                this.renderPentagon(ctx, size);
                break;

            case 'triangle': // Helecho Frondoso (Forest)
                ctx.beginPath();
                ctx.moveTo(this.x, this.y - size / 2);
                ctx.lineTo(this.x - size / 2, this.y + size / 2);
                ctx.lineTo(this.x + size / 2, this.y + size / 2);
                ctx.closePath();
                ctx.fill();
                break;

            case 'cactus': // Cactus (Desert)
                this.renderCactus(ctx, size);
                break;

            case 'seaweed': // Alga Marina (Sea)
                this.renderSeaweed(ctx, size);
                break;

            default:
                // Forma por defecto
                ctx.fillRect(this.x - size / 2, this.y - size / 2, size, size);
        }
    }

    renderPentagon(ctx, size) {
        ctx.beginPath();
        const radius = size / 2;
        for (let i = 0; i < 5; i++) {
            const angle = (Math.PI * 2 / 5) * i - Math.PI / 2;
            const x = this.x + radius * Math.cos(angle);
            const y = this.y + radius * Math.sin(angle);
            if (i === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        }
        ctx.closePath();
        ctx.fill();
    }

    renderCactus(ctx, size) {
        const width = size / 3;
        const height = size;

        // Cuerpo principal
        ctx.fillRect(this.x - width / 2, this.y - height / 2, width, height);

        // Brazos laterales (más pequeños)
        const armSize = size * 0.4;
        ctx.fillRect(this.x - width / 2 - armSize / 2, this.y - height / 4, armSize / 2, armSize / 1.5);
        ctx.fillRect(this.x + width / 2, this.y, armSize / 2, armSize / 1.5);
    }

    renderSeaweed(ctx, size) {
        ctx.strokeStyle = this.color;
        ctx.lineWidth = size / 4;
        ctx.lineCap = 'round';

        ctx.beginPath();
        const segments = 4;
        const segmentHeight = size / segments;

        for (let i = 0; i <= segments; i++) {
            const yPos = this.y - size / 2 + i * segmentHeight;
            const xOffset = Math.sin(i * 0.8) * (size / 6);

            if (i === 0) {
                ctx.moveTo(this.x + xOffset, yPos);
            } else {
                ctx.lineTo(this.x + xOffset, yPos);
            }
        }
        ctx.stroke();
    }
}

// ==== src/entities/Genetics.js ====
const TraitType = {
    ADAPTABILITY: 'Adaptability',
    ATTACK: 'Attack',
    DEFENSE: 'Defense',
    SPEED: 'Speed',
    CAMOUFLAGE: 'Camouflage',
    REPRODUCTION: 'Reproduction',
    LEARNING: 'Learning'
};

class Genetics {
    constructor(traits = {}) {
        this.traits = {
            [TraitType.ADAPTABILITY]: traits[TraitType.ADAPTABILITY] || 0.5,
            [TraitType.ATTACK]: traits[TraitType.ATTACK] || 0.5,
            [TraitType.DEFENSE]: traits[TraitType.DEFENSE] || 0.5,
            [TraitType.SPEED]: traits[TraitType.SPEED] || 0.5,
            [TraitType.CAMOUFLAGE]: traits[TraitType.CAMOUFLAGE] || 0.5,
            [TraitType.REPRODUCTION]: traits[TraitType.REPRODUCTION] || 0.5,
            [TraitType.LEARNING]: traits[TraitType.LEARNING] || 0.5
        };
    }

    static combine(parentA, parentB) {
        const newTraits = {};
        for (const key in TraitType) {
            const trait = TraitType[key];
            const valA = parentA.traits[trait];
            const valB = parentB.traits[trait];

            const total = valA + valB;
            let chosenVal = (Math.random() * total < valA) ? valA : valB;

            if (Math.random() < 0.1) {
                chosenVal += (Math.random() - 0.5) * 0.2;
                chosenVal = Math.max(0, Math.min(1, chosenVal));
            }

            newTraits[trait] = chosenVal;
        }
        return new Genetics(newTraits);
    }

    static random() {
        const traits = {};
        for (const key in TraitType) {
            traits[TraitType[key]] = Math.random();
        }
        return new Genetics(traits);
    }

    getAdaptedBiomes() {
        // Higher adaptability = can live in more biome types
        const adaptability = this.traits[TraitType.ADAPTABILITY];
        const biomes = ['Tundra', 'Mountain', 'Forest', 'Desert', 'Sea'];

        // 0.0-0.2: 1 biome, 0.2-0.4: 2 biomes, 0.4-0.6: 3 biomes, 0.6-0.8: 4 biomes, 0.8-1.0: 5 biomes
        const numBiomes = Math.min(5, Math.floor(adaptability * 5) + 1);

        // Shuffle and take first numBiomes
        const shuffled = biomes.sort(() => Math.random() - 0.5);
        return shuffled.slice(0, numBiomes);
    }
}

// ==== src/entities/Creature.js ====

const DietType = {
    HERBIVORE: 'Herbivore',
    CARNIVORE: 'Carnivore',
    OMNIVORE: 'Omnivore'
};

const Gender = {
    MALE: 'Male',
    FEMALE: 'Female'
};

class Creature extends Entity {
    constructor(x, y, diet, genetics, world) {
        super(x, y, 'creature');
        this.diet = diet;
        this.genetics = genetics || Genetics.random();

        this.speed = 1 + this.genetics.traits[TraitType.SPEED] * 2;
        this.attack = this.genetics.traits[TraitType.ATTACK];
        this.defense = this.genetics.traits[TraitType.DEFENSE];

        // Rango de detección aumentado para carnívoros y omnívoros
        if (this.diet === DietType.CARNIVORE || this.diet === DietType.OMNIVORE) {
            this.senseRange = 250; // Carnívoros/Omnívoros: rango amplio para cazar
        } else {
            this.senseRange = 100; // Herbívoros: rango normal
        }

        this.matingCooldown = 10000;
        this.cooldowns = {
            mating: 0
        };

        this.mealsToday = 0;
        this.dayTimer = 0;

        // Sistema de eficiencia metabólica
        this.distanceTraveledToday = 0;
        this.lastX = x;
        this.lastY = y;

        this.state = 'WANDER';
        this.wanderAngle = Math.random() * Math.PI * 2;
        this.daysWithoutFood = 0;
        this.age = 0; // Edad en días

        // Sistema de demografía poblacional
        // Cada entidad representa un GRUPO con composición interna
        this.demographics = {
            // Ratio de machos (0.0-1.0), distribución normal ~0.5
            maleRatio: this.generateNormalRatio(0.5, 0.1),

            // Ratio heterosexual (0.0-1.0), distribución normal ~0.9
            heterosexualRatio: this.generateNormalRatio(0.9, 0.05)
        };

        // Tamaño de la población grupal (número de individuos en el grupo)
        this.populationSize = Math.floor(Math.random() * 40) + 10; // 10-50 individuos

        // IMPORTANTE: Solo viven en su bioma de nacimiento
        // Sistema de adaptabilidad desactivado para futuro uso
        this.birthBiome = world.getBiomeAt(x, y);
        this.adaptedBiomes = [this.birthBiome];
        this.currentBiome = this.birthBiome;

        this.inCombat = false;
        this.combatTarget = null;
        this.fleeTarget = null;
    }

    generateNormalRatio(mean, stdDev) {
        // Genera valor con distribución normal, limitado a [0, 1]
        let val = mean + stdDev * (Math.random() + Math.random() - 1);
        return Math.max(0, Math.min(1, val));
    }

    calculateReproductionCompatibility(partner) {
        // Machos heterosexuales en este grupo buscando hembras
        const thisMalesLookingForFemales = this.demographics.maleRatio *
            this.demographics.heterosexualRatio;

        // Hembras heterosexuales en este grupo buscando machos
        const thisFemalesLookingForMales = (1 - this.demographics.maleRatio) *
            this.demographics.heterosexualRatio;

        // Lo mismo para el partner
        const partnerMalesLookingForFemales = partner.demographics.maleRatio *
            partner.demographics.heterosexualRatio;
        const partnerFemalesLookingForMales = (1 - partner.demographics.maleRatio) *
            partner.demographics.heterosexualRatio;

        // Parejas compatibles: machos de A con hembras de B + machos de B con hembras de A
        const compatiblePairs = (thisMalesLookingForFemales * partnerFemalesLookingForMales) +
            (partnerMalesLookingForFemales * thisFemalesLookingForMales);

        return compatiblePairs; // 0.0-1.0+, mayor = más compatibilidad
    }

    get dailyMealRequirement() {
        if (this.diet === DietType.HERBIVORE) return 1;
        if (this.diet === DietType.CARNIVORE) return 1;
        if (this.diet === DietType.OMNIVORE) return 1;
        return 1;
    }

    get maxDaysWithoutFood() {
        if (this.diet === DietType.HERBIVORE) return 7;
        if (this.diet === DietType.CARNIVORE) return 4;
        if (this.diet === DietType.OMNIVORE) return 3;
        return 3;
    }

    update(deltaTime, world) {
        super.update(deltaTime);

        // Trackear distancia para metabolismo
        const dist = Math.sqrt(Math.pow(this.x - this.lastX, 2) + Math.pow(this.y - this.lastY, 2));
        this.distanceTraveledToday += dist;
        this.lastX = this.x;
        this.lastY = this.y;

        this.updateCurrentBiome(world);

        this.dayTimer += deltaTime;
        if (this.dayTimer >= 5000) {
            this.onNewDay();
            this.dayTimer = 0;
        }

        this.decideState(world);
        this.act(deltaTime, world);
    }

    updateCurrentBiome(world) {
        const col = Math.floor(this.x / world.tileSize);
        const row = Math.floor(this.y / world.tileSize);

        if (col >= 0 && col < world.cols && row >= 0 && row < world.rows) {
            this.currentBiome = world.grid[row][col];
        }
    }

    onNewDay() {
        // Envejecimiento natural
        this.age = (this.age || 0) + 1; // Edad en días (no milisegundos)

        if (this.age >= 10) {
            this.isDead = true;
            return;
        }

        if (this.mealsToday >= this.dailyMealRequirement) {
            this.daysWithoutFood = 0;
        } else {
            // Metabolismo eficiente: Si se movió poco (< 300px), el hambre crece la mitad
            // Esto simula ahorro de energía al estar quieto o pastando en una zona rica
            let hungerIncrease = 1;
            if (this.distanceTraveledToday < 300) {
                hungerIncrease = 0.5;
            }

            this.daysWithoutFood += hungerIncrease;
        }

        if (this.daysWithoutFood >= this.maxDaysWithoutFood) {
            this.isDead = true;
        }

        this.mealsToday = 0;
        this.distanceTraveledToday = 0; // Reset distancia diaria
    }

    decideState(world) {
        if (this.fleeTarget && !this.fleeTarget.isDead) {
            this.state = 'FLEE';
            return;
        }

        if (this.fleeTarget && this.fleeTarget.isDead) {
            this.fleeTarget = null;
        }

        if (this.mealsToday < this.dailyMealRequirement) {
            this.state = 'SEEK_FOOD';
        } else if (this.age >= 2 && this.daysWithoutFood === 0) { // Adultos (2+ días) buscan pareja
            this.state = 'SEEK_MATE';
        } else {
            this.state = 'WANDER';
        }
    }

    act(deltaTime, world) {
        if (this.state === 'FLEE') {
            this.flee(deltaTime, world);
        } else if (this.state === 'WANDER') {
            this.wander(deltaTime, world);
        } else if (this.state === 'SEEK_FOOD') {
            this.seekFood(world, deltaTime);
        } else if (this.state === 'SEEK_MATE') {
            this.seekMate(world, deltaTime);
        }

        if (this.cooldowns.mating > 0) this.cooldowns.mating -= deltaTime;
    }

    canMoveTo(x, y, world) {
        const col = Math.floor(x / world.tileSize);
        const row = Math.floor(y / world.tileSize);

        if (col < 0 || col >= world.cols || row < 0 || row >= world.rows) {
            return false;
        }

        const targetBiome = world.grid[row][col];
        return this.adaptedBiomes.includes(targetBiome);
    }

    flee(deltaTime, world) {
        if (!this.fleeTarget || this.fleeTarget.isDead) {
            this.fleeTarget = null;
            this.state = 'WANDER';
            return;
        }

        const dx = this.x - this.fleeTarget.x;
        const dy = this.y - this.fleeTarget.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist > this.senseRange * 2) {
            this.fleeTarget = null;
            return;
        }

        const angle = Math.atan2(dy, dx);
        const newX = this.x + Math.cos(angle) * this.speed * 1.5;
        const newY = this.y + Math.sin(angle) * this.speed * 1.5;

        if (this.canMoveTo(newX, newY, world)) {
            this.x = newX;
            this.y = newY;
            this.x = Math.max(0, Math.min(world.width, this.x));
            this.y = Math.max(0, Math.min(world.height, this.y));
        }
    }

    wander(deltaTime, world) {
        if (Math.random() < 0.05) {
            this.wanderAngle = Math.random() * Math.PI * 2;
        }
        this.wanderAngle = this.wanderAngle || 0;

        const newX = this.x + Math.cos(this.wanderAngle) * this.speed;
        const newY = this.y + Math.sin(this.wanderAngle) * this.speed;

        if (this.canMoveTo(newX, newY, world)) {
            this.x = newX;
            this.y = newY;
            this.x = Math.max(0, Math.min(world.width, this.x));
            this.y = Math.max(0, Math.min(world.height, this.y));
        } else {
            this.wanderAngle = Math.random() * Math.PI * 2;
        }
    }

    seekFood(world, deltaTime) {
        let nearest = null;

        // Carnívoros Y omnívoros pueden cazar herbívoros
        if (this.diet === DietType.CARNIVORE || this.diet === DietType.OMNIVORE) {
            nearest = this.findNearestHerbivore(world);
        }

        // Si no encuentran presa (o son herbívoros), buscan plantas
        if (!nearest) {
            nearest = this.findNearestFood(world);
        }

        if (nearest) {
            const dx = nearest.x - this.x;
            const dy = nearest.y - this.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            const angle = Math.atan2(dy, dx);

            const newX = this.x + Math.cos(angle) * this.speed;
            const newY = this.y + Math.sin(angle) * this.speed;

            if (this.canMoveTo(newX, newY, world)) {
                this.x = newX;
                this.y = newY;
            }

            if (dist < 10) {
                if (nearest.type === 'creature') {
                    this.engageCombat(nearest);
                } else {
                    this.eat(nearest);
                }
            }
        } else {
            this.wander(deltaTime, world);
        }
    }

    engageCombat(opponent) {
        const myPower = this.attack + Math.random() * 0.3;
        const opponentPower = opponent.defense + Math.random() * 0.3;

        this.inCombat = true;
        this.combatTarget = opponent;

        if (myPower > opponentPower) {
            this.eat(opponent);
            this.inCombat = false;
            this.combatTarget = null;
        } else {
            this.fleeTarget = opponent;
            this.state = 'FLEE';
            this.inCombat = false;
            this.combatTarget = null;
        }
    }

    findNearestHerbivore(world) {
        let nearest = null;
        let minDist = Infinity;

        world.entities.forEach(entity => {
            if (entity === this) return;
            if (entity.isDead) return;
            if (entity.type !== 'creature') return;
            if (entity.diet !== DietType.HERBIVORE) return;

            const dx = entity.x - this.x;
            const dy = entity.y - this.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < this.senseRange && dist < minDist) {
                minDist = dist;
                nearest = entity;
            }
        });

        return nearest;
    }

    findNearestFood(world) {
        let nearest = null;
        let minDist = Infinity;

        world.entities.forEach(entity => {
            if (entity === this) return;
            if (entity.isDead) return;

            let isValid = false;
            if (this.diet === DietType.HERBIVORE && entity.type === 'plant') isValid = true;
            if (this.diet === DietType.CARNIVORE && entity.type === 'creature') isValid = true;
            if (this.diet === DietType.OMNIVORE && (entity.type === 'plant' || entity.type === 'creature')) isValid = true;

            if (isValid) {
                const dx = entity.x - this.x;
                const dy = entity.y - this.y;
                const dist = Math.sqrt(dx * dx + dy * dy);

                if (dist < this.senseRange && dist < minDist) {
                    minDist = dist;
                    nearest = entity;
                }
            }
        });

        return nearest;
    }

    eat(entity) {
        if (entity.type === 'plant' && entity.markAsEaten) {
            entity.markAsEaten();
        }

        this.mealsToday++;

        if (this.diet === DietType.OMNIVORE && entity.type === 'creature') {
            this.mealsToday++;
        }

        entity.isDead = true;
        this.state = 'WANDER';
    }

    seekMate(world, deltaTime) {
        if (this.cooldowns.mating > 0) {
            this.state = 'WANDER';
            return;
        }

        let nearest = null;
        let maxCompatibility = 0;

        world.entities.forEach(entity => {
            if (entity === this) return;
            if (entity.type !== 'creature') return;
            if (entity.isDead) return;
            if (entity.diet !== this.diet) return;

            const dx = entity.x - this.x;
            const dy = entity.y - this.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < this.senseRange) {
                const compatibility = this.calculateReproductionCompatibility(entity);

                // Solo considerar si hay compatibilidad mínima (>5% de parejas viables)
                if (compatibility > 0.05 && compatibility > maxCompatibility) {
                    maxCompatibility = compatibility;
                    nearest = entity;
                }
            }
        });

        if (nearest) {
            const dx = nearest.x - this.x;
            const dy = nearest.y - this.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            const angle = Math.atan2(dy, dx);

            const newX = this.x + Math.cos(angle) * this.speed;
            const newY = this.y + Math.sin(angle) * this.speed;

            if (this.canMoveTo(newX, newY, world)) {
                this.x = newX;
                this.y = newY;
            }

            if (maxCompatibility > 0 && dist < 10) {
                this.reproduce(nearest, world);
            }
        } else {
            this.wander(deltaTime, world);
        }
    }

    reproduce(partner, world) {
        const compatibility = this.calculateReproductionCompatibility(partner);

        // La probabilidad de reproducción depende de la compatibilidad demográfica
        if (Math.random() > compatibility) {
            // No suficientes parejas compatibles, abortar
            this.state = 'WANDER';
            return;
        }

        this.cooldowns.mating = 10000;
        partner.cooldowns.mating = 10000;

        // Siempre spawn desde un grupo (no importa cuál)
        this.spawnChild(partner, world);

        this.state = 'WANDER';
    }

    spawnChild(partner, world) {
        const childGenetics = Genetics.combine(this.genetics, partner.genetics);
        const child = new Creature(this.x, this.y, this.diet, childGenetics, world);

        // La descendencia hereda demografía promedio con mutación
        child.demographics.maleRatio = (this.demographics.maleRatio + partner.demographics.maleRatio) / 2;
        child.demographics.maleRatio += (Math.random() - 0.5) * 0.1; // ±5% mutación
        child.demographics.maleRatio = Math.max(0, Math.min(1, child.demographics.maleRatio));

        child.demographics.heterosexualRatio = (this.demographics.heterosexualRatio + partner.demographics.heterosexualRatio) / 2;
        child.demographics.heterosexualRatio += (Math.random() - 0.5) * 0.05; // ±2.5% mutación
        child.demographics.heterosexualRatio = Math.max(0, Math.min(1, child.demographics.heterosexualRatio));

        // Heredar tamaño poblacional promedio con variación
        child.populationSize = Math.floor((this.populationSize + partner.populationSize) / 2);
        child.populationSize += Math.floor((Math.random() - 0.5) * 10); // ±5 individuos
        child.populationSize = Math.max(5, Math.min(100, child.populationSize)); // Límites: 5-100

        world.entities.push(child);
    }

    render(ctx) {
        const size = 10;
        ctx.fillStyle = this.diet === DietType.HERBIVORE ? '#8BC34A' : (this.diet === DietType.CARNIVORE ? '#F44336' : '#FF9800');

        if (this.state === 'FLEE') {
            ctx.strokeStyle = '#FF00FF';
            ctx.lineWidth = 3;
        } else if (this.inCombat) {
            ctx.strokeStyle = '#FFFF00';
            ctx.lineWidth = 3;
        } else if (this.daysWithoutFood > 0) {
            ctx.strokeStyle = '#FF0000';
            ctx.lineWidth = 2;
        } else {
            // Color de borde según predominancia demográfica
            const maleRatio = this.demographics.maleRatio;
            ctx.strokeStyle = maleRatio > 0.6 ? '#2196F3' : (maleRatio < 0.4 ? '#E91E63' : '#9C27B0');
            ctx.lineWidth = 1;
        }

        ctx.beginPath();

        if (this.diet === DietType.HERBIVORE) {
            ctx.rect(this.x - size / 2, this.y - size / 2, size, size);
        } else if (this.diet === DietType.CARNIVORE) {
            ctx.arc(this.x, this.y, size / 2, 0, Math.PI * 2);
        } else if (this.diet === DietType.OMNIVORE) {
            const angleStep = Math.PI / 3;
            for (let i = 0; i < 6; i++) {
                const angle = angleStep * i - Math.PI / 2;
                const px = this.x + (size / 2) * Math.cos(angle);
                const py = this.y + (size / 2) * Math.sin(angle);
                if (i === 0) ctx.moveTo(px, py);
                else ctx.lineTo(px, py);
            }
            ctx.closePath();
        }

        ctx.fill();
        ctx.stroke();
    }
}

// ==== src/rendering/DensityField.js ====
class DensityField {
    constructor(width, height, scale = 0.25) {
        this.width = width;
        this.height = height;
        this.scale = scale;

        // Canvas de baja resolución para performance
        this.fieldWidth = Math.floor(width * scale);
        this.fieldHeight = Math.floor(height * scale);

        this.canvas = document.createElement('canvas');
        this.canvas.width = this.fieldWidth;
        this.canvas.height = this.fieldHeight;
        this.ctx = this.canvas.getContext('2d');

        // Radios de gradiente por tipo de entidad (reducidos para más definición)
        this.splatRadius = {
            plant: 15 * scale,
            herbivore: 18 * scale,
            carnivore: 20 * scale,
            omnivore: 19 * scale
        };

        // Colores por tipo
        this.colors = {
            plant: { r: 76, g: 175, b: 80 },       // #4CAF50
            herbivore: { r: 139, g: 195, b: 74 },  // #8BC34A
            carnivore: { r: 244, g: 67, b: 54 },   // #F44336
            omnivore: { r: 255, g: 152, b: 0 }     // #FF9800
        };
    }

    clear() {
        this.ctx.clearRect(0, 0, this.fieldWidth, this.fieldHeight);
    }

    update(entities) {
        this.clear();

        // Agrupar entidades por tipo para renderizar en capas
        const layers = {
            plant: [],
            herbivore: [],
            carnivore: [],
            omnivore: []
        };

        entities.forEach(entity => {
            if (entity.isDead) return;

            if (entity.type === 'plant') {
                layers.plant.push(entity);
            } else if (entity.type === 'creature') {
                if (entity.diet === 'Herbivore') {
                    layers.herbivore.push(entity);
                } else if (entity.diet === 'Carnivore') {
                    layers.carnivore.push(entity);
                } else if (entity.diet === 'Omnivore') {
                    layers.omnivore.push(entity);
                }
            }
        });

        // Renderizar cada capa con blend mode aditivo
        this.ctx.globalCompositeOperation = 'lighter';

        this.renderLayer(layers.plant, 'plant');
        this.renderLayer(layers.herbivore, 'herbivore');
        this.renderLayer(layers.carnivore, 'carnivore');
        this.renderLayer(layers.omnivore, 'omnivore');

        this.ctx.globalCompositeOperation = 'source-over';
    }

    renderLayer(entities, type) {
        const color = this.colors[type];
        const radius = this.splatRadius[type];

        entities.forEach(entity => {
            this.drawSplat(
                entity.x * this.scale,
                entity.y * this.scale,
                radius,
                color
            );
        });
    }

    drawSplat(x, y, radius, color) {
        // Crear gradiente radial
        const gradient = this.ctx.createRadialGradient(x, y, 0, x, y, radius);

        // Centro más opaco con transición más abrupta para más definición
        gradient.addColorStop(0, `rgba(${color.r}, ${color.g}, ${color.b}, 0.8)`);
        gradient.addColorStop(0.6, `rgba(${color.r}, ${color.g}, ${color.b}, 0.2)`);
        gradient.addColorStop(1, `rgba(${color.r}, ${color.g}, ${color.b}, 0)`);

        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(x - radius, y - radius, radius * 2, radius * 2);
    }

    render(targetCtx) {
        // Escalar y renderizar el campo de densidad en el canvas principal
        targetCtx.save();
        targetCtx.imageSmoothingEnabled = true;
        targetCtx.imageSmoothingQuality = 'high';

        targetCtx.drawImage(
            this.canvas,
            0, 0, this.fieldWidth, this.fieldHeight,
            0, 0, this.width, this.height
        );

        targetCtx.restore();
    }
}

// ==== src/world/World.js ====

class World {
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

// ==== src/ui/UI.js ====
class UI {
    constructor(eventBus) {
        this.eventBus = eventBus;

        this.dayCounter = document.getElementById('day-counter');
        this.yearCounter = document.getElementById('year-counter');
        this.populationStats = document.getElementById('population-stats');

        this.entityInfo = document.getElementById('entity-info');
        this.entityDetails = document.getElementById('entity-details');
        this.selectedEntity = null;

        this.btnRain = document.getElementById('btn-rain');
        this.btnMeteor = document.getElementById('btn-meteor');
        this.btnPause = document.getElementById('btn-pause');
        this.btnPlay = document.getElementById('btn-play');
        this.btnFast = document.getElementById('btn-fast');

        this.setupListeners();
        this.setupSubscriptions();
    }

    setupListeners() {
        this.btnRain.addEventListener('click', () => this.eventBus.emit('godPower', { type: 'RAIN' }));
        this.btnMeteor.addEventListener('click', () => this.eventBus.emit('godPower', { type: 'METEOR' }));

        this.btnPause.addEventListener('click', () => this.eventBus.emit('timeControl', 0));
        this.btnPlay.addEventListener('click', () => this.eventBus.emit('timeControl', 1));
        this.btnFast.addEventListener('click', () => this.eventBus.emit('timeControl', 10));
    }

    setupSubscriptions() {
        this.eventBus.on('dayChanged', (day) => {
            this.dayCounter.textContent = day;
        });

        this.eventBus.on('yearChanged', (year) => {
            this.yearCounter.textContent = year;
        });

        this.eventBus.on('statsUpdate', (stats) => {
            this.updateStats(stats);
        });

        this.eventBus.on('entitySelected', (entity) => {
            this.showEntityInfo(entity);
        });

        this.eventBus.on('entityDeselected', () => {
            this.hideEntityInfo();
        });
    }

    updateStats(stats) {
        this.populationStats.innerHTML = `
            <p>Plantas: ${stats.plants}</p>
            <p>Criaturas: ${stats.creatures}</p>
            <p>Herbívoros: ${stats.herbivores}</p>
            <p>Carnívoros: ${stats.carnivores}</p>
            <p>Omnívoros: ${stats.omnivores}</p>
        `;

        if (this.selectedEntity && !this.selectedEntity.isDead) {
            this.showEntityInfo(this.selectedEntity);
        } else if (this.selectedEntity && this.selectedEntity.isDead) {
            this.hideEntityInfo();
        }
    }

    showEntityInfo(entity) {
        this.selectedEntity = entity;
        this.entityInfo.style.display = 'block';

        if (entity.type === 'plant') {
            this.entityDetails.innerHTML = `
                <p><strong>Tipo:</strong> Planta</p>
                <p><strong>Edad:</strong> ${Math.floor(entity.age / 1000)}s</p>
                <p><strong>Crecimiento:</strong> ${Math.floor(entity.growth)}%</p>
                <p><strong>Días sin comer:</strong> ${entity.daysSinceLastEaten.toFixed(1)}</p>
                <p><strong>Bioma:</strong> ${entity.biomeType}</p>
            `;
        } else if (entity.type === 'creature') {
            const TraitType = {
                ADAPTABILITY: 'Adaptabilidad',
                ATTACK: 'Ataque',
                DEFENSE: 'Defensa',
                SPEED: 'Velocidad',
                CAMOUFLAGE: 'Camuflaje',
                REPRODUCTION: 'Reproducción',
                LEARNING: 'Aprendizaje'
            };

            const dietName = {
                'Herbivore': 'Herbívoro',
                'Carnivore': 'Carnívoro',
                'Omnivore': 'Omnívoro'
            };

            const genderSymbol = entity.gender === 'Male' ? '♂️' : '♀️';

            let traitsHTML = '';
            for (const [key, value] of Object.entries(entity.genetics.traits)) {
                const traitName = TraitType[key] || key;
                const percentage = Math.floor(value * 100);
                traitsHTML += `<span class="trait">${traitName}: ${percentage}%</span>`;
            }

            const stateNames = {
                'WANDER': 'Vagando',
                'SEEK_FOOD': 'Buscando comida',
                'SEEK_MATE': 'Buscando pareja',
                'FLEE': 'Huyendo'
            };

            this.entityDetails.innerHTML = `
                <p><strong>Tipo:</strong> ${dietName[entity.diet]}</p>
                <p><strong>Demografía:</strong></p>
                <p style="font-size: 11px;">♂ Machos: ${(entity.demographics.maleRatio * 100).toFixed(0)}%</p>
                <p style="font-size: 11px;">♀ Hembras: ${((1 - entity.demographics.maleRatio) * 100).toFixed(0)}%</p>
                <p style="font-size: 11px;">💑 Heterosexuales: ${(entity.demographics.heterosexualRatio * 100).toFixed(0)}%</p>
                <p><strong>Población:</strong> ${entity.populationSize} individuos</p>
                <p><strong>Estado:</strong> ${stateNames[entity.state] || entity.state}</p>
                <p><strong>Comidas hoy:</strong> ${entity.mealsToday}/${entity.dailyMealRequirement}</p>
                <p><strong>Días sin comida:</strong> ${entity.daysWithoutFood.toFixed(1)}</p>
                <p><strong>Bioma actual:</strong> ${entity.currentBiome || '?'}</p>
                <p><strong>Biomas adaptados:</strong></p>
                <p style="font-size: 11px;">${entity.adaptedBiomes.join(', ')}</p>
                <p><strong>Rasgos Genéticos:</strong></p>
                ${traitsHTML}
            `;
        }
    }

    hideEntityInfo() {
        this.selectedEntity = null;
        this.entityInfo.style.display = 'none';
    }
}

// ==== src/core/Game.js ====

class Game {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.width = canvas.width = window.innerWidth;
        this.height = canvas.height = window.innerHeight;

        this.eventBus = new EventBus();
        this.timeSystem = new TimeSystem(this.eventBus);
        this.world = new World(this.width, this.height, this.eventBus);
        this.ui = new UI(this.eventBus);

        this.setupGodPowers();

        this.lastTime = 0;
        this.isRunning = false;

        this.resize();
        window.addEventListener('resize', () => this.resize());
        this.canvas.addEventListener('click', (e) => this.handleClick(e));
    }

    handleClick(event) {
        const rect = this.canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;

        let closest = null;
        let minDist = 20;

        this.world.entities.forEach(entity => {
            if (entity.isDead) return;
            const dx = entity.x - x;
            const dy = entity.y - y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < minDist) {
                minDist = dist;
                closest = entity;
            }
        });

        if (closest) {
            this.eventBus.emit('entitySelected', closest);
        } else {
            this.eventBus.emit('entityDeselected');
        }
    }

    setupGodPowers() {
        this.eventBus.on('timeControl', (scale) => {
            if (scale === 0) {
                this.timeSystem.pause();
            } else {
                this.timeSystem.resume();
                this.timeSystem.setSpeed(scale);
            }
        });

        this.eventBus.on('godPower', (data) => {
            this.world.handleGodPower(data);
        });
    }

    resize() {
        this.width = this.canvas.width = window.innerWidth;
        this.height = this.canvas.height = window.innerHeight;
    }

    start() {
        if (this.isRunning) return;
        this.isRunning = true;
        this.lastTime = performance.now();
        requestAnimationFrame((t) => this.loop(t));
        console.log('Game Started');
    }

    stop() {
        this.isRunning = false;
    }

    loop(timestamp) {
        if (!this.isRunning) return;

        const deltaTime = timestamp - this.lastTime;
        this.lastTime = timestamp;

        this.update(deltaTime);
        this.render();

        requestAnimationFrame((t) => this.loop(t));
    }

    update(deltaTime) {
        if (!this.isRunning) return;

        this.timeSystem.update(deltaTime);

        // Solo actualizar el mundo si no está pausado
        // Aplicar la escala de tiempo al movimiento
        if (!this.timeSystem.isPaused) {
            const scaledDelta = deltaTime * this.timeSystem.timeScale;
            this.world.update(scaledDelta);
        }

        const stats = this.world.getStats();
        this.eventBus.emit('statsUpdate', stats);
    }

    render() {
        // Resetear matriz de transformación para asegurar limpieza total
        this.ctx.setTransform(1, 0, 0, 1, 0, 0);

        // Limpiar canvas completamente
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Resetear propiedades
        this.ctx.globalAlpha = 1.0;

        // Fondo
        this.ctx.fillStyle = '#222';
        this.ctx.fillRect(0, 0, this.width, this.height);

        this.world.render(this.ctx);
    }
}


// ==== Initialize Game ====
window.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('game-canvas');
    if (!canvas) {
        console.error('Canvas not found!');
        return;
    }
    const game = new Game(canvas);
    game.start();
});

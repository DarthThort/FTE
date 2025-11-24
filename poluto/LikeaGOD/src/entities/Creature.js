import { Entity } from './Entity.js';
import { Genetics, TraitType } from './Genetics.js';

export const DietType = {
    HERBIVORE: 'Herbivore',
    CARNIVORE: 'Carnivore',
    OMNIVORE: 'Omnivore'
};

export const Gender = {
    MALE: 'Male',
    FEMALE: 'Female'
};

export class Creature extends Entity {
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

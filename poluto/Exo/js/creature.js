// =============================================================================
// CREATURE.JS - Living Entities and Lifecycle Management
// =============================================================================

// =============================================================================
// Creature Class
// =============================================================================
class Creature {
    constructor(x, y, dna = null) {
        this.id = Utils.uuid();
        this.x = x;
        this.y = y;
        this.dna = dna || new DNA();
        this.phenotype = this.dna.getPhenotype();

        // Life stage
        this.age = 0;
        this.lifeStage = 'INFANT'; // INFANT, ADULT, SENESCENT
        this.vitality = 100; // Telomeres/life force

        // Stats
        this.energy = 100;
        this.hunger = 0;
        this.health = 100;
        this.reproductiveUrge = 0;

        // Movement
        this.vx = 0;
        this.vy = 0;
        this.rotation = 0;

        // Behavioral state
        this.currentAction = null;
        this.target = null;

        // Lifecycle tracking (for epigenetics)
        this.usageStats = {
            distanceMoved: 0,
            killCount: 0,
            biomassEaten: 0,
            timesReproduced: 0
        };

        // Reproduction
        this.reproductionCooldown = 0;

        // Reference to world
        this.world = null;

        // Dead flag
        this.isDead = false;
        this.causeOfDeath = null;
    }

    update(deltaTime, world, creatures) {
        if (this.isDead) return;

        this.world = world;

        // Age and life stages
        this.updateLifecycle(deltaTime);

        // Metabolism (constant energy drain)
        this.updateMetabolism(deltaTime);

        // Update reproductive urge
        if (this.lifeStage === 'ADULT') {
            this.reproductiveUrge = Math.min(100, this.reproductiveUrge + deltaTime * 2);
        }

        // Cooldowns
        if (this.reproductionCooldown > 0) {
            this.reproductionCooldown -= deltaTime;
        }

        // Check death conditions
        this.checkDeath();
    }

    updateLifecycle(deltaTime) {
        // Aging based on metabolism
        const agingRate = 1.0 * Math.pow(this.dna.genes.metabolism_speed + 0.5, 2);
        this.age += agingRate * deltaTime;

        // Vitality depletion (telomere erosion)
        const vitalityLoss = (this.phenotype.energyCost / 10) * deltaTime;
        this.vitality -= vitalityLoss;

        // Life stages
        const maturityAge = this.phenotype.maxLifespan * 0.15;
        const senescenceAge = this.phenotype.maxLifespan * 0.75;

        if (this.age < maturityAge) {
            this.lifeStage = 'INFANT';
        } else if (this.age < senescenceAge) {
            this.lifeStage = 'ADULT';
        } else {
            this.lifeStage = 'SENESCENT';
        }
    }

    updateMetabolism(deltaTime) {
        // Energy drain based on activity and size
        const baseDrain = this.phenotype.energyCost * deltaTime;
        const movementDrain = (Math.abs(this.vx) + Math.abs(this.vy)) * 0.1 * deltaTime;

        this.energy -= baseDrain + movementDrain;
        this.hunger += baseDrain + movementDrain;

        // Hunger effects
        if (this.energy < 20) {
            this.health -= deltaTime * 2; // Starvation damage
        }

        // Clamp values
        this.energy = Utils.clamp(this.energy, 0, 100);
        this.hunger = Utils.clamp(this.hunger, 0, 100);
        this.health = Utils.clamp(this.health, 0, 100);
    }

    checkDeath() {
        if (this.health <= 0) {
            this.die('STARVATION');
        } else if (this.vitality <= 0) {
            this.die('OLD_AGE');
        } else if (this.age > this.phenotype.maxLifespan) {
            this.die('OLD_AGE');
        }
    }

    die(cause) {
        this.isDead = true;
        this.causeOfDeath = cause;
    }

    // Movement
    move(dx, dy) {
        this.x += dx;
        this.y += dy;
        this.usageStats.distanceMoved += Math.sqrt(dx * dx + dy * dy);

        // Update rotation based on movement
        if (dx !== 0 || dy !== 0) {
            this.rotation = Math.atan2(dy, dx);
        }
    }

    // Eating
    eat(foodSource, amount) {
        const dietType = this.dna.getDietType();

        if (foodSource.type === 'BIOMASS' && (dietType === 'HERBIVORE' || dietType === 'OMNIVORE')) {
            const energyGain = amount * 5;
            this.energy = Math.min(100, this.energy + energyGain);
            this.hunger = Math.max(0, this.hunger - amount * 10);
            this.usageStats.biomassEaten += amount;
            return true;
        }

        if (foodSource.type === 'MEAT' && (dietType === 'CARNIVORE' || dietType === 'OMNIVORE')) {
            const energyGain = amount * 8;
            this.energy = Math.min(100, this.energy + energyGain);
            this.hunger = Math.max(0, this.hunger - amount * 15);
            this.usageStats.killCount += 0.5; // Partial credit for scavenging
            return true;
        }

        return false;
    }

    // Attack another creature
    attack(target) {
        if (!target || target.isDead) return false;

        const damage = this.phenotype.strength * 10;
        target.health -= damage;

        if (target.health <= 0) {
            this.usageStats.killCount += 1;
            return true; // Kill successful
        }

        return false;
    }

    // Reproduction
    canReproduce() {
        if (this.lifeStage !== 'ADULT') return false;
        if (this.reproductionCooldown > 0) return false;
        if (this.energy < 60) return false; // Need energy reserve
        if (this.reproductiveUrge < 50) return false;
        return true;
    }

    reproduceAsexual() {
        if (!this.canReproduce()) return null;

        const childDNA = createChild(this, null, this.usageStats);
        const child = new Creature(
            this.x + Utils.randomRange(-10, 10),
            this.y + Utils.randomRange(-10, 10),
            childDNA
        );

        // Costs
        this.energy -= 30;
        this.reproductiveUrge = 0;
        this.reproductionCooldown = 10; // seconds
        this.usageStats.timesReproduced += 1;

        return child;
    }

    reproduceSexual(partner) {
        if (!this.canReproduce() || !partner.canReproduce()) return null;

        // Check compatibility
        if (!isSameSpecies(this.dna, partner.dna)) return null;

        // For sexual reproduction, need opposite sexes
        const reproMode = this.dna.getReproMode();
        if (reproMode === 'SEXUAL') {
            if (this.dna.getSex() === partner.dna.getSex()) return null;
        }

        // Combine usage stats from both parents
        const combinedStats = {
            distanceMoved: (this.usageStats.distanceMoved + partner.usageStats.distanceMoved) / 2,
            killCount: (this.usageStats.killCount + partner.usageStats.killCount) / 2,
            biomassEaten: (this.usageStats.biomassEaten + partner.usageStats.biomassEaten) / 2,
            timesReproduced: 0
        };

        const childDNA = createChild(this, partner, combinedStats);
        const child = new Creature(
            (this.x + partner.x) / 2,
            (this.y + partner.y) / 2,
            childDNA
        );

        // Costs for both parents
        this.energy -= 25;
        this.reproductiveUrge = 0;
        this.reproductionCooldown = 8;
        this.usageStats.timesReproduced += 1;

        partner.energy -= 25;
        partner.reproductiveUrge = 0;
        partner.reproductionCooldown = 8;
        partner.usageStats.timesReproduced += 1;

        return child;
    }

    // Get visual size for rendering
    getVisualSize() {
        const baseSize = 8;
        let size = baseSize * this.phenotype.size;

        // Infants are smaller
        if (this.lifeStage === 'INFANT') {
            size *= 0.6;
        }

        return size;
    }
}

// =============================================================================
// Cadaver Class (Dead creature remains)
// =============================================================================
class Cadaver {
    constructor(creature) {
        this.x = creature.x;
        this.y = creature.y;
        this.meatValue = creature.phenotype.size * 50;
        this.decayTime = 30; // seconds until disappears
        this.type = 'MEAT';
    }

    update(deltaTime) {
        this.decayTime -= deltaTime;
    }

    isDecayed() {
        return this.decayTime <= 0 || this.meatValue <= 0;
    }
}

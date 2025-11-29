// =============================================================================
// ABILITIES.JS - Fantasy/Special Abilities System
// =============================================================================

class Abilities {
    /**
     * Fire Breath - High damage area attack with high energy cost
     */
    static useFireBreath(creature, targets, deltaTime) {
        // Requires high fire_gland gene
        if (creature.dna.genes.fire_gland < 0.7) return false;

        // High energy cost
        const energyCost = 30;
        if (creature.energy < energyCost) return false;

        // Consume energy
        creature.energy -= energyCost;

        // Area of effect
        const range = 50;
        const damage = creature.phenotype.strength * 15;

        let hitCount = 0;
        for (let target of targets) {
            if (target === creature || target.isDead) continue;

            const dist = Utils.distance(creature.x, creature.y, target.x, target.y);
            if (dist < range) {
                target.health -= damage;
                hitCount++;
            }
        }

        return hitCount > 0;
    }

    /**
     * Ice Breath - Slows enemies and deals moderate damage
     */
    static useIceBreath(creature, targets, deltaTime) {
        if (creature.dna.genes.ice_breath < 0.7) return false;

        const energyCost = 25;
        if (creature.energy < energyCost) return false;

        creature.energy -= energyCost;

        const range = 60;
        const damage = creature.phenotype.strength * 10;

        let hitCount = 0;
        for (let target of targets) {
            if (target === creature || target.isDead) continue;

            const dist = Utils.distance(creature.x, creature.y, target.x, target.y);
            if (dist < range) {
                target.health -= damage;
                // Slow effect (reduce speed temporarily)
                target.slowedUntil = Date.now() + 3000; // 3 seconds
                hitCount++;
            }
        }

        return hitCount > 0;
    }

    /**
     * Poison Spit - Ranged poison attack
     */
    static usePoisonSpit(creature, target) {
        if (creature.dna.genes.poison_spit < 0.7) return false;

        const energyCost = 15;
        if (creature.energy < energyCost) return false;

        if (!target || target.isDead) return false;

        // Range check
        const dist = Utils.distance(creature.x, creature.y, target.x, target.y);
        if (dist > 100) return false;

        creature.energy -= energyCost;

        // Initial damage
        const damage = creature.phenotype.strength * 8;
        target.health -= damage;

        // Apply poison effect (damage over time)
        target.poisonedUntil = Date.now() + 5000; // 5 seconds
        target.poisonDamage = 2; // Damage per second

        return true;
    }

    /**
     * Apply ongoing effects (poison, slow, etc.)
     */
    static applyEffects(creature, deltaTime) {
        const now = Date.now();

        // Poison damage over time
        if (creature.poisonedUntil && now < creature.poisonedUntil) {
            creature.health -= (creature.poisonDamage || 2) * deltaTime;
        } else {
            creature.poisonedUntil = null;
            creature.poisonDamage = 0;
        }

        // Speed reduction from ice
        if (creature.slowedUntil && now < creature.slowedUntil) {
            // Applied in movimento (reducer velocidad)
        } else {
            creature.slowedUntil = null;
        }
    }

    /**
     * Check if creature can use any ability
     */
    static canUseAbilities(creature) {
        return (creature.dna.genes.fire_gland >= 0.7 && creature.energy >= 30) ||
            (creature.dna.genes.ice_breath >= 0.7 && creature.energy >= 25) ||
            (creature.dna.genes.poison_spit >= 0.7 && creature.energy >= 15);
    }
}

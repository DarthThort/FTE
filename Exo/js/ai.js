// =============================================================================
// AI.JS - Behavioral AI and Decision Making
// =============================================================================

// =============================================================================
// Action Classes
// =============================================================================
class Action {
    constructor(creature) {
        this.creature = creature;
    }

    execute(deltaTime, world, creatures) {
        // Override in subclasses
    }
}

class ActionWander extends Action {
    constructor(creature) {
        super(creature);
        this.changeDirectionTimer = 0;
        this.targetDirection = Math.random() * Math.PI * 2;
    }

    execute(deltaTime, world, creatures) {
        this.changeDirectionTimer -= deltaTime;

        if (this.changeDirectionTimer <= 0) {
            this.targetDirection = Math.random() * Math.PI * 2;
            this.changeDirectionTimer = Utils.randomRange(2, 5);
        }

        const speed = this.creature.phenotype.speed * 20;
        const dx = Math.cos(this.targetDirection) * speed * deltaTime;
        const dy = Math.sin(this.targetDirection) * speed * deltaTime;

        this.creature.move(dx, dy, world);

        // Keep in bounds
        const worldWidth = world.cols * world.tileSize;
        const worldHeight = world.rows * world.tileSize;
        this.creature.x = Utils.clamp(this.creature.x, 0, worldWidth);
        this.creature.y = Utils.clamp(this.creature.y, 0, worldHeight);
    }
}

class ActionForage extends Action {
    constructor(creature, target) {
        super(creature);
        this.target = target;
    }

    execute(deltaTime, world, creatures) {
        if (!this.target) {
            // Find nearest biomass
            const tile = world.getTileAt(this.creature.x, this.creature.y);
            if (tile && tile.biomass > 10) {
                // Eat here
                const eatAmount = Math.min(tile.biomass, 5 * deltaTime);
                tile.biomass -= eatAmount;
                this.creature.eat({ type: 'BIOMASS' }, eatAmount);
            }
            return;
        }

        // Move towards target
        const dx = this.target.x - this.creature.x;
        const dy = this.target.y - this.creature.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 5) {
            // Reached target, eat
            const tile = world.getTileAt(this.target.x, this.target.y);
            if (tile && tile.biomass > 0) {
                const eatAmount = Math.min(tile.biomass, 10 * deltaTime);
                tile.biomass -= eatAmount;
                this.creature.eat({ type: 'BIOMASS' }, eatAmount);
            }
        } else {
            // Move towards
            const speed = this.creature.phenotype.speed * 20;
            const moveX = (dx / dist) * speed * deltaTime;
            const moveY = (dy / dist) * speed * deltaTime;
            this.creature.move(moveX, moveY, world);
        }
    }
}

class ActionChase extends Action {
    constructor(creature, prey) {
        super(creature);
        this.prey = prey;
        if (window.game && window.game.ui) {
            window.game.ui.logEvent(`${creature.id.substring(0, 6)} está cazando a ${prey.id.substring(0, 6)}`, 'event-death');
        }
    }

    execute(deltaTime, world, creatures) {
        if (!this.prey || this.prey.isDead) {
            return;
        }

        const dx = this.prey.x - this.creature.x;
        const dy = this.prey.y - this.creature.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < this.creature.getVisualSize() + this.prey.getVisualSize()) {
            // Attack!
            const killed = this.creature.attack(this.prey);
            if (killed) {
                // Eat the corpse
                this.creature.eat({ type: 'MEAT' }, 20);
            }
        } else {
            // Chase
            const speed = this.creature.phenotype.speed * 25; // Faster when hunting
            const moveX = (dx / dist) * speed * deltaTime;
            const moveY = (dy / dist) * speed * deltaTime;
            this.creature.move(moveX, moveY, world);
        }
    }
}

class ActionFlee extends Action {
    constructor(creature, threat) {
        super(creature);
        this.threat = threat;
    }

    execute(deltaTime, world, creatures) {
        if (!this.threat || this.threat.isDead) {
            return;
        }

        const dx = this.creature.x - this.threat.x;
        const dy = this.creature.y - this.threat.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist > 0) {
            // Run away!
            const speed = this.creature.phenotype.speed * 30; // Panic speed
            const moveX = (dx / dist) * speed * deltaTime;
            const moveY = (dy / dist) * speed * deltaTime;
            this.creature.move(moveX, moveY, world);
        }
    }
}

class ActionMate extends Action {
    constructor(creature, partner) {
        super(creature);
        this.partner = partner;
    }

    execute(deltaTime, world, creatures) {
        if (!this.partner || this.partner.isDead) {
            return null;
        }

        const dx = this.partner.x - this.creature.x;
        const dy = this.partner.y - this.creature.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 20) {
            // Close enough to mate
            const child = this.creature.reproduceSexual(this.partner);
            return child;
        } else {
            // Move towards partner
            const speed = this.creature.phenotype.speed * 15;
            const moveX = (dx / dist) * speed * deltaTime;
            const moveY = (dy / dist) * speed * deltaTime;
            this.creature.move(moveX, moveY, world);
        }

        return null;
    }
}

class ActionUseAbility extends Action {
    constructor(creature, targets, abilityType) {
        super(creature);
        this.targets = targets;
        this.abilityType = abilityType; // 'FIRE', 'ICE', 'POISON'
    }

    execute(deltaTime, world, creatures) {
        if (typeof Abilities === 'undefined') return;

        let used = false;

        switch (this.abilityType) {
            case 'FIRE':
                if (this.creature.dna.genes.fire_gland >= 0.7) {
                    used = Abilities.useFireBreath(this.creature, creatures, deltaTime);
                }
                break;
            case 'ICE':
                if (this.creature.dna.genes.ice_breath >= 0.7) {
                    used = Abilities.useIceBreath(this.creature, creatures, deltaTime);
                }
                break;
            case 'POISON':
                if (this.creature.dna.genes.poison_spit >= 0.7 && this.targets.length > 0) {
                    used = Abilities.usePoisonSpit(this.creature, this.targets[0]);
                }
                break;
        }

        return used;
    }
}

// =============================================================================
// Utility AI Brain
// =============================================================================
class UtilityAI {
    static decideAction(creature, world, creatures, cadavers) {
        const dietType = creature.dna.getDietType();
        const scores = [];

        // Find nearby entities
        const nearby = this.findNearby(creature, creatures, world);

        // Score: Flee from predators
        if (nearby.threats.length > 0) {
            const threat = nearby.threats[0];
            const dist = Utils.distance(creature.x, creature.y, threat.x, threat.y);
            const fleeScore = (1000 / Math.max(dist, 1)) * creature.dna.genes.fear_threshold;
            scores.push({ score: fleeScore, action: new ActionFlee(creature, threat) });
        }

        // Score: Eat (herbivore)
        if (dietType === 'HERBIVORE' || dietType === 'OMNIVORE') {
            const eatScore = creature.hunger * 2;
            scores.push({ score: eatScore, action: new ActionForage(creature, nearby.biomass) });
        }

        // Score: Hunt (carnivore)
        if (dietType === 'CARNIVORE' || dietType === 'OMNIVORE') {
            if (nearby.prey.length > 0) {
                const prey = nearby.prey[0];
                const huntScore = creature.hunger * 1.5 + creature.dna.genes.aggression * 50;
                scores.push({ score: huntScore, action: new ActionChase(creature, prey) });
            }
        }

        // Score: Territorial Aggression
        const aggression = creature.dna.genes.aggression;
        const tolerance = Math.floor((1.0 - aggression) * 5);

        if (nearby.intruders.length > tolerance) {
            const intruder = nearby.intruders[0];
            const territoryScore = aggression * 80 + (nearby.intruders.length * 10);

            if (creature.phenotype.strength > intruder.phenotype.strength * 0.8 || aggression > 0.8) {
                scores.push({ score: territoryScore, action: new ActionChase(creature, intruder) });
            }
        }

        // Score: Mate
        if (creature.canReproduce() && nearby.mates.length > 0) {
            const mate = nearby.mates[0];
            const mateScore = creature.reproductiveUrge * 1.5;
            scores.push({ score: mateScore, action: new ActionMate(creature, mate) });
        }

        // Score: Use Abilities
        if (typeof Abilities !== 'undefined' && creature.energy > 40) {
            const nearbyEnemies = [...nearby.threats, ...nearby.prey, ...nearby.intruders];

            if (nearbyEnemies.length > 0) {
                if (creature.dna.genes.fire_gland >= 0.7 && creature.energy >= 30) {
                    const fireScore = nearbyEnemies.length * 40 + creature.dna.genes.aggression * 30;
                    scores.push({ score: fireScore, action: new ActionUseAbility(creature, nearbyEnemies, 'FIRE') });
                }

                if (creature.dna.genes.ice_breath >= 0.7 && creature.energy >= 25) {
                    const iceScore = (nearby.threats.length * 50) + (nearby.prey.length * 30);
                    scores.push({ score: iceScore, action: new ActionUseAbility(creature, nearbyEnemies, 'ICE') });
                }

                if (creature.dna.genes.poison_spit >= 0.7 && creature.energy >= 15) {
                    const target = nearbyEnemies[0];
                    const poisonScore = (target.phenotype.strength > creature.phenotype.strength) ? 60 : 35;
                    scores.push({ score: poisonScore, action: new ActionUseAbility(creature, [target], 'POISON') });
                }
            }
        }

        // Default: Wander
        scores.push({ score: 10, action: new ActionWander(creature) });

        // Select action with highest score
        scores.sort((a, b) => b.score - a.score);
        return scores[0].action;
    }

    static findNearby(creature, creatures, world) {
        const visionRange = creature.phenotype.visionRange;
        const smellRange = creature.phenotype.smellRange;

        const result = {
            threats: [],
            prey: [],
            mates: [],
            intruders: [],
            biomass: null
        };

        for (let other of creatures) {
            if (other === creature || other.isDead) continue;

            const dist = Utils.distance(creature.x, creature.y, other.x, other.y);

            // Sensory logic
            const camo = other.dna.genes.camouflage || 0;
            const visibilityFactor = 1.0 - (camo * 0.7);
            const effectiveDist = dist / visibilityFactor;

            let detected = false;
            if (effectiveDist <= visionRange) detected = true;
            else if (dist <= smellRange) detected = true;

            if (!detected) continue;

            // Is it a threat?
            const otherDiet = other.dna.getDietType();
            if ((otherDiet === 'CARNIVORE' || otherDiet === 'OMNIVORE') &&
                other.phenotype.strength > creature.phenotype.strength * 0.7) {
                result.threats.push(other);
            }

            // Is it prey?
            const myDiet = creature.dna.getDietType();
            if ((myDiet === 'CARNIVORE' || myDiet === 'OMNIVORE') &&
                creature.phenotype.strength > other.phenotype.strength * 0.7 &&
                other.lifeStage !== 'INFANT') {
                result.prey.push(other);
            }

            // Is it a potential mate?
            const sameSpecies = isSameSpecies(creature.dna, other.dna);
            if (sameSpecies &&
                other.canReproduce() &&
                other.id !== creature.id) {
                result.mates.push(other);
            }

            // Is it an intruder?
            if (dist < visionRange * 0.6) {
                // Use the creature's isFamily method for more comprehensive family recognition (includes lineage)
                const isFamily = creature.isFamily(other);

                const isPotentialPartner = sameSpecies && creature.dna.getReproMode() === 'SEXUAL' && creature.dna.getSex() !== other.dna.getSex();

                if (!isFamily && !isPotentialPartner) {
                    result.intruders.push(other);
                }
            }
        }

        // Check for biomass nearby
        const tile = world.getTileAt(creature.x, creature.y);
        if (tile && tile.biomass > 20) {
            result.biomass = { x: creature.x, y: creature.y };
        }

        return result;
    }
}

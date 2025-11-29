// =============================================================================
// CREATURE.JS - Living Entities and Lifecycle Management
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
        this.lifeStage = 'INFANT';
        this.vitality = 100;

        // Stats
        this.energy = 100;
        this.hunger = 0;
        this.health = 100;
        this.reproductiveUrge = 0;

        // Combat
        this.attackCooldown = 0; // Tiempo restante para volver a atacar

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
            timesReproduced: 0,
            offspringCared: 0
        };

        // Reproduction
        this.reproductionCooldown = 0;

        // Generation tracking
        this.generation = this.dna.generation || 0;

        // Reference to world
        this.world = null;

        // Vision modifiers (set by day/night cycle)
        this.effectiveVisionRange = this.phenotype.visionRange;
        this.isGlowing = false;

        // Lineage system (for family recognition)
        this.lineageID = this.dna.lineageID || this.generateLineageID();

        // Dead flag
        this.isDead = false;
        this.causeOfDeath = null;

        // Ability effects
        this.poisonedUntil = null;
        this.poisonDamage = 0;
        this.slowedUntil = null;
    }

    update(deltaTime, world, creatures) {
        if (this.isDead) return;

        this.world = world;

        // Age and life stages
        this.updateLifecycle(deltaTime);

        // Metabolism (constant energy drain + dynamic competition factor)
        this.updateMetabolism(deltaTime, creatures.length);

        // Combat cooldown
        this.updateCombat(deltaTime);

        // Update reproductive urge
        if (this.lifeStage === 'ADULT') {
            this.reproductiveUrge = Math.min(100, this.reproductiveUrge + deltaTime * 2);
        }

        // Cooldowns
        if (this.reproductionCooldown > 0) {
            this.reproductionCooldown -= deltaTime;
        }

        // Regeneration
        if (this.health < 100 && this.phenotype.regenRate > 0) {
            this.health = Math.min(100, this.health + this.phenotype.regenRate * deltaTime);
        }

        // Parental care (K-strategy)
        if (this.dna.genes.parental_care > 0.7 && this.lifeStage === 'ADULT') {
            this.careForOffspring(creatures, deltaTime);
        }

        // Apply ongoing ability effects (poison, slow, etc.)
        if (typeof Abilities !== 'undefined') {
            Abilities.applyEffects(this, deltaTime);
        }

        // Check death conditions
        this.checkDeath();
    }

    updateLifecycle(deltaTime) {
        const agingRate = 1.0 * Math.pow(this.dna.genes.metabolism_speed + 0.5, 2);
        this.age += agingRate * deltaTime;

        const vitalityLoss = (this.phenotype.energyCost / 10) * deltaTime;
        this.vitality -= vitalityLoss;

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

    updateMetabolism(deltaTime, totalCreatures = 0) {
        let baseDrain = this.phenotype.energyCost * deltaTime;
        const movementDrain = (Math.abs(this.vx) + Math.abs(this.vy)) * 0.1 * deltaTime;

        // METABOLISMO DINÁMICO: Mayor población = mayor competencia = mayor gasto
        const competitionFactor = totalCreatures / 1000; // 0.1 si hay 100, 0.5 si hay 500
        const metabolismMultiplier = 1 + (competitionFactor * 0.5); // Hasta +50% en alta población

        baseDrain *= metabolismMultiplier;

        // --- SKIN TYPE & THERMAL REGULATION ---
        // skin_type: 0.0-0.3 (Scales), 0.3-0.7 (Skin), 0.7-1.0 (Fur)
        if (this.world) {
            const tile = this.world.getTileAt(this.x, this.y);
            if (tile) {
                const temp = tile.temperature; // 0.0 (Cold) to 1.0 (Hot)
                const skin = this.dna.genes.skin_type;

                // Cold Stress (Temp < 0.3)
                if (temp < 0.3) {
                    if (skin > 0.7) {
                        // Fur protects from cold
                        baseDrain *= 0.8;
                    } else if (skin < 0.3) {
                        // Scales suffer in cold
                        baseDrain *= 1.5;
                        this.health -= deltaTime * 0.5; // Cold damage
                    } else {
                        baseDrain *= 1.2; // Skin suffers slightly
                    }
                }

                // Heat Stress (Temp > 0.7)
                if (temp > 0.7) {
                    if (skin > 0.7) {
                        // Fur overheats
                        baseDrain *= 2.0;
                        this.health -= deltaTime * 1.0; // Heatstroke
                    } else if (skin < 0.3) {
                        // Scales resist heat
                        baseDrain *= 0.8;
                    }
                }
            }
        }

        this.energy -= baseDrain + movementDrain;
        this.hunger += baseDrain + movementDrain;

        if (this.energy < 20) {
            this.health -= deltaTime * 2;
        }

        this.energy = Utils.clamp(this.energy, 0, 100);
        this.hunger = Utils.clamp(this.hunger, 0, 100);
        this.health = Utils.clamp(this.health, 0, 100);
    }

    updateCombat(deltaTime) {
        // Reducir cooldown cada frame
        if (this.attackCooldown > 0) {
            this.attackCooldown -= deltaTime;
        }
    }

    careForOffspring(allCreatures, deltaTime) {
        const myChildren = allCreatures.filter(c =>
            !c.isDead &&
            c.lifeStage === 'INFANT' &&
            (c.dna.parentAId === this.id || c.dna.parentBId === this.id)
        );

        if (myChildren.length === 0) return;

        let closestChild = null;
        let closestDist = Infinity;

        for (let child of myChildren) {
            const dist = Utils.distance(this.x, this.y, child.x, child.y);
            if (dist < closestDist) {
                closestDist = dist;
                closestChild = child;
            }
        }

        if (!closestChild) return;

        // Stay near child
        if (closestDist > 30) {
            const dx = closestChild.x - this.x;
            const dy = closestChild.y - this.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            this.move(
                (dx / dist) * this.phenotype.speed * 15 * deltaTime,
                (dy / dist) * this.phenotype.speed * 15 * deltaTime,
                this.world // Pass world for terrain check
            );
        }

        // Feed child
        if (closestChild.hunger > 70 && this.energy > 40 && closestDist < 20) {
            const foodTransfer = 5;
            this.energy -= foodTransfer;
            closestChild.energy += foodTransfer;
            closestChild.hunger -= 10;
            this.usageStats.offspringCared += deltaTime;
        }
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

    move(dx, dy, world) {
        // --- LIMB TYPE & TERRAIN PHYSICS ---
        // limb_type: <0.3 (Aquatic), 0.3-0.6 (Terrestrial), >0.6 (Aerial)
        let terrainFactor = 1.0;

        if (world) {
            const tile = world.getTileAt(this.x, this.y);
            if (tile) {
                const isWater = tile.biome.includes('OCEAN');
                const limb = this.dna.genes.limb_type;

                if (limb < 0.3) {
                    // AQUATIC
                    if (isWater) terrainFactor = 1.2; // Fast in water
                    else terrainFactor = 0.1; // Stranded on land (crawl)
                } else if (limb > 0.6) {
                    // AERIAL
                    terrainFactor = 1.1; // Fly over everything
                    // High energy cost for flying handled in phenotype
                } else {
                    // TERRESTRIAL
                    if (isWater) terrainFactor = 0.3; // Slow swim
                    else {
                        // Land speed depends on biome difficulty
                        // e.g. Mountain (cost 2.0) -> factor 0.5
                        const biomeData = BIOMES[tile.biome];
                        const cost = biomeData ? biomeData.movementCost : 1.0;
                        terrainFactor = 1.0 / cost;
                    }
                }
            }
        }

        // Apply terrain factor to movement
        const effectiveDx = dx * terrainFactor;
        const effectiveDy = dy * terrainFactor;

        this.x += effectiveDx;
        this.y += effectiveDy;
        this.usageStats.distanceMoved += Math.sqrt(effectiveDx * effectiveDx + effectiveDy * effectiveDy);

        if (dx !== 0 || dy !== 0) {
            this.rotation = Math.atan2(dy, dx);
        }
    }

    eat(foodSource, amount) {
        const dietType = this.dna.getDietType();

        if (foodSource.type === 'BIOMASS' && (dietType === 'HERBIVORE' || dietType === 'OMNIVORE')) {
            // Pastorear del tile
            const tile = this.world.getTileAt(this.x, this.y);
            if (!tile || tile.biomass <= 0 || !tile.plantDNA) {
                return false;
            }

            // Calcular cuánto se puede pastar (limitado por biomasa disponible)
            const actualAmount = Math.min(amount, tile.biomass);

            // Aplicar DEFENSA de la planta: Reduce velocidad de pastoreo
            const defenseMultiplier = 1 - (tile.plantDNA.genes.defense * 0.5);
            const effectiveAmount = actualAmount * defenseMultiplier;

            // Reducir biomasa del tile
            tile.biomass -= effectiveAmount;

            // Tracking presión de pastoreo
            if (tile.biomass < tile.maxBiomass * 0.2) {
                tile.plantDNA.grazingPressure = Math.min(1, tile.plantDNA.grazingPressure + 0.1);
            }

            // Ganar energía
            const energyGain = effectiveAmount * 5;
            this.energy = Math.min(100, this.energy + energyGain);
            this.hunger = Math.max(0, this.hunger - effectiveAmount * 10);

            // Aplicar TOXICIDAD: Daño a la salud
            if (tile.plantDNA.genes.toxicity > 0.3) {
                const toxinDamage = tile.plantDNA.genes.toxicity * 10;
                this.health -= toxinDamage;

                if (window.game && window.game.ui) {
                    window.game.ui.logEvent(
                        `${this.id.substring(0, 6)} se envenenó comiendo plantas tóxicas (-${toxinDamage.toFixed(1)} salud)`,
                        'event-death'
                    );
                }
            }

            this.usageStats.biomassEaten += effectiveAmount;
            return true;
        }

        if (foodSource.type === 'MEAT' && (dietType === 'CARNIVORE' || dietType === 'OMNIVORE' || dietType === 'SCAVENGER')) {
            const energyGain = amount * 8;
            this.energy = Math.min(100, this.energy + energyGain);
            this.hunger = Math.max(0, this.hunger - amount * 15);
            this.usageStats.killCount += 0.5;
            return true;
        }

        return false;
    }

    attack(target) {
        if (!target || target.isDead) return false;

        // Solo atacar si cooldown listo
        if (this.attackCooldown <= 0) {
            const BASE_DAMAGE = 10;
            const MIN_DAMAGE = 1;

            // Calcular daño usando fórmula balanceada
            let strength = this.phenotype.strength * BASE_DAMAGE;
            let mitigation = target.phenotype.defense * BASE_DAMAGE;

            // Multiplicador de tamaño: Un gigante pega más fuerte
            let rawDamage = (strength * this.phenotype.size) - (mitigation * target.phenotype.size);
            let finalDamage = Math.max(MIN_DAMAGE, rawDamage);

            // Aplicar daño
            target.takeDamage(finalDamage, this);

            // Resetear cooldown basado en velocidad/agilidad
            // Agilidad 1.0 = 0.5seg, Agilidad 0.0 = 2.0seg
            const attackSpeed = this.phenotype.speed || 0.5;
            this.attackCooldown = 2.0 - (attackSpeed * 1.5);

            // Coste energético de atacar
            const attackCost = 15;
            this.energy -= attackCost;

            // Log del ataque
            if (window.game && window.game.ui) {
                window.game.ui.logEvent(
                    `${this.id.substring(0, 6)} ataca a ${target.id.substring(0, 6)} por ${finalDamage.toFixed(1)} daño`,
                    'event-death'
                );
            }

            return true;
        }

        return false;
    }

    takeDamage(amount, attacker) {
        this.health -= amount;

        // KNOCKBACK: Empujar en dirección opuesta al atacante
        const angle = Math.atan2(this.y - attacker.y, this.x - attacker.x);
        this.x += Math.cos(angle) * 20;
        this.y += Math.sin(angle) * 20;

        // CEREBRO REACTIVO
        if (this.health < 40) { // Vida < 40%
            // PÁNICO: Marcar amenaza pero dejar que la IA decida huir
            this.target = attacker; // La IA detectará esto como amenaza en findNearby
        } else {
            // CONTRAATAQUE: Marcar al atacante como objetivo
            this.target = attacker;
        }

        // Muerte por combate
        if (this.health <= 0) {
            this.die('combat');

            // Actualizar kill count del atacante
            if (attacker) {
                attacker.usageStats.killCount += 1;
                if (window.game && window.game.ui) {
                    window.game.ui.logEvent(
                        `${attacker.id.substring(0, 6)} ha matado a ${this.id.substring(0, 6)}`,
                        'event-extinction'
                    );
                }
            }
        }
    }

    // Contar vecinos cercanos (para detectar hacinamiento)
    countNeighbors(radius, creatures) {
        let count = 0;
        for (let other of creatures) {
            if (other === this || other.isDead) continue;
            const dist = Utils.distance(this.x, this.y, other.x, other.y);
            if (dist < radius) {
                count++;
            }
        }
        return count;
    }

    // Generar ID de linaje único
    generateLineageID() {
        return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }

    // Verificar si otra criatura es familiar
    isFamily(other) {
        if (!other || other.isDead) return false;

        // Mismo linaje O relación padre/hijo directa
        return (this.lineageID === other.lineageID) ||
            (this.dna.parentAId === other.id) ||
            (this.dna.parentBId === other.id) ||
            (other.dna.parentAId === this.id) ||
            (other.dna.parentBId === this.id);
    }

    canReproduce(creatures = []) {
        // Checks básicos
        if (this.lifeStage !== 'ADULT') return false;
        if (this.reproductionCooldown > 0) return false;
        if (this.energy < 60) return false;
        if (this.reproductiveUrge < 50) return false;

        // Factor de hacinamiento (overcrowding)
        if (creatures.length > 0) {
            const visionRadius = this.phenotype.visionRange;
            const neighbors = this.countNeighbors(visionRadius, creatures);

            // Threshold dinámico basado en social_drive
            // Criaturas sociales toleran más vecinos
            const maxNeighbors = 3 + Math.floor(this.dna.genes.social_drive * 5);

            if (neighbors > maxNeighbors) {
                return false; // Demasiado hacinamiento
            }
        }

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

        this.energy -= 30;
        this.reproductiveUrge = 0;
        this.reproductionCooldown = 10;
        this.usageStats.timesReproduced += 1;

        return child;
    }

    reproduceSexual(partner) {
        if (!this.canReproduce() || !partner.canReproduce()) return null;
        if (!isSameSpecies(this.dna, partner.dna)) return null;

        const reproMode = this.dna.getReproMode();
        if (reproMode === 'SEXUAL') {
            if (this.dna.getSex() === partner.dna.getSex()) return null;
        }

        const combinedStats = {
            distanceMoved: (this.usageStats.distanceMoved + partner.usageStats.distanceMoved) / 2,
            killCount: (this.usageStats.killCount + partner.usageStats.killCount) / 2,
            biomassEaten: (this.usageStats.biomassEaten + partner.usageStats.biomassEaten) / 2,
            offspringCared: (this.usageStats.offspringCared + partner.usageStats.offspringCared) / 2,
            timesReproduced: 0
        };

        const childDNA = createChild(this, partner, combinedStats);
        const child = new Creature(
            (this.x + partner.x) / 2,
            (this.y + partner.y) / 2,
            childDNA
        );

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

    getVisualSize() {
        const baseSize = 16; // Duplicado de 8 a 16 para mejor visibilidad
        let size = baseSize * this.phenotype.size;

        if (this.lifeStage === 'INFANT') {
            size *= 0.6;
        }

        return size;
    }
}

// =============================================================================
// Cadaver Class
// =============================================================================
class Cadaver {
    constructor(creature) {
        this.x = creature.x;
        this.y = creature.y;
        this.meatValue = creature.phenotype.size * 50;
        this.decayTime = 30;
        this.type = 'MEAT';
    }

    update(deltaTime) {
        this.decayTime -= deltaTime;
    }

    isDecayed() {
        return this.decayTime <= 0 || this.meatValue <= 0;
    }
}

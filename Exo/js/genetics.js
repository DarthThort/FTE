// =============================================================================
// GENETICS.JS - DNA, Inheritance, and Evolution System
// =============================================================================

// =============================================================================
// DNA Class
// =============================================================================
class DNA {
    constructor(genes = null, mode = 'RANDOM') {
        this.lineageID = null; // Will be set by creature or inherited

        if (genes) {
            this.genes = { ...genes };
        } else {
            // Initialize with random genes (first generation)
            this.genes = {
                // Physical genes
                size_gene: Math.random(),           // 0.0 = tiny, 1.0 = gigantic
                color_r: Math.random(),             // Red channel
                color_g: Math.random(),             // Green channel
                color_b: Math.random(),             // Blue channel
                limb_type: Math.random(),           // 0-0.3: aquatic, 0.3-0.6: terrestrial, 0.6-1.0: aerial
                skin_type: Math.random(),           // Defense/climate resistance

                // Metabolic genes
                diet_type: Math.random(),           // 0.0 = herbivore, 1.0 = carnivore
                metabolism_speed: Math.random(),    // Energy burn rate
                fertility: Math.random(),           // Reproduction rate

                // Behavioral genes
                aggression: Math.random(),          // Combat tendency
                social_drive: Math.random(),        // Grouping behavior
                fear_threshold: Math.random(),      // Flight response
                parental_care: Math.random(),       // 🆕 Offspring protection (K-strategy)

                // Sensory genes
                vision_range: Math.random(),        // Detection distance
                smell_range: Math.random(),         // Olfactory detection
                night_vision: Math.random(),        // 🆕 See in darkness
                thermal_vision: Math.random(),      // 🆕 Detect heat signatures
                echolocation: Math.random(),        // 🆕 Alternative vision

                // Defensive/Offensive genes
                camouflage: Math.random(),          // 🆕 Reduced detection chance
                toxicity: Math.random(),            // 🆕 Poison damage when eaten
                regeneration: Math.random(),        // 🆕 Health recovery rate

                // Fantasy abilities (high energy cost)
                fire_gland: Math.random(),          // 🆕 Fire breath ability
                ice_breath: Math.random(),          // 🆕 Freeze attack
                poison_spit: Math.random(),         // 🆕 Ranged poison projectile
                bioluminescence: Math.random(),     // 🆕 Self-illumination
                immune_resistance: Math.random(),   // 🦠 Disease resistance

                // Reproduction mode
                repro_mode: Math.random(),          // 0-0.3: asexual, 0.3-0.7: hermaphrodite, 0.7-1.0: sexual
                sex_chromosome: Math.random()       // <0.5 = male, >0.5 = female
            };

            // Apply Archetype Mode if requested
            if (mode === 'ARCHETYPE') {
                const keys = Object.keys(this.genes);
                // Filter out color and sex genes from being the "specialty" (optional, but makes sense to keep them random or controlled)
                // Actually user said "100% of a single gene and 0-2% in rest".
                // Let's exclude color/sex from this strict rule to avoid broken creatures?
                // No, user said "absolutes". Let's stick to the request but maybe keep color random so they look different.

                const specialty = keys[Math.floor(Math.random() * keys.length)];

                for (let key of keys) {
                    if (key === 'color_r' || key === 'color_g' || key === 'color_b' || key === 'sex_chromosome') {
                        // Keep colors and sex random for variety
                        continue;
                    }

                    if (key === specialty) {
                        this.genes[key] = 0.6; // 60% specialized
                    } else {
                        this.genes[key] = Math.random() * 0.1; // 0-10% background noise
                    }
                }
            }
        }
    }

    // Calculate phenotype (actual stats) from genotype (genes)
    getPhenotype() {
        const g = this.genes;

        // Size affects many stats
        const sizeMultiplier = Utils.map(g.size_gene, 0, 1, 0.5, 2.0);

        // Speed inversely related to size
        const speed = Utils.clamp(
            Utils.map(g.size_gene, 0, 1, 2.0, 0.5) * Utils.map(g.metabolism_speed, 0, 1, 0.8, 1.2),
            0.3, 3.0
        );

        // Strength directly related to size
        const strength = sizeMultiplier * Utils.map(g.aggression, 0, 1, 0.5, 1.5);

        // Energy cost calculation (including new genes)
        const energyCost = (
            Math.pow(sizeMultiplier, 2) * 0.5 +
            speed * 0.3 +
            g.vision_range * 0.2 +
            g.smell_range * 0.1 +
            g.night_vision * 0.15 +
            g.regeneration * 0.2 +
            g.bioluminescence * 0.25
        );

        // Max lifespan inversely related to metabolism
        const maxLifespan = Utils.map(g.metabolism_speed, 0, 1, 120, 40); // seconds

        return {
            size: sizeMultiplier,
            speed: speed,
            strength: strength,
            energyCost: energyCost,
            maxLifespan: maxLifespan,
            visionRange: Utils.map(g.vision_range, 0, 1, 50, 200),
            smellRange: Utils.map(g.smell_range, 0, 1, 30, 150),
            defense: Utils.map(g.skin_type, 0, 1, 0, 1),
            fertility: g.fertility,
            regenRate: g.regeneration * 0.5, // Health regen per second
            color: {
                r: Math.floor(g.color_r * 255),
                g: Math.floor(g.color_g * 255),
                b: Math.floor(g.color_b * 255)
            }
        };
    }

    // Get diet classification
    getDietType() {
        const d = this.genes.diet_type;
        if (d < 0.3) return 'HERBIVORE';
        if (d < 0.7) return 'OMNIVORE';
        if (d < 0.95) return 'CARNIVORE';
        return 'SCAVENGER'; // Pure decomposer
    }

    // Get reproduction mode
    getReproMode() {
        const r = this.genes.repro_mode;
        if (r < 0.3) return 'ASEXUAL';
        if (r < 0.7) return 'HERMAPHRODITE';
        return 'SEXUAL';
    }

    // Get sex (for sexual reproduction)
    getSex() {
        return this.genes.sex_chromosome < 0.5 ? 'MALE' : 'FEMALE';
    }
}

// =============================================================================
// Genetic Functions
// =============================================================================

const MUTATION_RATE = 0.05; // 5% chance per gene

// Create offspring from one or two parents
function createChild(parentA, parentB = null, usageStats = {}) {
    const childGenes = {};
    const parentAGenes = parentA.dna.genes;
    const parentBGenes = parentB ? parentB.dna.genes : parentAGenes;

    for (let gene in parentAGenes) {
        // 1. Inheritance (crossover)
        let baseValue = (parentAGenes[gene] + parentBGenes[gene]) / 2;

        // 2. Epigenetic bonuses (use and practice)
        // If parent moved a lot, bias towards speed
        if (gene === 'metabolism_speed' && usageStats.distanceMoved > 500) {
            baseValue += 0.03;
        }

        // If parent hunted successfully, bias towards aggression and carnivore diet
        if (gene === 'aggression' && usageStats.killCount > 3) {
            baseValue += 0.05;
        }

        if (gene === 'diet_type' && usageStats.killCount > 3) {
            baseValue += 0.05;
        }

        // If parent grazed a lot, bias towards herbivore
        if (gene === 'diet_type' && usageStats.biomassEaten > 100) {
            baseValue -= 0.05;
        }

        // If parent cared for offspring, bias towards parental care
        if (gene === 'parental_care' && usageStats.offspringCared > 2) {
            baseValue += 0.05;
        }

        // 3. Mutation
        if (Math.random() < MUTATION_RATE) {
            const mutation = (Math.random() - 0.5) * 0.2; // ±10%
            baseValue += mutation;
        }

        // Clamp between 0 and 1
        childGenes[gene] = Utils.clamp(baseValue, 0, 1);
    }

    const childDNA = new DNA(childGenes);

    // Track parentage
    childDNA.parentAId = parentA.id;
    childDNA.parentBId = parentB ? parentB.id : null;
    childDNA.generation = Math.max(
        parentA.generation || 0,
        parentB && parentB.generation ? parentB.generation : 0
    ) + 1;

    // Inherit lineage from parent A
    childDNA.lineageID = parentA.lineageID;

    return childDNA;
}

// Calculate genetic similarity (0 = identical, 1 = completely different)
function geneticDistance(dnaA, dnaB) {
    let totalDiff = 0;
    let count = 0;

    for (let gene in dnaA.genes) {
        if (dnaB.genes[gene] !== undefined) {
            totalDiff += Math.abs(dnaA.genes[gene] - dnaB.genes[gene]);
            count++;
        }
    }

    return count > 0 ? totalDiff / count : 0;
}

// Check if two creatures are same species (genetic similarity threshold)
function isSameSpecies(dnaA, dnaB) {
    return geneticDistance(dnaA, dnaB) < 0.15; // Less than 15% difference
}

// =============================================================================
// PlantDNA Class - Genetics for Flora
// =============================================================================
class PlantDNA {
    constructor(genes = null) {
        if (genes) {
            this.genes = { ...genes };
        } else {
            // Initialize with random plant genes
            this.genes = {
                // Adaptación climática
                water_need: Math.random(),      // 0.0 (Cactus) - 1.0 (Manglar)
                heat_tolerance: Math.random(),  // 0.0 (Hielo) - 1.0 (Desierto)

                // Crecimiento
                growth_speed: Math.random(),    // 0.0 (Lento) - 1.0 (Rápido)
                max_biomass: Math.random(),     // Biomasa máxima relativa

                // Defensa
                toxicity: Math.random(),        // 0.0 (Comestible) - 1.0 (Veneno)
                defense: Math.random(),         // 0.0 (Hojas blandas) - 1.0 (Espinas)

                // Tipo
                plant_type: Math.random()       // 0.0-0.3 (Terrestre), 0.3-0.7 (Anfibia), 0.7-1.0 (Acuática)
            };
        }

        this.generation = 0;
        this.grazingPressure = 0; // Acumula presión de pastoreo (0-1)
    }

    getPlantType() {
        const type = this.genes.plant_type;
        if (type < 0.3) return 'TERRESTRIAL';
        if (type < 0.7) return 'AMPHIBIOUS';
        return 'AQUATIC';
    }

    mutate() {
        const mutatedGenes = { ...this.genes };

        // Mayor mutación si hay presión de pastoreo
        const baseMutationRate = 0.05;
        const mutationRate = baseMutationRate + (this.grazingPressure * 0.15);

        for (let gene in mutatedGenes) {
            if (Math.random() < mutationRate) {
                // Bias: Aumentar toxicity y defense bajo presión de pastoreo
                if ((gene === 'toxicity' || gene === 'defense') && this.grazingPressure > 0.5) {
                    // Bias hacia aumentar defensa
                    mutatedGenes[gene] += (Math.random() - 0.3) * 0.2;
                } else {
                    // Mutación normal
                    mutatedGenes[gene] += (Math.random() - 0.5) * 0.2;
                }
                mutatedGenes[gene] = Utils.clamp(mutatedGenes[gene], 0, 1);
            }
        }

        const newDNA = new PlantDNA(mutatedGenes);
        newDNA.generation = this.generation + 1;
        return newDNA;
    }
}

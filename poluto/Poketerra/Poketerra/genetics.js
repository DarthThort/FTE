// ==========================================
// GENETICS SYSTEM - Mendelian Inheritance
// ==========================================

class GeneticsSystem {
    constructor() {
        // Define trait types with variants
        this.traitDefinitions = {
            claws: {
                variants: ['sharp', 'blunt', 'hooked'],
                dominance: { sharp: 3, hooked: 2, blunt: 1 } // Higher = more dominant
            },
            teeth: {
                variants: ['fangs', 'normal', 'small'],
                dominance: { fangs: 3, normal: 2, small: 1 }
            },
            tail: {
                variants: ['long', 'medium', 'short'],
                dominance: { long: 3, medium: 2, short: 1 }
            },
            colorType: {
                variants: ['mimetic', 'solid'],
                dominance: { mimetic: 2, solid: 1 }
            },
            bodySize: {
                variants: ['large', 'medium', 'small'],
                dominance: { large: 3, medium: 2, small: 1 }
            }
        };

        // Color palette for mimetic (camouflage) and solid colors
        this.mimeticColors = ['#38761d', '#6b8e23', '#556b2f', '#8b7355'];
        this.solidColors = ['#ee6055', '#60d394', '#aaf683', '#ffd97d', '#ff9b85', '#a8dadc', '#457b9d', '#e63946'];
    }

    // Generate random genetics for a wild creature
    generateRandomGenetics() {
        const genetics = {};

        for (const [trait, definition] of Object.entries(this.traitDefinitions)) {
            const variants = definition.variants;
            genetics[trait] = {
                gene1: this.randomChoice(variants),
                gene2: this.randomChoice(variants)
            };
        }

        // Generate color value based on color type
        const colorTypeExpressed = this.expressGene(genetics.colorType);
        genetics.colorValue = {
            gene1: this.randomChoice(colorTypeExpressed === 'mimetic' ? this.mimeticColors : this.solidColors),
            gene2: this.randomChoice(colorTypeExpressed === 'mimetic' ? this.mimeticColors : this.solidColors)
        };

        return genetics;
    }

    // Breed two parent genetics to create offspring
    breedGenetics(parent1Genetics, parent2Genetics) {
        const offspringGenetics = {};

        for (const trait in parent1Genetics) {
            // Each parent contributes one random gene
            const gene1 = Math.random() < 0.5 ? parent1Genetics[trait].gene1 : parent1Genetics[trait].gene2;
            const gene2 = Math.random() < 0.5 ? parent2Genetics[trait].gene1 : parent2Genetics[trait].gene2;

            offspringGenetics[trait] = { gene1, gene2 };
        }

        return offspringGenetics;
    }

    // Determine which gene is expressed (phenotype from genotype)
    expressGene(genePair) {
        if (!genePair) return null;

        const { gene1, gene2 } = genePair;

        // If both genes are the same, express that
        if (gene1 === gene2) return gene1;

        // Find trait definition to check dominance
        let traitDef = null;
        for (const [trait, definition] of Object.entries(this.traitDefinitions)) {
            if (definition.variants.includes(gene1)) {
                traitDef = definition;
                break;
            }
        }

        // For color values (hex codes), use codominance (blend or random)
        if (gene1.startsWith && gene1.startsWith('#')) {
            return Math.random() < 0.5 ? gene1 : gene2;
        }

        // Use dominance hierarchy
        if (traitDef) {
            const dominance1 = traitDef.dominance[gene1] || 0;
            const dominance2 = traitDef.dominance[gene2] || 0;
            return dominance1 >= dominance2 ? gene1 : gene2;
        }

        // Fallback to random
        return Math.random() < 0.5 ? gene1 : gene2;
    }

    // Get all expressed traits (phenotype) from genetics
    getExpressedTraits(genetics) {
        const expressed = {};

        for (const trait in genetics) {
            expressed[trait] = this.expressGene(genetics[trait]);
        }

        return expressed;
    }

    // Get functional stats based on expressed traits
    getTraitStats(expressedTraits) {
        const stats = {
            captureResistance: 1.0, // How hard to capture (1.0 = normal)
            hungerRate: 1.0,        // How fast hunger depletes
            speed: 1.0,             // Movement speed multiplier
            camouflage: 0           // How hard to spot (0 = easy)
        };

        // Claws affect capture resistance
        switch (expressedTraits.claws) {
            case 'sharp': stats.captureResistance = 1.5; break;
            case 'hooked': stats.captureResistance = 1.3; break;
            case 'blunt': stats.captureResistance = 0.8; break;
        }

        // Teeth affect hunger rate
        switch (expressedTraits.teeth) {
            case 'fangs': stats.hungerRate = 1.3; break;
            case 'normal': stats.hungerRate = 1.0; break;
            case 'small': stats.hungerRate = 0.7; break;
        }

        // Tail affects speed
        switch (expressedTraits.tail) {
            case 'long': stats.speed = 1.3; break;
            case 'medium': stats.speed = 1.0; break;
            case 'short': stats.speed = 0.8; break;
        }

        // Body size affects multiple stats
        switch (expressedTraits.bodySize) {
            case 'large':
                stats.captureResistance *= 1.2;
                stats.hungerRate *= 1.3;
                stats.speed *= 0.9;
                break;
            case 'small':
                stats.captureResistance *= 0.8;
                stats.hungerRate *= 0.7;
                stats.speed *= 1.1;
                break;
        }

        // Mimetic color provides camouflage
        if (expressedTraits.colorType === 'mimetic') {
            stats.camouflage = 0.5;
        }

        return stats;
    }

    // Helper: Random choice from array
    randomChoice(array) {
        return array[Math.floor(Math.random() * array.length)];
    }
}

// Export for use in other files
const geneticsSystem = new GeneticsSystem();

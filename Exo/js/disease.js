// =============================================================================
// DISEASE.JS - Sistema de Infección y Propagación de Enfermedades
// =============================================================================

// Sistema de enfermedades modular que extiende funcionalidad de criaturas
// sin modificar directamente creature.js

class DiseaseSystem {
    constructor() {
        this.propagationTimer = 0;
        this.PROPAGATION_CHECK_INTERVAL = 1.0; // Chequear cada segundo
    }

    // =============================================================================
    // Inicialización de Propiedades de Enfermedad en Criaturas
    // =============================================================================
    initializeCreatureDisease(creature) {
        if (!creature.hasOwnProperty('infected')) {
            creature.infected = false;
            creature.pathogen = null;
            creature.infectionTime = 0;
            creature.incubationProgress = 0;
        }
    }

    // =============================================================================
    // Infección de Criatura
    // =============================================================================
    infectCreature(creature, pathogen, world) {
        // Inicializar propiedades si no existen
        this.initializeCreatureDisease(creature);

        if (creature.infected) return false; // Ya está infectada

        // Chequeo de resistencia vs transmisibilidad
        const tile = world ? world.getTileAt(creature.x, creature.y) : null;
        const biome = tile ? tile.biome : 'PLAINS';
        const effectiveTransmission = pathogen.getTransmissibilityFor(biome);

        // Resistencia inmunológica reduce probabilidad
        const resistanceFactor = creature.dna.genes.immune_resistance || 0;
        const infectionChance = effectiveTransmission * (1 - resistanceFactor * 0.7);

        if (Math.random() < infectionChance) {
            creature.infected = true;
            creature.pathogen = pathogen;
            creature.infectionTime = 0;
            creature.incubationProgress = 0;

            if (window.game && window.game.ui) {
                window.game.ui.logEvent(
                    `${creature.id.substring(0, 6)} se infectó con ${pathogen.name}`,
                    'event-death'
                );
            }

            return true;
        }

        return false;
    }

    // =============================================================================
    // Actualizar Estado de Infección
    // =============================================================================
    updateInfection(creature, deltaTime) {
        if (!creature.infected || !creature.pathogen) return;

        creature.infectionTime += deltaTime;
        creature.incubationProgress = creature.infectionTime / creature.pathogen.incubationTime;

        // Debilitamiento durante la enfermedad
        creature.energy -= deltaTime * 2; // Pierde energía más rápido

        // Fase de incubación completada
        if (creature.incubationProgress >= 1.0) {
            this.resolveInfection(creature);
        }
    }

    resolveInfection(creature) {
        const survivalChance = creature.dna.genes.immune_resistance || 0;

        if (survivalChance > creature.pathogen.lethality) {
            // Sobrevive y se recupera
            creature.infected = false;
            const pathogenName = creature.pathogen.name;
            creature.pathogen = null;

            if (window.game && window.game.ui) {
                window.game.ui.logEvent(
                    `${creature.id.substring(0, 6)} se recuperó de ${pathogenName}`,
                    'event-birth'
                );
            }
        } else {
            // Muere
            const pathogenName = creature.pathogen.name;
            creature.die(`enfermedad: ${pathogenName}`);
        }
    }

    // =============================================================================
    // Propagación de Enfermedades
    // =============================================================================
    propagateDiseases(creatures, deltaTime) {
        this.propagationTimer += deltaTime;

        if (this.propagationTimer < this.PROPAGATION_CHECK_INTERVAL) return;
        this.propagationTimer = 0;

        // Obtener todas las criaturas infectadas
        const infected = creatures.filter(c => !c.isDead && c.infected);

        for (let infectedCreature of infected) {
            this.spreadFromCreature(infectedCreature, creatures);
        }
    }

    spreadFromCreature(source, allCreatures) {
        if (!source.infected || !source.pathogen) return;

        // Radio de contagio basado en sociabilidad
        const socialRadius = source.phenotype ? source.phenotype.size * 3 : 50;
        const socialFactor = source.dna.genes.social_drive > 0.7 ? 2.0 : 1.0;

        for (let target of allCreatures) {
            if (target === source || target.isDead || target.infected) continue;

            const dist = Utils.distance(source.x, source.y, target.x, target.y);

            // Contacto social aumenta probabilidad
            if (dist < socialRadius && Math.random() < 0.1 * socialFactor) {
                this.infectCreature(target, source.pathogen, source.world);
            }
        }
    }

    // =============================================================================
    // Propagación desde Cadáveres
    // =============================================================================
    propagateFromCadavers(creatures, cadavers) {
        for (let creature of creatures) {
            if (creature.isDead || creature.infected) continue;

            // Carroñeros son inmunes
            const isScavenger = creature.dna.getDietType() === 'SCAVENGER';
            if (isScavenger) continue;

            for (let cadaver of cadavers) {
                if (!cadaver.pathogen) continue;

                const dist = Utils.distance(creature.x, creature.y, cadaver.x, cadaver.y);

                // Riesgo aumenta con cercanía y decay
                if (dist < 50) {
                    const diseaseRisk = cadaver.diseaseRisk || 0.1;
                    if (Math.random() < diseaseRisk * 0.1) {
                        this.infectCreature(creature, cadaver.pathogen, creature.world);
                    }
                }
            }
        }
    }

    // =============================================================================
    // Obtener Estado Visual (para renderer)
    // =============================================================================
    getInfectionColor(creature) {
        if (!creature.infected) return null;

        // Color basado en progreso de incubación
        const progress = creature.incubationProgress || 0;
        const alpha = 0.3 + (progress * 0.3); // 0.3 a 0.6

        return {
            r: 0,
            g: 255,
            b: 0,
            alpha: alpha
        };
    }

    getInfectionProgress(creature) {
        return creature.incubationProgress || 0;
    }
}

// =============================================================================
// Extensión de Cadáver para Enfermedades
// =============================================================================
class CadaverDiseaseExtension {
    static initializeCadaver(cadaver, deadCreature) {
        // Añadir propiedades de enfermedad al cadáver
        cadaver.diseaseRisk = deadCreature.infected ? 0.8 : 0.1;
        cadaver.pathogen = deadCreature.infected ? deadCreature.pathogen : null;
        cadaver.decayTimer = 120; // 120 segundos hasta descomposición
    }

    static updateDecay(cadaver, deltaTime) {
        if (!cadaver.decayTimer) return;

        cadaver.decayTimer -= deltaTime;

        // Aumentar riesgo de enfermedad a medida que se pudre
        if (cadaver.decayTimer < 30) {
            cadaver.diseaseRisk = Math.min(1.0, (cadaver.diseaseRisk || 0.1) + deltaTime * 0.02);
        }

        // Conversión a nutrientes
        if (cadaver.decayTimer <= 0) {
            return true; // Señal para convertir a nutrientes
        }

        return false;
    }
}

// =============================================================================
// Instancia global del sistema
// =============================================================================
const DiseaseManager = new DiseaseSystem();

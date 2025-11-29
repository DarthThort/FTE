// =============================================================================
// NUTRIENTS.JS - Sistema de Nutrientes del Suelo y Ciclo de Fertilidad
// =============================================================================

class NutrientSystem {
    constructor() {
        this.MAX_NUTRIENTS = 100;
        this.DECAY_RATE = 0.5; // Pérdida de nutrientes por segundo
        this.FECES_VALUE_MULTIPLIER = 0.5; // Por tamaño de criatura
        this.CADAVER_VALUE_MULTIPLIER = 10; // Tamaño × 10
        this.GROWTH_BONUS_MAX = 2.0; // 2x velocidad a 100 nutrientes
    }

    // =============================================================================
    // Inicializar Nutrientes en Tiles
    // =============================================================================
    initializeTile(tile) {
        if (!tile.hasOwnProperty('soilNutrients')) {
            tile.soilNutrients = 0;
        }
    }

    // =============================================================================
    // Añadir Nutrientes al Suelo
    // =============================================================================
    addNutrients(tile, amount) {
        this.initializeTile(tile);
        tile.soilNutrients = Math.min(this.MAX_NUTRIENTS, tile.soilNutrients + amount);
    }

    // =============================================================================
    // Descomposición de Cadáveres → Nutrientes
    // =============================================================================
    decomposeCadaver(cadaver, world) {
        const tile = world.getTileAt(cadaver.x, cadaver.y);
        if (!tile) return;

        // Convertir meatValue en nutrientes
        const nutrientValue = cadaver.meatValue || 0;
        this.addNutrients(tile, nutrientValue);

        if (window.game && window.game.ui) {
            window.game.ui.logEvent(
                `Cadáver se descompuso, fertilizando el suelo (+${nutrientValue.toFixed(1)} nutrientes)`,
                'event-mutation'
            );
        }
    }

    // =============================================================================
    // Heces → Nutrientes (Sistema Digestivo)
    // =============================================================================
    addFeces(creature, world) {
        const tile = world.getTileAt(creature.x, creature.y);
        if (!tile) return;

        const fecesValue = (creature.phenotype ? creature.phenotype.size : 1) * this.FECES_VALUE_MULTIPLIER;
        this.addNutrients(tile, fecesValue);
    }

    // =============================================================================
    // Actualizar Nutrientes del Suelo (Decay Natural)
    // =============================================================================
    updateSoilNutrients(tile, deltaTime) {
        this.initializeTile(tile);

        if (tile.soilNutrients > 0) {
            tile.soilNutrients -= this.DECAY_RATE * deltaTime;
            tile.soilNutrients = Math.max(0, tile.soilNutrients);
        }
    }

    // =============================================================================
    // Calcular Bonus de Crecimiento Vegetal
    // =============================================================================
    getGrowthBonus(tile) {
        this.initializeTile(tile);

        // Crecimiento mejorado por nutrientes
        // 0 nutrientes = 1x, 100 nutrientes = 2x
        const bonus = 1 + (tile.soilNutrients / 100);
        return Math.min(this.GROWTH_BONUS_MAX, bonus);
    }

    // =============================================================================
    // Actualizar Crecimiento de Flora con Nutrientes
    // =============================================================================
    updateFloraGrowth(tile, baseGrowthRate, deltaTime) {
        this.initializeTile(tile);

        const nutrientBonus = this.getGrowthBonus(tile);
        const enhancedGrowth = baseGrowthRate * nutrientBonus;

        return enhancedGrowth * deltaTime;
    }

    // =============================================================================
    // Sistema de Digestión para Criaturas
    // =============================================================================
    initializeCreatureDigestion(creature) {
        if (!creature.hasOwnProperty('mealCount')) {
            creature.mealCount = 0;
        }
    }

    onCreatureEat(creature, world) {
        this.initializeCreatureDigestion(creature);

        creature.mealCount++;

        // Cada 5 comidas, defecar
        if (creature.mealCount >= 5) {
            this.addFeces(creature, world);
            creature.mealCount = 0;
        }
    }

    // =============================================================================
    // Visualización (para renderer)
    // =============================================================================
    getSoilColor(tile) {
        this.initializeTile(tile);

        if (tile.soilNutrients > 20) {
            // Overlay marrón oscuro para suelo fértil
            const alpha = Math.min(0.3, tile.soilNutrients / 200);
            return {
                r: 139,
                g: 69,
                b: 19,
                alpha: alpha
            };
        }

        return null;
    }

    getFertilityLevel(tile) {
        this.initializeTile(tile);

        if (tile.soilNutrients > 70) return 'HIGH';
        if (tile.soilNutrients > 30) return 'MEDIUM';
        if (tile.soilNutrients > 10) return 'LOW';
        return 'NONE';
    }
}

// =============================================================================
// Sistema Mejorado de Cadáveres con Descomposición
// =============================================================================
class CadaverDecomposition {
    constructor() {
        this.DECAY_TIME = 120; // 120 segundos hasta descomposición total
        this.DISEASE_RISK_THRESHOLD = 30; // Últimos 30 segundos = alto riesgo
    }

    // Inicializar cadáver con sistema de descomposición
    initializeCadaver(cadaver, deadCreature) {
        // Propiedades de descomposición
        cadaver.decayTimer = this.DECAY_TIME;
        cadaver.meatValue = deadCreature.phenotype ? (deadCreature.phenotype.size * 10) : 10;

        // Propiedades de enfermedad (si está infectado)
        cadaver.diseaseRisk = deadCreature.infected ? 0.8 : 0.1;
        cadaver.pathogen = deadCreature.infected ? deadCreature.pathogen : null;
    }

    // Actualizar estado de descomposición
    updateDecay(cadaver, deltaTime) {
        if (!cadaver.decayTimer) return false;

        cadaver.decayTimer -= deltaTime;

        // Aumentar riesgo de enfermedad en fase final de putrefacción
        if (cadaver.decayTimer < this.DISEASE_RISK_THRESHOLD) {
            const putrefactionFactor = 1 - (cadaver.decayTimer / this.DISEASE_RISK_THRESHOLD);
            cadaver.diseaseRisk = Math.min(1.0, (cadaver.diseaseRisk || 0.1) + deltaTime * 0.02 * putrefactionFactor);
        }

        // Señal de descomposición completa
        if (cadaver.decayTimer <= 0) {
            return true; // Listo para convertir a nutrientes
        }

        return false;
    }

    // Carroñeros consumen cadáver
    consumeByScavenger(cadaver, amountEaten) {
        if (!cadaver.meatValue) return false;

        cadaver.meatValue -= amountEaten;

        // Acelerar descomposición si es consumido
        if (cadaver.decayTimer) {
            cadaver.decayTimer -= 10; // Acelerar 10 segundos
        }

        // Reducir riesgo si carroñero limpia
        cadaver.diseaseRisk = Math.max(0, (cadaver.diseaseRisk || 0) - 0.1);

        return cadaver.meatValue <= 0;
    }

    // Estado visual del cadáver
    getDecayState(cadaver) {
        if (!cadaver.decayTimer) return 'BONES';

        const progress = 1 - (cadaver.decayTimer / this.DECAY_TIME);

        if (progress < 0.3) return 'FRESH';
        if (progress < 0.7) return 'DECOMPOSING';
        return 'PUTRID';
    }
}

// =============================================================================
// Instancias globales
// =============================================================================
const NutrientManager = new NutrientSystem();
const CadaverManager = new CadaverDecomposition();

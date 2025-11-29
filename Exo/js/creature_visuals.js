// =============================================================================
// CREATURE_VISUALS.JS - Lógica visual procedural para criaturas
// =============================================================================

/**
 * Extensión para la clase Creature con métodos visuales procedurales
 */

// Añadir método getVisualData a la clase Creature
Creature.prototype.getVisualData = function () {
    const visualParts = [];
    const dna = this.dna.genes;

    // Color base de la criatura
    const skinColor = this.getSkinColor();
    const bodyScale = 0.5 + (dna.size_gene * 1.5); // 0.5 a 2.0

    // =============================================================================
    // 0. SOMBRA (Layer 0)
    // =============================================================================
    visualParts.push({
        layer: 0,
        shape: EFFECT_SHADOW,
        offset: { x: 0, y: 10 },
        rotation: 0,
        scale: bodyScale * 1.2,
        color: 'rgba(0,0,0,0.3)',
        alpha: 0.5
    });

    // =============================================================================
    // 1. CUERPO (Layer 10)
    // =============================================================================
    let bodyShape;
    const limbType = dna.limb_type;

    if (limbType < 0.2) {
        bodyShape = BODY_AQUATIC;
    } else if (limbType < 0.3) {
        bodyShape = BODY_SERPENTINE;
    } else if (limbType >= 0.3 && limbType < 0.6) {
        bodyShape = BODY_QUADRUPED;
    } else if (limbType >= 0.6 && limbType < 0.8) {
        bodyShape = BODY_BIPEDAL;
    } else {
        bodyShape = BODY_AERIAL;
    }

    visualParts.push({
        layer: 10,
        shape: bodyShape,
        offset: { x: 0, y: 0 },
        rotation: 0,
        scale: bodyScale,
        color: skinColor,
        alpha: 1.0
    });

    // =============================================================================
    // 2. EXTREMIDADES (Layer 8 - detrás del cuerpo)
    // =============================================================================
    if (limbType >= 0.3 && limbType < 0.8) {
        // Terrestres - patas
        const legScale = bodyScale * 0.8;

        // Patas traseras
        visualParts.push({
            layer: 8,
            shape: LIMB_LEG_BACK,
            offset: { x: -12 * bodyScale, y: 8 * bodyScale },
            rotation: 0,
            scale: legScale,
            color: skinColor,
            alpha: 1.0
        });

        visualParts.push({
            layer: 8,
            shape: LIMB_LEG_BACK,
            offset: { x: 12 * bodyScale, y: 8 * bodyScale },
            rotation: 0,
            scale: legScale,
            color: skinColor,
            alpha: 1.0
        });

        // Patas delanteras
        visualParts.push({
            layer: 12,
            shape: LIMB_LEG_FRONT,
            offset: { x: -12 * bodyScale, y: -8 * bodyScale },
            rotation: 0,
            scale: legScale,
            color: skinColor,
            alpha: 1.0
        });

        visualParts.push({
            layer: 12,
            shape: LIMB_LEG_FRONT,
            offset: { x: 12 * bodyScale, y: -8 * bodyScale },
            rotation: 0,
            scale: legScale,
            color: skinColor,
            alpha: 1.0
        });
    } else if (limbType < 0.3) {
        // Acuáticos - aletas
        visualParts.push({
            layer: 8,
            shape: LIMB_FIN,
            offset: { x: -10 * bodyScale, y: 0 },
            rotation: -Math.PI / 4,
            scale: bodyScale * 0.6,
            color: skinColor,
            alpha: 0.8
        });

        visualParts.push({
            layer: 8,
            shape: LIMB_FIN,
            offset: { x: 10 * bodyScale, y: 0 },
            rotation: Math.PI / 4,
            scale: bodyScale * 0.6,
            color: skinColor,
            alpha: 0.8
        });
    } else if (limbType >= 0.8) {
        // Aéreos - alas
        visualParts.push({
            layer: 8,
            shape: LIMB_WING,
            offset: { x: -8 * bodyScale, y: 0 },
            rotation: -Math.PI / 6,
            scale: bodyScale * 0.7,
            color: skinColor,
            alpha: 0.9
        });

        visualParts.push({
            layer: 8,
            shape: LIMB_WING,
            offset: { x: 8 * bodyScale, y: 0 },
            rotation: Math.PI / 6,
            scale: bodyScale * 0.7,
            color: skinColor,
            alpha: 0.9
        });
    }

    // =============================================================================
    // 3. CABEZA (Layer 15)
    // =============================================================================
    let headShape;
    const dietType = dna.diet_type;

    if (dietType < 0.3) {
        headShape = HEAD_HERBIVORE;
    } else if (dietType > 0.7) {
        headShape = HEAD_CARNIVORE;
    } else if (dietType > 0.9) {
        headShape = HEAD_FILTER;
    } else {
        headShape = HEAD_OMNIVORE;
    }

    const headOffset = limbType >= 0.6 && limbType < 0.8 ? -12 : -18; // Bípedos tienen cabeza más arriba

    visualParts.push({
        layer: 15,
        shape: headShape,
        offset: { x: headOffset * bodyScale, y: 0 },
        rotation: 0,
        scale: bodyScale * 0.8,
        color: skinColor,
        alpha: 1.0
    });

    // =============================================================================
    // 4. ACCESORIOS (Layer 20)
    // =============================================================================

    // Cuernos (aggression > 0.7)
    if (dna.aggression > 0.7) {
        visualParts.push({
            layer: 20,
            shape: ACCESSORY_HORN,
            offset: { x: headOffset * bodyScale - 5, y: -8 * bodyScale },
            rotation: -0.3,
            scale: bodyScale * 0.6,
            color: `rgb(${Math.floor(dna.color_r * 100)}, ${Math.floor(dna.color_g * 100)}, ${Math.floor(dna.color_b * 100)})`,
            alpha: 1.0
        });
    }

    // Espinas (toxicity > 0.6)
    if (dna.toxicity > 0.6) {
        visualParts.push({
            layer: 20,
            shape: ACCESSORY_SPINES,
            offset: { x: 0, y: -12 * bodyScale },
            rotation: 0,
            scale: bodyScale * 0.5,
            color: 'rgb(150, 0, 200)',
            alpha: 0.9
        });
    }

    // Aleta dorsal (acuáticos)
    if (limbType < 0.2) {
        visualParts.push({
            layer: 20,
            shape: ACCESSORY_DORSAL_FIN,
            offset: { x: 0, y: -10 * bodyScale },
            rotation: 0,
            scale: bodyScale,
            color: skinColor,
            alpha: 0.7
        });
    }

    // =============================================================================
    // 5. EFECTOS ESPECIALES (Layer 25)
    // =============================================================================

    // Bioluminiscencia
    if (dna.bioluminescence > 0.5) {
        const glowColor = `rgba(${Math.floor(dna.color_r * 255)}, ${Math.floor(dna.color_g * 255)}, ${Math.floor(dna.color_b * 255)}, ${dna.bioluminescence * 0.5})`;
        visualParts.push({
            layer: 25,
            shape: [{ type: 'circle', x: 0, y: 0, radius: 25, baseColor: glowColor }],
            offset: { x: 0, y: 0 },
            rotation: 0,
            scale: bodyScale * 1.5,
            color: glowColor,
            alpha: dna.bioluminescence * 0.3
        });
    }

    return visualParts;
};

Creature.prototype.getSkinColor = function () {
    const r = Math.round(this.dna.genes.color_r * 255);
    const g = Math.round(this.dna.genes.color_g * 255);
    const b = Math.round(this.dna.genes.color_b * 255);
    return `rgb(${r},${g},${b})`;
};

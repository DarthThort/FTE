// =============================================================================
// DAYNIGHT.JS - Day/Night Cycle System
// =============================================================================

class DayNightCycle {
    constructor() {
        this.dayLength = 60; // seconds (1 minute = 1 day)
        this.timeOfDay = 30; // Start at midday (0-60)
    }

    update(deltaTime) {
        const wasNight = this.isNight();
        this.timeOfDay += deltaTime;
        if (this.timeOfDay >= this.dayLength) {
            this.timeOfDay -= this.dayLength;
        }
        const isNight = this.isNight();

        if (wasNight !== isNight && window.game && window.game.ui) {
            if (isNight) window.game.ui.logEvent('El sol se pone. Comienza la noche.', 'event-extinction');
            else window.game.ui.logEvent('Amanece un nuevo día.', 'event-birth');
        }
    }

    // Is it currently night?
    isNight() {
        // Night from 18:00 to 6:00 (time 45-60 and 0-15)
        return this.timeOfDay > 45 || this.timeOfDay < 15;
    }

    // Get darkness level (0 = day, 1 = darkest night)
    getDarkness() {
        if (!this.isNight()) return 0;

        // Calculate how deep into night we are
        let nightTime;
        if (this.timeOfDay > 45) {
            nightTime = this.timeOfDay - 45; // 0-15
        } else {
            nightTime = 15 - this.timeOfDay; // 15-0
        }

        // Darkness peaks at midnight (nightTime = 7.5)
        const maxDarkness = 0.7; // Never completely black
        const peakTime = 7.5;
        const darknessRatio = 1 - (Math.abs(nightTime - peakTime) / peakTime);

        return darknessRatio * maxDarkness;
    }

    // Get sky color based on time of day
    getSkyColor() {
        const hour = (this.timeOfDay / this.dayLength) * 24;

        // Day (6:00 - 18:00)
        if (hour >= 6 && hour < 18) {
            return '#4a7fa8'; // Blue sky
        }

        // Dawn (5:00 - 7:00)
        if (hour >= 5 && hour < 7) {
            const t = (hour - 5) / 2;
            return this.lerpColor('#1a1a2e', '#ff6b4a', t); // Dark to orange
        }

        // Dusk (17:00 - 19:00)
        if (hour >= 17 && hour < 19) {
            const t = (hour - 17) / 2;
            return this.lerpColor('#ff6b4a', '#1a1a2e', t); // Orange to dark
        }

        // Night
        return '#0a0a1e'; // Dark blue-black
    }

    // Helper: lerp between two hex colors
    lerpColor(color1, color2, t) {
        const r1 = parseInt(color1.substr(1, 2), 16);
        const g1 = parseInt(color1.substr(3, 2), 16);
        const b1 = parseInt(color1.substr(5, 2), 16);

        const r2 = parseInt(color2.substr(1, 2), 16);
        const g2 = parseInt(color2.substr(3, 2), 16);
        const b2 = parseInt(color2.substr(5, 2), 16);

        const r = Math.round(r1 + (r2 - r1) * t);
        const g = Math.round(g1 + (g2 - g1) * t);
        const b = Math.round(b1 + (b2 - b1) * t);

        return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
    }

    // Apply night effects to creatures
    applyToCreatures(creatures) {
        if (!this.isNight()) return;

        const darkness = this.getDarkness();

        for (let creature of creatures) {
            // Creatures without night_vision have reduced vision
            const nightVisionGene = creature.dna.genes.night_vision || 0;

            if (nightVisionGene < 0.5) {
                // Poor night vision - reduce range significantly
                creature.effectiveVisionRange = creature.phenotype.visionRange * (0.3 + nightVisionGene * 0.4);
            } else {
                // Good night vision - little to no penalty
                creature.effectiveVisionRange = creature.phenotype.visionRange * (0.7 + nightVisionGene * 0.3);
            }

            // Thermal vision helps at night
            if (creature.dna.genes.thermal_vision > 0.5) {
                creature.effectiveVisionRange *= 1.2;
            }

            // Bioluminescence makes you visible
            if (creature.dna.genes.bioluminescence > 0.5) {
                creature.isGlowing = true;
            }
        }
    }

    // Reset creature vision during day
    resetCreatureVision(creatures) {
        for (let creature of creatures) {
            creature.effectiveVisionRange = creature.phenotype.visionRange;
            creature.isGlowing = false;
        }
    }

    // Get time of day as string
    getTimeString() {
        const hour = Math.floor((this.timeOfDay / this.dayLength) * 24);
        const minute = Math.floor(((this.timeOfDay / this.dayLength) * 24 % 1) * 60);
        return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
    }
}

// =============================================================================
// PATHOGEN.JS - Sistema de Enfermedades y Epidemiología
// =============================================================================

class Pathogen {
    constructor(config = {}) {
        this.id = `pathogen_${Date.now()}_${Math.random()}`;
        this.name = config.name || this.generateName();

        // Genética del patógeno
        this.transmissibility = config.transmissibility || Math.random() * 0.3 + 0.1; // 0.1-0.4
        this.lethality = config.lethality || Math.random() * 0.5 + 0.2; // 0.2-0.7
        this.incubationTime = config.incubationTime || 10 + Math.random() * 20; // 10-30 segundos

        // Factores ambientales
        this.climateBias = config.climateBias || this.randomClimateBias();

        // Evolución del patógeno
        this.generation = 1;
    }

    generateName() {
        const prefixes = ['Fiebre', 'Plaga', 'Parásito', 'Virus', 'Bacteria', 'Hongo'];
        const suffixes = ['Roja', 'Gris', 'Verde', 'Oscura', 'Mortal', 'Letal', 'Púrpura', 'Negra'];
        const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
        const suffix = suffixes[Math.floor(Math.random() * suffixes.length)];
        return `${prefix} ${suffix}`;
    }

    randomClimateBias() {
        const biases = ['HUMID', 'DRY', 'COLD'];
        return biases[Math.floor(Math.random() * biases.length)];
    }

    getTransmissibilityFor(biome) {
        let multiplier = 1.0;

        // Multiplicador climático
        if (this.climateBias === 'HUMID') {
            if (biome === 'JUNGLE' || biome === 'SWAMP') {
                multiplier = 2.0;
            }
        } else if (this.climateBias === 'COLD') {
            if (biome === 'TUNDRA' || biome === 'TAIGA' || biome === 'SNOW_PEAK') {
                multiplier = 2.0;
            }
        } else if (this.climateBias === 'DRY') {
            if (biome === 'DESERT' || biome === 'PLAINS') {
                multiplier = 1.5;
            }
        }

        return this.transmissibility * multiplier;
    }

    mutate() {
        // Los patógenos también pueden evolucionar
        const mutationStrength = 0.1;

        const newPathogen = new Pathogen({
            name: this.name + ' (Mutada)',
            transmissibility: Utils.clamp(
                this.transmissibility + (Math.random() - 0.5) * mutationStrength,
                0.05,
                0.9
            ),
            lethality: Utils.clamp(
                this.lethality + (Math.random() - 0.5) * mutationStrength,
                0.1,
                0.95
            ),
            incubationTime: this.incubationTime * (0.8 + Math.random() * 0.4), // ±20%
            climateBias: this.climateBias
        });

        newPathogen.generation = this.generation + 1;

        return newPathogen;
    }

    getColor() {
        // Color visual basado en letalidad
        if (this.lethality > 0.7) return '#ff0000'; // Rojo - muy letal
        if (this.lethality > 0.4) return '#ff8800'; // Naranja - letal
        return '#ffff00'; // Amarillo - poco letal
    }
}

// =============================================================================
// Sistema de Gestión de Patógenos
// =============================================================================
class PathogenManager {
    constructor() {
        this.activePathogens = [];
        this.spawnTimer = 0;
        this.MAX_PATHOGENS = 3; // Máximo 3 enfermedades activas
        this.SPAWN_INTERVAL = 120; // Cada 120 segundos, chance de nuevo patógeno
        this.SPAWN_CHANCE = 0.1; // 10% de chance
    }

    update(deltaTime, world, creatures) {
        this.spawnTimer += deltaTime;

        if (this.spawnTimer >= this.SPAWN_INTERVAL) {
            this.spawnTimer = 0;

            if (this.activePathogens.length < this.MAX_PATHOGENS && Math.random() < this.SPAWN_CHANCE) {
                this.spawnPathogen(creatures);
            }
        }

        // Limpiar patógenos sin hosts
        this.activePathogens = this.activePathogens.filter(pathogen => {
            const hasHosts = creatures.some(c => c.infected && c.pathogen && c.pathogen.id === pathogen.id);
            return hasHosts;
        });
    }

    spawnPathogen(creatures) {
        if (creatures.length === 0) return;

        const pathogen = new Pathogen();
        this.activePathogens.push(pathogen);

        // Infectar paciente cero aleatorio
        const patientZero = creatures[Math.floor(Math.random() * creatures.length)];
        if (patientZero) {
            patientZero.infect(pathogen);

            if (window.game && window.game.ui) {
                window.game.ui.logEvent(
                    `¡Brote de ${pathogen.name}! Transmisibilidad: ${(pathogen.transmissibility * 100).toFixed(0)}%, Letalidad: ${(pathogen.lethality * 100).toFixed(0)}%`,
                    'event-extinction'
                );
            }
        }
    }

    getActivePathogenCount() {
        return this.activePathogens.length;
    }
}

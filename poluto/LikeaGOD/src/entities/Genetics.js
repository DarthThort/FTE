export const TraitType = {
    ADAPTABILITY: 'Adaptability',
    ATTACK: 'Attack',
    DEFENSE: 'Defense',
    SPEED: 'Speed',
    CAMOUFLAGE: 'Camouflage',
    REPRODUCTION: 'Reproduction',
    LEARNING: 'Learning'
};

export class Genetics {
    constructor(traits = {}) {
        this.traits = {
            [TraitType.ADAPTABILITY]: traits[TraitType.ADAPTABILITY] || 0.5,
            [TraitType.ATTACK]: traits[TraitType.ATTACK] || 0.5,
            [TraitType.DEFENSE]: traits[TraitType.DEFENSE] || 0.5,
            [TraitType.SPEED]: traits[TraitType.SPEED] || 0.5,
            [TraitType.CAMOUFLAGE]: traits[TraitType.CAMOUFLAGE] || 0.5,
            [TraitType.REPRODUCTION]: traits[TraitType.REPRODUCTION] || 0.5,
            [TraitType.LEARNING]: traits[TraitType.LEARNING] || 0.5
        };
    }

    static combine(parentA, parentB) {
        const newTraits = {};
        for (const key in TraitType) {
            const trait = TraitType[key];
            const valA = parentA.traits[trait];
            const valB = parentB.traits[trait];

            const total = valA + valB;
            let chosenVal = (Math.random() * total < valA) ? valA : valB;

            if (Math.random() < 0.1) {
                chosenVal += (Math.random() - 0.5) * 0.2;
                chosenVal = Math.max(0, Math.min(1, chosenVal));
            }

            newTraits[trait] = chosenVal;
        }
        return new Genetics(newTraits);
    }

    static random() {
        const traits = {};
        for (const key in TraitType) {
            traits[TraitType[key]] = Math.random();
        }
        return new Genetics(traits);
    }

    getAdaptedBiomes() {
        // Higher adaptability = can live in more biome types
        const adaptability = this.traits[TraitType.ADAPTABILITY];
        const biomes = ['Tundra', 'Mountain', 'Forest', 'Desert', 'Sea'];

        // 0.0-0.2: 1 biome, 0.2-0.4: 2 biomes, 0.4-0.6: 3 biomes, 0.6-0.8: 4 biomes, 0.8-1.0: 5 biomes
        const numBiomes = Math.min(5, Math.floor(adaptability * 5) + 1);

        // Shuffle and take first numBiomes
        const shuffled = biomes.sort(() => Math.random() - 0.5);
        return shuffled.slice(0, numBiomes);
    }
}

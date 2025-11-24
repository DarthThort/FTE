export const BiomeType = {
    TUNDRA: 'Tundra',
    FOREST: 'Forest',
    DESERT: 'Desert',
    SEA: 'Sea',
    MOUNTAIN: 'Mountain'
};

export const BiomeStats = {
    [BiomeType.TUNDRA]: {
        color: '#E0F7FA',
        foodProduction: 0.3,
        temperature: -10,
        description: 'Cold and barren, hard to survive.'
    },
    [BiomeType.FOREST]: {
        color: '#4CAF50',
        foodProduction: 1.0,
        temperature: 20,
        description: 'Lush and full of life.'
    },
    [BiomeType.DESERT]: {
        color: '#FFF59D',
        foodProduction: 0.2,
        temperature: 40,
        description: 'Hot and dry, scarce food.'
    },
    [BiomeType.SEA]: {
        color: '#2196F3',
        foodProduction: 0.8,
        temperature: 15,
        description: 'Water world, rich in marine life.'
    },
    [BiomeType.MOUNTAIN]: {
        color: '#9E9E9E',
        foodProduction: 0.4,
        temperature: 5,
        description: 'High altitude, rocky terrain.'
    }
};

export class Biome {
    static get(type) {
        return BiomeStats[type];
    }

    static getColor(type) {
        return BiomeStats[type].color;
    }
}

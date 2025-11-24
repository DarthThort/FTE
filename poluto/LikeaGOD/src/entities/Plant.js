import { Entity } from './Entity.js';
import { BiomeType } from '../world/Biome.js';

// Configuración de plantas por bioma
const PlantConfig = {
    [BiomeType.TUNDRA]: {
        name: 'Musgo Ártico',
        color: '#81C784',
        growthRate: 0.05,
        energy: 5,
        survivalDays: 5,
        minSize: 4,
        maxSize: 8,
        shape: 'circle'
    },
    [BiomeType.MOUNTAIN]: {
        name: 'Arbusto Rocoso',
        color: '#558B2F',
        growthRate: 0.07,
        energy: 8,
        survivalDays: 4,
        minSize: 6,
        maxSize: 12,
        shape: 'pentagon'
    },
    [BiomeType.FOREST]: {
        name: 'Helecho Frondoso',
        color: '#4CAF50',
        growthRate: 0.15,
        energy: 15,
        survivalDays: 3,
        minSize: 8,
        maxSize: 16,
        shape: 'triangle'
    },
    [BiomeType.DESERT]: {
        name: 'Cactus',
        color: '#26A69A',
        growthRate: 0.04,
        energy: 6,
        survivalDays: 7,
        minSize: 5,
        maxSize: 14,
        shape: 'cactus'
    },
    [BiomeType.SEA]: {
        name: 'Alga Marina',
        color: '#00897B',
        growthRate: 0.12,
        energy: 12,
        survivalDays: 3,
        minSize: 6,
        maxSize: 14,
        shape: 'seaweed'
    }
};

export class Plant extends Entity {
    constructor(x, y, biomeType) {
        super(x, y, 'plant');
        this.biomeType = biomeType;

        // Obtener configuración según el bioma
        const config = PlantConfig[biomeType] || PlantConfig[BiomeType.FOREST];

        this.name = config.name;
        this.color = config.color;
        this.growthRate = config.growthRate;
        this.energy = config.energy;
        this.survivalDays = config.survivalDays;
        this.minSize = config.minSize;
        this.maxSize = config.maxSize;
        this.shape = config.shape;

        this.growth = 0;
        this.maxGrowth = 100;
        this.reproductionThreshold = 80;
    }

    update(deltaTime, world) {
        super.update(deltaTime);

        // Crecimiento con tasa específica del bioma
        if (this.growth < this.maxGrowth) {
            this.growth += this.growthRate;
        }
    }

    markAsEaten() {
        this.hasBeenEaten = true;
    }

    render(ctx) {
        const growthPercent = this.growth / this.maxGrowth;
        const size = this.minSize + (this.maxSize - this.minSize) * growthPercent;

        ctx.fillStyle = this.color;

        switch (this.shape) {
            case 'circle': // Musgo Ártico (Tundra)
                ctx.beginPath();
                ctx.arc(this.x, this.y, size / 2, 0, Math.PI * 2);
                ctx.fill();
                break;

            case 'pentagon': // Arbusto Rocoso (Mountain)
                this.renderPentagon(ctx, size);
                break;

            case 'triangle': // Helecho Frondoso (Forest)
                ctx.beginPath();
                ctx.moveTo(this.x, this.y - size / 2);
                ctx.lineTo(this.x - size / 2, this.y + size / 2);
                ctx.lineTo(this.x + size / 2, this.y + size / 2);
                ctx.closePath();
                ctx.fill();
                break;

            case 'cactus': // Cactus (Desert)
                this.renderCactus(ctx, size);
                break;

            case 'seaweed': // Alga Marina (Sea)
                this.renderSeaweed(ctx, size);
                break;

            default:
                // Forma por defecto
                ctx.fillRect(this.x - size / 2, this.y - size / 2, size, size);
        }
    }

    renderPentagon(ctx, size) {
        ctx.beginPath();
        const radius = size / 2;
        for (let i = 0; i < 5; i++) {
            const angle = (Math.PI * 2 / 5) * i - Math.PI / 2;
            const x = this.x + radius * Math.cos(angle);
            const y = this.y + radius * Math.sin(angle);
            if (i === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        }
        ctx.closePath();
        ctx.fill();
    }

    renderCactus(ctx, size) {
        const width = size / 3;
        const height = size;

        // Cuerpo principal
        ctx.fillRect(this.x - width / 2, this.y - height / 2, width, height);

        // Brazos laterales (más pequeños)
        const armSize = size * 0.4;
        ctx.fillRect(this.x - width / 2 - armSize / 2, this.y - height / 4, armSize / 2, armSize / 1.5);
        ctx.fillRect(this.x + width / 2, this.y, armSize / 2, armSize / 1.5);
    }

    renderSeaweed(ctx, size) {
        ctx.strokeStyle = this.color;
        ctx.lineWidth = size / 4;
        ctx.lineCap = 'round';

        ctx.beginPath();
        const segments = 4;
        const segmentHeight = size / segments;

        for (let i = 0; i <= segments; i++) {
            const yPos = this.y - size / 2 + i * segmentHeight;
            const xOffset = Math.sin(i * 0.8) * (size / 6);

            if (i === 0) {
                ctx.moveTo(this.x + xOffset, yPos);
            } else {
                ctx.lineTo(this.x + xOffset, yPos);
            }
        }
        ctx.stroke();
    }
}

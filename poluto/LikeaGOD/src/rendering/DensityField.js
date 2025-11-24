export class DensityField {
    constructor(width, height, scale = 0.25) {
        this.width = width;
        this.height = height;
        this.scale = scale;

        // Canvas de baja resolución para performance
        this.fieldWidth = Math.floor(width * scale);
        this.fieldHeight = Math.floor(height * scale);

        this.canvas = document.createElement('canvas');
        this.canvas.width = this.fieldWidth;
        this.canvas.height = this.fieldHeight;
        this.ctx = this.canvas.getContext('2d');

        // Radios de gradiente por tipo de entidad (reducidos para más definición)
        this.splatRadius = {
            plant: 15 * scale,
            herbivore: 18 * scale,
            carnivore: 20 * scale,
            omnivore: 19 * scale
        };

        // Colores por tipo
        this.colors = {
            plant: { r: 76, g: 175, b: 80 },       // #4CAF50
            herbivore: { r: 139, g: 195, b: 74 },  // #8BC34A
            carnivore: { r: 244, g: 67, b: 54 },   // #F44336
            omnivore: { r: 255, g: 152, b: 0 }     // #FF9800
        };
    }

    clear() {
        this.ctx.clearRect(0, 0, this.fieldWidth, this.fieldHeight);
    }

    update(entities) {
        this.clear();

        // Agrupar entidades por tipo para renderizar en capas
        const layers = {
            plant: [],
            herbivore: [],
            carnivore: [],
            omnivore: []
        };

        entities.forEach(entity => {
            if (entity.isDead) return;

            if (entity.type === 'plant') {
                layers.plant.push(entity);
            } else if (entity.type === 'creature') {
                if (entity.diet === 'Herbivore') {
                    layers.herbivore.push(entity);
                } else if (entity.diet === 'Carnivore') {
                    layers.carnivore.push(entity);
                } else if (entity.diet === 'Omnivore') {
                    layers.omnivore.push(entity);
                }
            }
        });

        // Renderizar cada capa con blend mode aditivo
        this.ctx.globalCompositeOperation = 'lighter';

        this.renderLayer(layers.plant, 'plant');
        this.renderLayer(layers.herbivore, 'herbivore');
        this.renderLayer(layers.carnivore, 'carnivore');
        this.renderLayer(layers.omnivore, 'omnivore');

        this.ctx.globalCompositeOperation = 'source-over';
    }

    renderLayer(entities, type) {
        const color = this.colors[type];
        const radius = this.splatRadius[type];

        entities.forEach(entity => {
            this.drawSplat(
                entity.x * this.scale,
                entity.y * this.scale,
                radius,
                color
            );
        });
    }

    drawSplat(x, y, radius, color) {
        // Crear gradiente radial
        const gradient = this.ctx.createRadialGradient(x, y, 0, x, y, radius);

        // Centro más opaco con transición más abrupta para más definición
        gradient.addColorStop(0, `rgba(${color.r}, ${color.g}, ${color.b}, 0.8)`);
        gradient.addColorStop(0.6, `rgba(${color.r}, ${color.g}, ${color.b}, 0.2)`);
        gradient.addColorStop(1, `rgba(${color.r}, ${color.g}, ${color.b}, 0)`);

        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(x - radius, y - radius, radius * 2, radius * 2);
    }

    render(targetCtx) {
        // Escalar y renderizar el campo de densidad en el canvas principal
        targetCtx.save();
        targetCtx.imageSmoothingEnabled = true;
        targetCtx.imageSmoothingQuality = 'high';

        targetCtx.drawImage(
            this.canvas,
            0, 0, this.fieldWidth, this.fieldHeight,
            0, 0, this.width, this.height
        );

        targetCtx.restore();
    }
}

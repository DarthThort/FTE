// =============================================================================
// PROCEDURAL_RENDERER.JS - Motor de Rendering Procedural
// =============================================================================

class ProceduralRenderer {
    constructor(ctx) {
        this.ctx = ctx;
        this.pixelSize = 1; // Tamaño de "píxel" para estilo pixel art
    }

    // =============================================================================
    // Primitivas Básicas de Dibujo
    // =============================================================================

    /**
     * Dibuja un píxel individual
     */
    drawPixel(x, y, color) {
        this.ctx.fillStyle = color;
        this.ctx.fillRect(
            Math.floor(x),
            Math.floor(y),
            this.pixelSize,
            this.pixelSize
        );
    }

    /**
     * Dibuja un rectángulo (relleno o con contorno)
     */
    drawRect(x, y, width, height, color, stroke = false, strokeColor = '#000', strokeWidth = 1) {
        this.ctx.fillStyle = color;
        this.ctx.fillRect(
            Math.floor(x - width / 2),
            Math.floor(y - height / 2),
            Math.floor(width),
            Math.floor(height)
        );

        if (stroke) {
            this.ctx.strokeStyle = strokeColor;
            this.ctx.lineWidth = strokeWidth;
            this.ctx.strokeRect(
                Math.floor(x - width / 2),
                Math.floor(y - height / 2),
                Math.floor(width),
                Math.floor(height)
            );
        }
    }

    /**
     * Dibuja un círculo
     */
    drawCircle(x, y, radius, color, stroke = false, strokeColor = '#000', strokeWidth = 1) {
        this.ctx.fillStyle = color;
        this.ctx.beginPath();
        this.ctx.arc(Math.floor(x), Math.floor(y), Math.floor(radius), 0, Math.PI * 2);
        this.ctx.fill();

        if (stroke) {
            this.ctx.strokeStyle = strokeColor;
            this.ctx.lineWidth = strokeWidth;
            this.ctx.stroke();
        }
    }

    /**
     * Dibuja una elipse
     */
    drawEllipse(x, y, radiusX, radiusY, color, stroke = false, strokeColor = '#000', strokeWidth = 1) {
        this.ctx.fillStyle = color;
        this.ctx.beginPath();
        this.ctx.ellipse(Math.floor(x), Math.floor(y), Math.floor(radiusX), Math.floor(radiusY), 0, 0, Math.PI * 2);
        this.ctx.fill();

        if (stroke) {
            this.ctx.strokeStyle = strokeColor;
            this.ctx.lineWidth = strokeWidth;
            this.ctx.stroke();
        }
    }

    /**
     * Dibuja una línea
     */
    drawLine(x1, y1, x2, y2, color, thickness = 1) {
        this.ctx.strokeStyle = color;
        this.ctx.lineWidth = thickness;
        this.ctx.beginPath();
        this.ctx.moveTo(Math.floor(x1), Math.floor(y1));
        this.ctx.lineTo(Math.floor(x2), Math.floor(y2));
        this.ctx.stroke();
    }

    /**
     * Dibuja un polígono
     */
    drawPolygon(points, color, stroke = false, strokeColor = '#000', strokeWidth = 1) {
        if (points.length < 3) return;

        this.ctx.fillStyle = color;
        this.ctx.beginPath();
        this.ctx.moveTo(Math.floor(points[0].x), Math.floor(points[0].y));

        for (let i = 1; i < points.length; i++) {
            this.ctx.lineTo(Math.floor(points[i].x), Math.floor(points[i].y));
        }

        this.ctx.closePath();
        this.ctx.fill();

        if (stroke) {
            this.ctx.strokeStyle = strokeColor;
            this.ctx.lineWidth = strokeWidth;
            this.ctx.stroke();
        }
    }

    // =============================================================================
    // Funciones de Mezcla de Color
    // =============================================================================

    /**
     * Parsea un color a componentes RGB
     */
    parseColor(color) {
        // Manejar colores base
        const baseColors = {
            'light': { r: 200, g: 200, b: 200 },
            'medium': { r: 128, g: 128, b: 128 },
            'dark': { r: 64, g: 64, b: 64 },
            'black': { r: 0, g: 0, b: 0 },
            'white': { r: 255, g: 255, b: 255 }
        };

        if (baseColors[color]) return baseColors[color];

        // Parsear formato rgb(r,g,b)
        const match = color.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
        if (match) {
            return {
                r: parseInt(match[1]),
                g: parseInt(match[2]),
                b: parseInt(match[3])
            };
        }

        // Default: retornar como gris medio
        return { r: 128, g: 128, b: 128 };
    }

    /**
     * Mezcla dos colores
     */
    mixColors(color1, color2, intensity = 0.5) {
        const c1 = this.parseColor(color1);
        const c2 = this.parseColor(color2);

        const r = Math.round(c1.r * (1 - intensity) + c2.r * intensity);
        const g = Math.round(c1.g * (1 - intensity) + c2.g * intensity);
        const b = Math.round(c1.b * (1 - intensity) + c2.b * intensity);

        return `rgb(${r},${g},${b})`;
    }

    /**
     * Aplica color genético a un color base
     */
    applyGeneticColor(baseColor, geneticRGB, intensity = 0.7) {
        return this.mixColors(baseColor, geneticRGB, intensity);
    }

    /**
     * Oscurece un color (para sombras)
     */
    darkenColor(color, amount = 0.3) {
        const c = this.parseColor(color);
        const r = Math.round(c.r * (1 - amount));
        const g = Math.round(c.g * (1 - amount));
        const b = Math.round(c.b * (1 - amount));
        return `rgb(${r},${g},${b})`;
    }

    // =============================================================================
    // Renderizado de Partes Procedurales
    // =============================================================================

    /**
     * Renderiza una parte completa (conjunto de primitivas)
     */
    renderPart(shapeData, drawX, drawY, rotation = 0, scale = 1.0, tintColor = null, alpha = 1.0) {
        this.ctx.save();
        this.ctx.translate(drawX, drawY);
        this.ctx.rotate(rotation);
        this.ctx.scale(scale, scale);
        this.ctx.globalAlpha = alpha;

        shapeData.forEach(primitive => {
            // Calcular color final
            let finalColor = primitive.baseColor;
            if (tintColor) {
                finalColor = this.applyGeneticColor(primitive.baseColor, tintColor, 0.6);
            }

            // Renderizar según tipo
            switch (primitive.type) {
                case 'rect':
                    this.drawRect(
                        primitive.x,
                        primitive.y,
                        primitive.w,
                        primitive.h,
                        finalColor,
                        primitive.stroke || false,
                        primitive.strokeColor || '#000',
                        primitive.strokeWidth || 1
                    );
                    break;

                case 'circle':
                    this.drawCircle(
                        primitive.x,
                        primitive.y,
                        primitive.radius,
                        finalColor,
                        primitive.stroke || false,
                        primitive.strokeColor || '#000',
                        primitive.strokeWidth || 1
                    );
                    break;

                case 'ellipse':
                    this.drawEllipse(
                        primitive.x,
                        primitive.y,
                        primitive.radiusX,
                        primitive.radiusY,
                        finalColor,
                        primitive.stroke || false,
                        primitive.strokeColor || '#000',
                        primitive.strokeWidth || 1
                    );
                    break;

                case 'line':
                    this.drawLine(
                        primitive.x1,
                        primitive.y1,
                        primitive.x2,
                        primitive.y2,
                        finalColor,
                        primitive.thickness || 1
                    );
                    break;

                case 'polygon':
                    this.drawPolygon(
                        primitive.points,
                        finalColor,
                        primitive.stroke || false,
                        primitive.strokeColor || '#000',
                        primitive.strokeWidth || 1
                    );
                    break;

                case 'pixel':
                    this.drawPixel(primitive.x, primitive.y, primitive.color || finalColor);
                    break;
            }
        });

        this.ctx.restore();
    }

    /**
     * Renderiza una criatura completa
     */
    renderCreature(creature, cameraX, cameraY) {
        const visualParts = creature.getVisualData();
        const screenX = creature.x - cameraX;
        const screenY = creature.y - cameraY;
        const creatureRotation = creature.rotation || 0;

        // Ordenar por layer
        visualParts.sort((a, b) => a.layer - b.layer);

        // Renderizar cada parte
        visualParts.forEach(part => {
            const offsetX = part.offset.x * Math.cos(creatureRotation) - part.offset.y * Math.sin(creatureRotation);
            const offsetY = part.offset.x * Math.sin(creatureRotation) + part.offset.y * Math.cos(creatureRotation);

            this.renderPart(
                part.shape,
                screenX + offsetX,
                screenY + offsetY,
                creatureRotation + (part.rotation || 0),
                part.scale,
                part.color,
                part.alpha || 1.0
            );
        });
    }
}

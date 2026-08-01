/**
 * ModularExteriorHullRenderer.js
 * Renders a thick, smooth, 3D-molded off-white/light-grey sci-fi hull chassis 
 * surrounding the ship layout, matching high-definition sci-fi ship floorplans.
 */

class ModularExteriorHullRenderer {
    constructor(gameEngine) {
        this.game = gameEngine;
        this.tileSize = 32;
    }

    render(ctx, layout, ship) {
        if (!layout || layout.length === 0) return;

        const width = layout[0].length;
        const height = layout.length;
        const p = this.tileSize;

        ctx.save();

        // 1. Heavy Outer Drop Shadow for Hull Depth
        ctx.fillStyle = 'rgba(0, 0, 0, 0.65)';
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                if (layout[y][x] !== 0) {
                    ctx.beginPath();
                    ctx.roundRect(x * p - 6, y * p - 6, p + 12, p + 12, 10);
                    ctx.fill();
                }
            }
        }

        // 2. Thick Off-White Molded Hull Outer Chassis (Matching reference image!)
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                if (layout[y][x] === 0) {
                    const isBorder = this.isAdjacentToShip(layout, x, y, width, height);
                    if (isBorder) {
                        const posX = x * p;
                        const posY = y * p;

                        // Off-White / Light Slate Molded Metal Gradient
                        const grad = ctx.createLinearGradient(posX, posY, posX + p, posY + p);
                        grad.addColorStop(0, '#f8fafc');
                        grad.addColorStop(0.5, '#cbd5e1');
                        grad.addColorStop(1, '#94a3b8');

                        ctx.fillStyle = grad;
                        ctx.beginPath();
                        ctx.roundRect(posX - 3, posY - 3, p + 6, p + 6, 8);
                        ctx.fill();

                        // Inner Bevel Stroke & Panel Seams
                        ctx.strokeStyle = '#64748b';
                        ctx.lineWidth = 1.5;
                        ctx.stroke();

                        // High-tech panel groove line
                        ctx.strokeStyle = '#475569';
                        ctx.lineWidth = 1;
                        ctx.beginPath();
                        ctx.moveTo(posX + 4, posY + p / 2);
                        ctx.lineTo(posX + p - 4, posY + p / 2);
                        ctx.stroke();
                    }
                }
            }
        }

        ctx.restore();
    }

    isAdjacentToShip(layout, x, y, width, height) {
        for (let dy = -1; dy <= 1; dy++) {
            for (let dx = -1; dx <= 1; dx++) {
                if (dx === 0 && dy === 0) continue;
                const nx = x + dx;
                const ny = y + dy;
                if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
                    if (layout[ny][nx] !== 0) return true;
                }
            }
        }
        return false;
    }
}

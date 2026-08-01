/**
 * ModularExteriorHullRenderer.js
 * Advanced Sci-Fi Exterior Starship Hull Renderer
 * Renders smooth continuous curved armor plates, cockpit canopy, engine fairings,
 * panel seams, glowing energy conduits, and forcefield aura over grid tiles.
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
        const time = Date.now() / 1000;

        ctx.save();

        // 1. Render Outer Forcefield Shield Aura around ship perimeter
        this.renderShieldAura(ctx, layout, width, height, time);

        // 2. Render Smooth Continuous Armored Metallic Hull Plating
        this.renderSmoothHullPlating(ctx, layout, width, height, time);

        // 3. Render Exterior Hull Micro-Modules (Cockpit Dome, Wingtips, Engine Exhaust Fairings)
        this.renderHullModules(ctx, layout, ship, width, height, time);

        ctx.restore();
    }

    /**
     * Render translucent hexagonal forcefield energy aura wrapping the ship silhouette
     */
    renderShieldAura(ctx, layout, width, height, time) {
        const p = this.tileSize;
        ctx.save();

        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                if (layout[y][x] === 0) {
                    const isBorder = this.isAdjacentToShip(layout, x, y, width, height);
                    if (isBorder) {
                        const posX = x * p + p / 2;
                        const posY = y * p + p / 2;
                        const pulse = Math.sin(time * 3 + x * 0.5 + y * 0.5) * 0.15 + 0.25;

                        ctx.fillStyle = `rgba(0, 240, 255, ${pulse * 0.35})`;
                        ctx.shadowColor = '#00f0ff';
                        ctx.shadowBlur = 10;
                        ctx.beginPath();
                        ctx.arc(posX, posY, p * 0.65, 0, Math.PI * 2);
                        ctx.fill();
                    }
                }
            }
        }
        ctx.restore();
    }

    /**
     * Render smooth continuous curved hull armor plates
     */
    renderSmoothHullPlating(ctx, layout, width, height, time) {
        const p = this.tileSize;

        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                if (layout[y][x] === 0 && this.isAdjacentToShip(layout, x, y, width, height)) {
                    const posX = x * p;
                    const posY = y * p;
                    const n = this.getNeighbors(layout, x, y, width, height);

                    // Metallic Gradient
                    const grad = ctx.createLinearGradient(posX, posY, posX + p, posY + p);
                    grad.addColorStop(0, '#1e293b');
                    grad.addColorStop(0.5, '#0f172a');
                    grad.addColorStop(1, '#030712');

                    ctx.fillStyle = grad;
                    ctx.strokeStyle = 'rgba(0, 240, 255, 0.4)';
                    ctx.lineWidth = 2;

                    // Smooth Curved Bezier Shapes
                    ctx.beginPath();

                    if (n.S && !n.N) { // Top Edge (Nose / Bow)
                        ctx.moveTo(posX, posY + p);
                        ctx.quadraticCurveTo(posX + p / 2, posY + 4, posX + p, posY + p);
                    } else if (n.N && !n.S) { // Bottom Edge (Stern)
                        ctx.moveTo(posX, posY);
                        ctx.quadraticCurveTo(posX + p / 2, posY + p - 4, posX + p, posY);
                    } else if (n.E && !n.W) { // Left Edge (Port Wing)
                        ctx.moveTo(posX + p, posY);
                        ctx.quadraticCurveTo(posX + 4, posY + p / 2, posX + p, posY + p);
                    } else if (n.W && !n.E) { // Right Edge (Starboard Wing)
                        ctx.moveTo(posX, posY);
                        ctx.quadraticCurveTo(posX + p - 4, posY + p / 2, posX, posY + p);
                    } else { // Corners
                        ctx.arc(posX + p / 2, posY + p / 2, p / 3, 0, Math.PI * 2);
                    }

                    ctx.closePath();
                    ctx.fill();
                    ctx.stroke();

                    // Glowing Cyan Energy Line Accent
                    ctx.strokeStyle = '#00f0ff';
                    ctx.shadowColor = '#00f0ff';
                    ctx.shadowBlur = 6;
                    ctx.lineWidth = 1;
                    ctx.stroke();
                    ctx.shadowBlur = 0;
                }
            }
        }
    }

    /**
     * Render specialized exterior hull features: Cockpit Glass Dome, Wingtip Beacons, Engine Nozzles
     */
    renderHullModules(ctx, layout, ship, width, height, time) {
        const p = this.tileSize;

        // Find Bridge, Systems, Engine tiles
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const system = ship.systems?.find(s => s.x === x && s.y === y);
                const posX = x * p;
                const posY = y * p;

                if (system) {
                    if (system.type === 'bridge') {
                        // Glass Cockpit Canopy Overlay
                        ctx.save();
                        ctx.fillStyle = 'rgba(0, 240, 255, 0.25)';
                        ctx.strokeStyle = '#00f0ff';
                        ctx.shadowColor = '#00f0ff';
                        ctx.shadowBlur = 10;
                        ctx.lineWidth = 2;

                        ctx.beginPath();
                        ctx.ellipse(posX + p / 2, posY - 6, p / 3, p / 2, 0, 0, Math.PI * 2);
                        ctx.fill();
                        ctx.stroke();
                        ctx.restore();
                    } else if (system.type === 'engine') {
                        // Armored Thruster Exhaust Nozzle
                        ctx.save();
                        ctx.fillStyle = '#0f172a';
                        ctx.strokeStyle = '#ffaa00';
                        ctx.shadowColor = '#ffaa00';
                        ctx.shadowBlur = 12;
                        ctx.lineWidth = 2;

                        ctx.beginPath();
                        ctx.rect(posX + 4, posY + p - 2, p - 8, 8);
                        ctx.fill();
                        ctx.stroke();

                        // Glowing Plasma Flame Core
                        const flamePulse = Math.sin(time * 20) * 3 + 12;
                        ctx.fillStyle = '#ffaa00';
                        ctx.beginPath();
                        ctx.arc(posX + p / 2, posY + p + 4, flamePulse / 2, 0, Math.PI * 2);
                        ctx.fill();

                        ctx.restore();
                    }
                }
            }
        }
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

    getNeighbors(layout, x, y, width, height) {
        return {
            N: y > 0 && layout[y - 1][x] !== 0,
            S: y < height - 1 && layout[y + 1][x] !== 0,
            W: x > 0 && layout[y][x - 1] !== 0,
            E: x < width - 1 && layout[y][x + 1] !== 0
        };
    }
}

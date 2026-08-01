/**
 * TileRenderer.js
 * Handles rendering of ship tiles, walls, doors, floors, and system modules.
 * Overhauled to match high-definition 3D molded sci-fi floorplan aesthetic.
 */

class TileRenderer {
    constructor(gameEngine) {
        this.game = gameEngine;
        this.tileSize = 32;
        this.exteriorHullRenderer = new ModularExteriorHullRenderer(gameEngine);
    }

    /**
     * Main render method for grid, tiles, and systems
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     * @param {Array} layout - Ship layout array
     * @param {Array} systems - Ship systems array
     */
    render(ctx, layout, systems) {
        const ship = this.game.state?.ship;

        // 1. Draw Molded Outer Hull Chassis
        if (this.exteriorHullRenderer && ship) {
            this.exteriorHullRenderer.render(ctx, layout, ship);
        }

        // 2. Draw Floor & Wall Interior Layout
        this.drawGrid(ctx, layout);

        // 3. Draw Embedded 3D Consoles & Systems
        this.drawSystems(ctx, systems);
    }

    /**
     * Draw the ship grid with molded walls, pneumatic doors, and slate floor panels
     */
    drawGrid(ctx, layout) {
        const p = this.tileSize;

        for (let y = 0; y < layout.length; y++) {
            for (let x = 0; x < layout[y].length; x++) {
                const tile = layout[y][x];
                const posX = x * p;
                const posY = y * p;

                if (tile === 0) continue;

                // FLOOR TILES (2 = floor, 3 = system slot, 7 = infirmary)
                if (tile !== 1) {
                    this.drawFloorTile(ctx, posX, posY, tile, x, y);
                }

                // WALLS & DOORS
                if (tile === 1) {
                    this.drawMoldedWall(ctx, posX, posY, layout, x, y);
                } else if (tile === 4) {
                    this.drawPneumaticDoor(ctx, posX, posY, false);
                } else if (tile === 5) {
                    this.drawPneumaticDoor(ctx, posX, posY, true);
                }
            }
        }
    }

    drawFloorTile(ctx, posX, posY, tile, x, y) {
        const p = this.tileSize;

        // Dark Slate Blue Metal Floor Base (Matches reference image!)
        const isHazard = (x + y) % 7 === 0;
        const grad = ctx.createLinearGradient(posX, posY, posX + p, posY + p);

        if (isHazard) {
            // Orange Hazard Accent Floor Panel
            grad.addColorStop(0, '#f97316');
            grad.addColorStop(1, '#ea580c');
        } else {
            // Deep Slate Blue Floor Panel
            grad.addColorStop(0, '#1e293b');
            grad.addColorStop(1, '#0f172a');
        }

        ctx.fillStyle = grad;
        ctx.fillRect(posX, posY, p, p);

        // Floor Seam Lines & Rivet Joints
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
        ctx.lineWidth = 1;
        ctx.strokeRect(posX + 1, posY + 1, p - 2, p - 2);

        // Corner Rivets
        ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
        ctx.fillRect(posX + 3, posY + 3, 2, 2);
        ctx.fillRect(posX + p - 5, posY + 3, 2, 2);
        ctx.fillRect(posX + 3, posY + p - 5, 2, 2);
        ctx.fillRect(posX + p - 5, posY + p - 5, 2, 2);
    }

    drawMoldedWall(ctx, posX, posY, layout, x, y) {
        const p = this.tileSize;

        ctx.save();

        // Wall Shadow for 3D Bulkhead Depth
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fillRect(posX + 2, posY + 4, p, p);

        // Molded Light Slate Wall Body (Matches reference image!)
        const wallGrad = ctx.createLinearGradient(posX, posY, posX, posY + p);
        wallGrad.addColorStop(0, '#f8fafc'); // Top Bevel Highlight
        wallGrad.addColorStop(0.4, '#e2e8f0'); // Wall Face
        wallGrad.addColorStop(1, '#cbd5e1'); // Base Shadow

        ctx.fillStyle = wallGrad;
        ctx.beginPath();
        ctx.roundRect(posX, posY, p, p, 5);
        ctx.fill();

        // Molded Bulkhead Inner Border Seam
        ctx.strokeStyle = '#94a3b8';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Panel Groove Line
        ctx.strokeStyle = '#64748b';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(posX + 4, posY + p / 2);
        ctx.lineTo(posX + p - 4, posY + p / 2);
        ctx.stroke();

        ctx.restore();
    }

    drawPneumaticDoor(ctx, posX, posY, isOpen) {
        const p = this.tileSize;

        ctx.save();
        // Door Frame
        ctx.fillStyle = '#475569';
        ctx.fillRect(posX, posY, p, p);

        if (isOpen) {
            // Open Door Pocket
            ctx.fillStyle = '#0f172a';
            ctx.fillRect(posX + 4, posY + 4, p - 8, p - 8);

            // Green Sensor Light
            ctx.fillStyle = '#00ff55';
            ctx.shadowColor = '#00ff55';
            ctx.shadowBlur = 6;
            ctx.fillRect(posX + p / 2 - 4, posY + 2, 8, 3);
        } else {
            // Closed Blast Door Plates (Orange & Dark Steel)
            ctx.fillStyle = '#f97316';
            ctx.fillRect(posX + 3, posY + 3, (p - 6) / 2 - 1, p - 6);
            ctx.fillRect(posX + p / 2 + 1, posY + 3, (p - 6) / 2 - 1, p - 6);

            ctx.strokeStyle = '#0f172a';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(posX + p / 2, posY + 3);
            ctx.lineTo(posX + p / 2, posY + p - 3);
            ctx.stroke();

            // Red Lock Light
            ctx.fillStyle = '#ff0055';
            ctx.shadowColor = '#ff0055';
            ctx.shadowBlur = 6;
            ctx.fillRect(posX + p / 2 - 4, posY + 2, 8, 3);
        }

        ctx.restore();
    }

    drawSystems(ctx, systems) {
        if (!systems) return;

        const p = this.tileSize;

        systems.forEach(sys => {
            const posX = sys.x * p;
            const posY = sys.y * p;

            ctx.save();

            // Console Base Housing
            ctx.fillStyle = '#0f172a';
            ctx.beginPath();
            ctx.roundRect(posX + 2, posY + 2, p - 4, p - 4, 4);
            ctx.fill();

            ctx.strokeStyle = sys.color || '#00f0ff';
            ctx.shadowColor = sys.color || '#00f0ff';
            ctx.shadowBlur = 8;
            ctx.lineWidth = 1.5;
            ctx.stroke();

            // Screen / Interface Monitor
            ctx.fillStyle = sys.color || '#00f0ff';
            ctx.fillRect(posX + 6, posY + 6, p - 12, p - 16);

            // System Abbreviation Badge
            ctx.fillStyle = '#ffffff';
            ctx.font = '900 9px "Rajdhani", var(--font-tech, monospace)';
            ctx.textAlign = 'center';
            ctx.shadowBlur = 0;
            const code = sys.type.substring(0, 3).toUpperCase();
            ctx.fillText(code, posX + p / 2, posY + p - 4);

            ctx.restore();
        });
    }
}

/**
 * TileRenderer.js
 * Handles rendering of ship tiles, walls, doors, floors, and system modules
 * Extracted from ShipRenderer.js to reduce file size
 */

class TileRenderer {
    constructor(gameEngine) {
        this.game = gameEngine;
        this.tileSize = 32;
    }

    /**
     * Main render method for grid, tiles, and systems
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     * @param {Array} layout - Ship layout array
     * @param {Array} systems - Ship systems array
     */
    render(ctx, layout, systems) {
        this.drawExteriorHull(ctx, layout);
        this.drawGrid(ctx, layout);
        this.drawSystems(ctx, systems);
    }

    /**
     * Draw procedural modular exterior hull around the perimeter of the ship grid
     */
    drawExteriorHull(ctx, layout) {
        if (!layout || layout.length === 0) return;

        const width = layout[0].length;
        const height = layout.length;
        const time = Date.now() / 1000;

        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                // If this is a space tile (0), check if it borders ship interior tiles (non-0)
                if (layout[y][x] === 0) {
                    const N = (y > 0 && layout[y - 1][x] !== 0);
                    const S = (y < height - 1 && layout[y + 1][x] !== 0);
                    const W = (x > 0 && layout[y][x - 1] !== 0);
                    const E = (x < width - 1 && layout[y][x + 1] !== 0);

                    const NW = (y > 0 && x > 0 && layout[y - 1][x - 1] !== 0);
                    const NE = (y > 0 && x < width - 1 && layout[y - 1][x + 1] !== 0);
                    const SW = (y < height - 1 && x > 0 && layout[y + 1][x - 1] !== 0);
                    const SE = (y < height - 1 && x < width - 1 && layout[y + 1][x + 1] !== 0);

                    // If at least one adjacent tile is ship interior, draw outer hull tile!
                    if (N || S || W || E || NW || NE || SW || SE) {
                        const posX = x * this.tileSize;
                        const posY = y * this.tileSize;
                        this.drawHullTile(ctx, posX, posY, { N, S, W, E, NW, NE, SW, SE }, time, x, y, width, height);
                    }
                }
            }
        }
    }

    /**
     * Draw individual modular hull armor tile
     */
    drawHullTile(ctx, posX, posY, n, time, gridX, gridY, width, height) {
        ctx.save();

        // 1. Dark Armor Metal Base
        const grad = ctx.createLinearGradient(posX, posY, posX + 32, posY + 32);
        grad.addColorStop(0, '#1e293b');
        grad.addColorStop(0.5, '#0f172a');
        grad.addColorStop(1, '#020617');
        ctx.fillStyle = grad;

        if (n.S && !n.N) { // Top border (Proa / Nose)
            ctx.beginPath();
            ctx.moveTo(posX, posY + 32);
            ctx.lineTo(posX + 16, posY + 8);
            ctx.lineTo(posX + 32, posY + 32);
            ctx.closePath();
            ctx.fill();

            // Metallic Bevel Edge
            ctx.strokeStyle = 'rgba(0, 240, 255, 0.4)';
            ctx.lineWidth = 1.5;
            ctx.stroke();

            // Panel seams
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
            ctx.beginPath();
            ctx.moveTo(posX + 16, posY + 8);
            ctx.lineTo(posX + 16, posY + 32);
            ctx.stroke();
        } else if (n.N && !n.S) { // Bottom border (Popa / Engine Vents)
            ctx.beginPath();
            ctx.moveTo(posX, posY);
            ctx.lineTo(posX + 32, posY);
            ctx.lineTo(posX + 24, posY + 24);
            ctx.lineTo(posX + 8, posY + 24);
            ctx.closePath();
            ctx.fill();

            ctx.strokeStyle = 'rgba(255, 170, 0, 0.4)';
            ctx.lineWidth = 1.5;
            ctx.stroke();

            // Small Engine Vent Glow
            ctx.fillStyle = 'rgba(255, 170, 0, 0.2)';
            ctx.fillRect(posX + 10, posY + 16, 12, 6);
        } else if (n.E && !n.W) { // Left border (Babor / Port Wing)
            ctx.beginPath();
            ctx.moveTo(posX + 32, posY);
            ctx.lineTo(posX + 8, posY + 16);
            ctx.lineTo(posX + 32, posY + 32);
            ctx.closePath();
            ctx.fill();

            ctx.strokeStyle = 'rgba(0, 240, 255, 0.3)';
            ctx.lineWidth = 1.5;
            ctx.stroke();

            // Port Navigation Light (Red LED)
            const pulse = 0.5 + Math.sin(time * 6 + gridY) * 0.5;
            ctx.fillStyle = `rgba(255, 0, 85, ${0.4 + pulse * 0.6})`;
            ctx.shadowColor = '#ff0055';
            ctx.shadowBlur = 8;
            ctx.beginPath();
            ctx.arc(posX + 10, posY + 16, 3, 0, Math.PI * 2);
            ctx.fill();
            ctx.shadowBlur = 0;
        } else if (n.W && !n.E) { // Right border (Estribor / Starboard Wing)
            ctx.beginPath();
            ctx.moveTo(posX, posY);
            ctx.lineTo(posX + 24, posY + 16);
            ctx.lineTo(posX, posY + 32);
            ctx.closePath();
            ctx.fill();

            ctx.strokeStyle = 'rgba(0, 240, 255, 0.3)';
            ctx.lineWidth = 1.5;
            ctx.stroke();

            // Starboard Navigation Light (Green LED)
            const pulse = 0.5 + Math.sin(time * 6 + gridY) * 0.5;
            ctx.fillStyle = `rgba(0, 255, 85, ${0.4 + pulse * 0.6})`;
            ctx.shadowColor = '#00ff55';
            ctx.shadowBlur = 8;
            ctx.beginPath();
            ctx.arc(posX + 22, posY + 16, 3, 0, Math.PI * 2);
            ctx.fill();
            ctx.shadowBlur = 0;
        } else { // Corner or diagonal hull plates
            ctx.fillRect(posX + 4, posY + 4, 24, 24);
            ctx.strokeStyle = 'rgba(0, 240, 255, 0.2)';
            ctx.lineWidth = 1;
            ctx.strokeRect(posX + 4, posY + 4, 24, 24);
        }

        ctx.restore();
    }

    /**
     * Draw the ship grid with tiles, walls, doors, floors
     */
    drawGrid(ctx, layout) {
        for (let y = 0; y < layout.length; y++) {
            for (let x = 0; x < layout[y].length; x++) {
                const tile = layout[y][x];
                const posX = x * this.tileSize;
                const posY = y * this.tileSize;

                // Tile 0 = outer space, skip (let starfield show through)
                if (tile === 0) {
                    continue;
                }

                // Base floor
                ctx.fillStyle = '#0b1120';
                ctx.fillRect(posX, posY, this.tileSize, this.tileSize);
                ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
                ctx.lineWidth = 1;
                ctx.strokeRect(posX, posY, this.tileSize, this.tileSize);

                // Tile types
                if (tile === 1) {
                    // Wall
                    this.drawWall(ctx, posX, posY);
                } else if (tile === 3) {
                    // System slot
                    this.drawSystemSlot(ctx, posX, posY);
                } else if (tile === 4) {
                    // Closed door
                    this.drawClosedDoor(ctx, posX, posY);
                } else if (tile === 5) {
                    // Open door
                    this.drawOpenDoor(ctx, posX, posY);
                } else if (tile === 7) {
                    // Infirmary
                    this.drawInfirmary(ctx, posX, posY);
                }
            }
        }
    }

    drawWall(ctx, posX, posY) {
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(posX + 2, posY + 2, this.tileSize - 4, this.tileSize - 4);
        ctx.shadowColor = '#00f0ff';
        ctx.shadowBlur = 10;
        ctx.strokeStyle = '#00f0ff';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(posX + 4, posY + 4, this.tileSize - 8, this.tileSize - 8);
        ctx.shadowBlur = 0;
    }

    drawSystemSlot(ctx, posX, posY) {
        ctx.strokeStyle = '#334155';
        ctx.lineWidth = 2;
        ctx.strokeRect(posX + 4, posY + 4, this.tileSize - 8, this.tileSize - 8);
        ctx.fillStyle = '#64748b';
        const s = 4;
        ctx.fillRect(posX + 4, posY + 4, s, s);
        ctx.fillRect(posX + this.tileSize - 4 - s, posY + 4, s, s);
        ctx.fillRect(posX + 4, posY + this.tileSize - 4 - s, s, s);
        ctx.fillRect(posX + this.tileSize - 4 - s, posY + this.tileSize - 4 - s, s, s);
    }

    drawClosedDoor(ctx, posX, posY) {
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(posX, posY, this.tileSize, this.tileSize);
        ctx.save();
        ctx.beginPath();
        ctx.rect(posX + 2, posY + 2, this.tileSize - 4, this.tileSize - 4);
        ctx.clip();
        ctx.fillStyle = '#d97706';
        ctx.fillRect(posX, posY, this.tileSize, this.tileSize);
        ctx.fillStyle = '#000';
        ctx.lineWidth = 4;
        for (let i = -this.tileSize; i < this.tileSize * 2; i += 8) {
            ctx.beginPath();
            ctx.moveTo(posX + i, posY);
            ctx.lineTo(posX + i + 8, posY + this.tileSize);
            ctx.lineTo(posX + i + 4, posY + this.tileSize);
            ctx.lineTo(posX + i - 4, posY);
            ctx.fill();
        }
        ctx.restore();
        ctx.strokeStyle = '#d97706';
        ctx.lineWidth = 2;
        ctx.strokeRect(posX + 2, posY + 2, this.tileSize - 4, this.tileSize - 4);
    }

    drawOpenDoor(ctx, posX, posY) {
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(posX, posY, this.tileSize, this.tileSize);
        ctx.fillStyle = '#059669';
        ctx.fillRect(posX, posY, 6, this.tileSize);
        ctx.fillRect(posX + this.tileSize - 6, posY, 6, this.tileSize);
        ctx.fillStyle = '#34d399';
        ctx.fillRect(posX + 2, posY + this.tileSize / 2 - 2, 2, 4);
        ctx.fillRect(posX + this.tileSize - 4, posY + this.tileSize / 2 - 2, 2, 4);
    }

    drawInfirmary(ctx, posX, posY) {
        // Dark red floor
        ctx.fillStyle = '#2d1a1a';
        ctx.fillRect(posX, posY, this.tileSize, this.tileSize);

        // Medical cross
        ctx.fillStyle = '#ff5555';
        const centerX = posX + this.tileSize / 2;
        const centerY = posY + this.tileSize / 2;
        const crossSize = this.tileSize * 0.4;
        const crossWidth = crossSize * 0.3;

        // Vertical bar
        ctx.fillRect(centerX - crossWidth / 2, centerY - crossSize / 2, crossWidth, crossSize);
        // Horizontal bar
        ctx.fillRect(centerX - crossSize / 2, centerY - crossWidth / 2, crossSize, crossWidth);

        // Border
        ctx.strokeStyle = 'rgba(255, 85, 85, 0.3)';
        ctx.lineWidth = 1;
        ctx.strokeRect(posX, posY, this.tileSize, this.tileSize);
    }

    /**
     * Draw system modules on the grid
     */
    drawSystems(ctx, systems) {
        for (const sys of systems) {
            const posX = sys.x * this.tileSize;
            const posY = sys.y * this.tileSize;

            // Check if system has a module installed
            const systemToHardpoint = {
                'bridge': 'bridge',
                'shield': 'shield',
                'engine': 'engine',
                'jumpdrive': 'jumpDrive',
                'reactor': 'reactor',
                'weapon': sys.id === 'weapons1' ? 'weapon1' : 'weapon2'
            };
            const hardpointKey = systemToHardpoint[sys.type];
            const hasModule = hardpointKey && this.game.state.ship.hardpoints[hardpointKey];

            // Darker appearance if no module installed
            const alpha = hasModule ? 0.2 : 0.05;
            const shadowBlur = hasModule ? 15 : 5;

            ctx.shadowColor = sys.color;
            ctx.shadowBlur = shadowBlur;
            ctx.fillStyle = sys.color;
            ctx.globalAlpha = alpha;
            ctx.fillRect(posX + 2, posY + 2, this.tileSize - 4, this.tileSize - 4);
            ctx.globalAlpha = 1.0;
            ctx.shadowBlur = 0;
            ctx.strokeStyle = hasModule ? sys.color : '#444';
            ctx.lineWidth = 2;
            ctx.strokeRect(posX + 4, posY + 4, this.tileSize - 8, this.tileSize - 8);

            // Draw system ID
            ctx.fillStyle = hasModule ? '#fff' : '#666';
            ctx.font = 'bold 10px "Courier New", monospace';
            ctx.textAlign = 'center';
            ctx.fillText(sys.id.substring(0, 3).toUpperCase(), posX + this.tileSize / 2, posY + this.tileSize / 2 + 4);
        }
    }
}

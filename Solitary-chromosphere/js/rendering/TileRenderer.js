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

        // Find ship bounding box to place nav lights ONLY on outermost wingtips
        let minX = width, maxX = 0, minY = height, maxY = 0;
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                if (layout[y][x] !== 0) {
                    if (x < minX) minX = x;
                    if (x > maxX) maxX = x;
                    if (y < minY) minY = y;
                    if (y > maxY) maxY = y;
                }
            }
        }

        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                if (layout[y][x] === 0) {
                    const N = (y > 0 && layout[y - 1][x] !== 0);
                    const S = (y < height - 1 && layout[y + 1][x] !== 0);
                    const W = (x > 0 && layout[y][x - 1] !== 0);
                    const E = (x < width - 1 && layout[y][x + 1] !== 0);

                    const NW = (y > 0 && x > 0 && layout[y - 1][x - 1] !== 0);
                    const NE = (y > 0 && x < width - 1 && layout[y - 1][x + 1] !== 0);
                    const SW = (y < height - 1 && x > 0 && layout[y + 1][x - 1] !== 0);
                    const SE = (y < height - 1 && x < width - 1 && layout[y + 1][x + 1] !== 0);

                    if (N || S || W || E || NW || NE || SW || SE) {
                        const posX = x * this.tileSize;
                        const posY = y * this.tileSize;
                        this.drawSmoothHullTile(ctx, posX, posY, { N, S, W, E, NW, NE, SW, SE }, time, x, y, width, height, minX, maxX, minY, maxY);
                    }
                }
            }
        }
    }

    /**
     * Draw continuous, smooth sci-fi metallic hull armor plate
     */
    drawSmoothHullTile(ctx, posX, posY, n, time, gridX, gridY, width, height, minX, maxX, minY, maxY) {
        ctx.save();

        const p = this.tileSize; // 32
        const h = p / 2; // 16

        // Dark Metallic Gradient
        const grad = ctx.createLinearGradient(posX, posY, posX + p, posY + p);
        grad.addColorStop(0, '#1e293b');
        grad.addColorStop(0.5, '#0f172a');
        grad.addColorStop(1, '#020617');
        ctx.fillStyle = grad;
        ctx.strokeStyle = 'rgba(0, 240, 255, 0.3)';
        ctx.lineWidth = 1.5;

        // 1. STRAIGHT BORDERS (Continuous smooth bands, no sawteeth!)
        if (n.S && !n.N && !n.W && !n.E) { // Top Straight Armor Band (Proa)
            ctx.fillRect(posX, posY + h, p, h);
            ctx.strokeRect(posX, posY + h, p, h);
            // Panel seam
            if (gridX % 2 === 0) {
                ctx.strokeStyle = 'rgba(255,255,255,0.12)';
                ctx.beginPath(); ctx.moveTo(posX, posY + h); ctx.lineTo(posX, posY + p); ctx.stroke();
            }
        } else if (n.N && !n.S && !n.W && !n.E) { // Bottom Straight Armor Band (Popa)
            ctx.fillRect(posX, posY, p, h);
            ctx.strokeRect(posX, posY, p, h);
            if (gridX % 2 === 0) {
                ctx.strokeStyle = 'rgba(255,255,255,0.12)';
                ctx.beginPath(); ctx.moveTo(posX, posY); ctx.lineTo(posX, posY + h); ctx.stroke();
            }
        } else if (n.E && !n.W && !n.N && !n.S) { // Left Straight Armor Band (Babor)
            ctx.fillRect(posX + h, posY, h, p);
            ctx.strokeRect(posX + h, posY, h, p);
            if (gridY % 2 === 0) {
                ctx.strokeStyle = 'rgba(255,255,255,0.12)';
                ctx.beginPath(); ctx.moveTo(posX + h, posY); ctx.lineTo(posX + p, posY); ctx.stroke();
            }
            // Nav light ONLY if at outermost wingtip corner
            if (gridX === minX - 1 && (gridY === minY || gridY === maxY || gridY === Math.floor((minY + maxY) / 2))) {
                const pulse = 0.5 + Math.sin(time * 6 + gridY) * 0.5;
                ctx.fillStyle = `rgba(255, 0, 85, ${0.4 + pulse * 0.6})`;
                ctx.shadowColor = '#ff0055'; ctx.shadowBlur = 8;
                ctx.beginPath(); ctx.arc(posX + h + 4, posY + h, 3.5, 0, Math.PI * 2); ctx.fill(); ctx.shadowBlur = 0;
            }
        } else if (n.W && !n.E && !n.N && !n.S) { // Right Straight Armor Band (Estribor)
            ctx.fillRect(posX, posY, h, p);
            ctx.strokeRect(posX, posY, h, p);
            if (gridY % 2 === 0) {
                ctx.strokeStyle = 'rgba(255,255,255,0.12)';
                ctx.beginPath(); ctx.moveTo(posX, posY); ctx.lineTo(posX + h, posY); ctx.stroke();
            }
            // Nav light ONLY if at outermost wingtip corner
            if (gridX === maxX + 1 && (gridY === minY || gridY === maxY || gridY === Math.floor((minY + maxY) / 2))) {
                const pulse = 0.5 + Math.sin(time * 6 + gridY) * 0.5;
                ctx.fillStyle = `rgba(0, 255, 85, ${0.4 + pulse * 0.6})`;
                ctx.shadowColor = '#00ff55'; ctx.shadowBlur = 8;
                ctx.beginPath(); ctx.arc(posX + h - 4, posY + h, 3.5, 0, Math.PI * 2); ctx.fill(); ctx.shadowBlur = 0;
            }
        } 
        // 2. SMOOTH 45-DEGREE CORNER CHAMFERS (Seamless Transition)
        else if (n.S && n.E) { // Top-Left Outer Corner
            ctx.beginPath();
            ctx.moveTo(posX + p, posY + h);
            ctx.lineTo(posX + h, posY + p);
            ctx.lineTo(posX + p, posY + p);
            ctx.closePath();
            ctx.fill(); ctx.stroke();
        } else if (n.S && n.W) { // Top-Right Outer Corner
            ctx.beginPath();
            ctx.moveTo(posX, posY + h);
            ctx.lineTo(posX + h, posY + p);
            ctx.lineTo(posX, posY + p);
            ctx.closePath();
            ctx.fill(); ctx.stroke();
        } else if (n.N && n.E) { // Bottom-Left Outer Corner
            ctx.beginPath();
            ctx.moveTo(posX + p, posY);
            ctx.lineTo(posX + h, posY);
            ctx.lineTo(posX + p, posY + h);
            ctx.closePath();
            ctx.fill(); ctx.stroke();
        } else if (n.N && n.W) { // Bottom-Right Outer Corner
            ctx.beginPath();
            ctx.moveTo(posX, posY);
            ctx.lineTo(posX + h, posY);
            ctx.lineTo(posX, posY + h);
            ctx.closePath();
            ctx.fill(); ctx.stroke();
        } 
        // 3. DIAGONALS & FILLERS
        else {
            ctx.fillRect(posX + 6, posY + 6, 20, 20);
            ctx.strokeRect(posX + 6, posY + 6, 20, 20);
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

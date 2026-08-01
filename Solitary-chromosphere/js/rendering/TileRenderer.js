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
        this.drawGrid(ctx, layout);
        this.drawSystems(ctx, systems);
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
                    this.drawWall(ctx, posX, posY, x, y, layout);
                } else if (tile === 3) {
                    // System slot
                    this.drawSystemSlot(ctx, posX, posY);
                } else if (tile === 4) {
                    // Closed door
                    this.drawClosedDoor(ctx, posX, posY, x, y, layout);
                } else if (tile === 5) {
                    // Open door
                    this.drawOpenDoor(ctx, posX, posY, x, y, layout);
                } else if (tile === 7) {
                    // Infirmary
                    this.drawInfirmary(ctx, posX, posY);
                }
            }
        }
    }

    /**
     * Draw high-tech vibrant orange pneumatic blast door (Closed State)
     */
    drawClosedDoor(ctx, posX, posY, gridX = 0, gridY = 0, layout = null) {
        ctx.save();
        const p = this.tileSize; // 32

        // Determine orientation (Horizontal if W & E walls, Vertical if N & S walls)
        let isVertical = false;
        if (layout && gridY > 0 && gridY < layout.length - 1) {
            const tUp = layout[gridY - 1][gridX];
            const tDown = layout[gridY + 1][gridX];
            if ((tUp === 1 || tUp === 4 || tUp === 5) && (tDown === 1 || tDown === 4 || tDown === 5)) {
                isVertical = true;
            }
        }

        // 1. Dark Threshold Base Floor
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(posX, posY, p, p);

        // 2. Molded Steel Door Frame Pockets
        ctx.fillStyle = '#334155';
        ctx.strokeStyle = '#cbd5e1';
        ctx.lineWidth = 1.5;

        if (isVertical) { // Vertical Door Frame (Pockets Top & Bottom)
            ctx.fillRect(posX, posY, p, 4);
            ctx.fillRect(posX, posY + p - 4, p, 4);
            ctx.strokeRect(posX, posY, p, 4);
            ctx.strokeRect(posX, posY + p - 4, p, 4);
        } else { // Horizontal Door Frame (Pockets Left & Right)
            ctx.fillRect(posX, posY, 4, p);
            ctx.fillRect(posX + p - 4, posY, 4, p);
            ctx.strokeRect(posX, posY, 4, p);
            ctx.strokeRect(posX + p - 4, posY, 4, p);
        }

        // 3. Vibrant Orange Armored Blast Door Leaves (Highlighted Sci-Fi Orange)
        const orangeGrad = ctx.createLinearGradient(posX, posY, posX + p, posY + p);
        orangeGrad.addColorStop(0, '#ff7700'); // Vibrant Neon Orange Highlight
        orangeGrad.addColorStop(0.5, '#f97316'); // Core Sci-Fi Orange
        orangeGrad.addColorStop(1, '#c2410c'); // Deep Bevel Shadow

        ctx.fillStyle = orangeGrad;
        ctx.strokeStyle = '#7c2d12';
        ctx.lineWidth = 1.5;

        if (isVertical) {
            // Top Leaf
            ctx.fillRect(posX + 3, posY + 3, p - 6, 12);
            ctx.strokeRect(posX + 3, posY + 3, p - 6, 12);

            // Bottom Leaf
            ctx.fillRect(posX + 3, posY + 17, p - 6, 12);
            ctx.strokeRect(posX + 3, posY + 17, p - 6, 12);

            // Interlocking Center Pressure Seal (Horizontal Seam)
            ctx.fillStyle = '#0f172a';
            ctx.fillRect(posX + 2, posY + 15, p - 4, 2);

            // Hydraulic Handle Lock
            ctx.fillStyle = '#fed7aa';
            ctx.fillRect(posX + p / 2 - 4, posY + 14, 8, 4);
        } else {
            // Left Leaf
            ctx.fillRect(posX + 3, posY + 3, 12, p - 6);
            ctx.strokeRect(posX + 3, posY + 3, 12, p - 6);

            // Right Leaf
            ctx.fillRect(posX + 17, posY + 3, 12, p - 6);
            ctx.strokeRect(posX + 17, posY + 3, 12, p - 6);

            // Interlocking Center Pressure Seal (Vertical Seam)
            ctx.fillStyle = '#0f172a';
            ctx.fillRect(posX + 15, posY + 2, 2, p - 4);

            // Hydraulic Handle Lock
            ctx.fillStyle = '#fed7aa';
            ctx.fillRect(posX + 14, posY + p / 2 - 4, 4, 8);
        }

        // 4. Status Indicator LED Bar (🔴 RED = LOCKED / CLOSED)
        ctx.fillStyle = '#ef4444';
        ctx.shadowColor = '#ef4444';
        ctx.shadowBlur = 6;
        if (isVertical) {
            ctx.fillRect(posX + 2, posY + p / 2 - 1, 3, 2);
            ctx.fillRect(posX + p - 5, posY + p / 2 - 1, 3, 2);
        } else {
            ctx.fillRect(posX + p / 2 - 4, posY + 2, 8, 2);
        }
        ctx.shadowBlur = 0;

        ctx.restore();
    }

    /**
     * Draw high-tech open pneumatic blast door (Retracted Leaves + Green Sensor Light)
     */
    drawOpenDoor(ctx, posX, posY, gridX = 0, gridY = 0, layout = null) {
        ctx.save();
        const p = this.tileSize;

        let isVertical = false;
        if (layout && gridY > 0 && gridY < layout.length - 1) {
            const tUp = layout[gridY - 1][gridX];
            const tDown = layout[gridY + 1][gridX];
            if ((tUp === 1 || tUp === 4 || tUp === 5) && (tDown === 1 || tDown === 4 || tDown === 5)) {
                isVertical = true;
            }
        }

        // 1. Open Walkway Floor Threshold
        ctx.fillStyle = '#0b1329';
        ctx.fillRect(posX, posY, p, p);

        // Illuminated Floor Track Stripes
        ctx.strokeStyle = 'rgba(0, 240, 255, 0.3)';
        ctx.lineWidth = 1;
        if (isVertical) {
            ctx.beginPath(); ctx.moveTo(posX + 8, posY); ctx.lineTo(posX + 8, posY + p); ctx.stroke();
            ctx.beginPath(); ctx.moveTo(posX + p - 8, posY); ctx.lineTo(posX + p - 8, posY + p); ctx.stroke();
        } else {
            ctx.beginPath(); ctx.moveTo(posX, posY + 8); ctx.lineTo(posX + p, posY + 8); ctx.stroke();
            ctx.beginPath(); ctx.moveTo(posX, posY + p - 8); ctx.lineTo(posX + p, posY + p - 8); ctx.stroke();
        }

        // 2. Retracted Orange Door Leaves inside Frame Pockets
        ctx.fillStyle = '#ff7700';
        ctx.strokeStyle = '#cbd5e1';
        ctx.lineWidth = 1;

        if (isVertical) {
            // Top Pocket Retracted Leaf
            ctx.fillRect(posX + 4, posY + 1, p - 8, 4);
            ctx.strokeRect(posX + 4, posY + 1, p - 8, 4);

            // Bottom Pocket Retracted Leaf
            ctx.fillRect(posX + 4, posY + p - 5, p - 8, 4);
            ctx.strokeRect(posX + 4, posY + p - 5, p - 8, 4);
        } else {
            // Left Pocket Retracted Leaf
            ctx.fillRect(posX + 1, posY + 4, 4, p - 8);
            ctx.strokeRect(posX + 1, posY + 4, 4, p - 8);

            // Right Pocket Retracted Leaf
            ctx.fillRect(posX + p - 5, posY + 4, 4, p - 8);
            ctx.strokeRect(posX + p - 5, posY + 4, 4, p - 8);
        }

        // 3. Status Indicator LED Bar (🟢 GREEN = OPEN)
        ctx.fillStyle = '#10b981';
        ctx.shadowColor = '#10b981';
        ctx.shadowBlur = 8;
        if (isVertical) {
            ctx.fillRect(posX + 2, posY + p / 2 - 1, 3, 2);
            ctx.fillRect(posX + p - 5, posY + p / 2 - 1, 3, 2);
        } else {
            ctx.fillRect(posX + p / 2 - 4, posY + 2, 8, 2);
        }
        ctx.shadowBlur = 0;

        ctx.restore();
    }

    /**
     * Draw homogeneous connected sci-fi bulkhead wall based on orientation (Horizontal, Vertical, Corners, T-Junctions, Crosses)
     */
    drawWall(ctx, posX, posY, gridX = 0, gridY = 0, layout = null) {
        ctx.save();

        const p = this.tileSize; // 32
        const h = p / 2; // 16
        const time = Date.now() / 1000;

        // Check wall connections (N, S, W, E)
        let N = false, S = false, W = false, E = false;

        if (layout) {
            const isWall = (gx, gy) => {
                if (gy < 0 || gy >= layout.length || gx < 0 || gx >= layout[0].length) return false;
                const t = layout[gy][gx];
                return t === 1 || t === 4 || t === 5; // Wall or door
            };
            N = isWall(gridX, gridY - 1);
            S = isWall(gridX, gridY + 1);
            W = isWall(gridX - 1, gridY);
            E = isWall(gridX + 1, gridY);
        } else {
            W = true; E = true;
        }

        // Homogeneous Metallic Base Gradient
        const wallGrad = ctx.createLinearGradient(posX, posY, posX + p, posY + p);
        wallGrad.addColorStop(0, '#334155');
        wallGrad.addColorStop(0.5, '#1e293b');
        wallGrad.addColorStop(1, '#0f172a');

        ctx.fillStyle = wallGrad;
        ctx.strokeStyle = '#cbd5e1'; // Bright, crisp metallic steel border outline!
        ctx.lineWidth = 2;

        // 1. HORIZONTAL WALL (W && E && !N && !S)
        if (W && E && !N && !S) {
            ctx.fillRect(posX, posY + 4, p, p - 8);
            ctx.strokeRect(posX, posY + 4, p, p - 8);

            // Highlight Top & Bottom Border Bevel Edges
            ctx.strokeStyle = '#94a3b8';
            ctx.beginPath();
            ctx.moveTo(posX, posY + 4); ctx.lineTo(posX + p, posY + 4);
            ctx.moveTo(posX, posY + p - 4); ctx.lineTo(posX + p, posY + p - 4);
            ctx.stroke();

            // Metallic Center Beam
            ctx.fillStyle = '#334155';
            ctx.fillRect(posX, posY + 10, p, 12);
            ctx.strokeStyle = 'rgba(0, 240, 255, 0.4)';
            ctx.beginPath(); ctx.moveTo(posX, posY + 16); ctx.lineTo(posX + p, posY + 16); ctx.stroke();

            // Sparse Detail (LED or Monitor every 4 tiles)
            if ((gridX + gridY) % 4 === 0) {
                ctx.fillStyle = '#00f0ff'; ctx.shadowColor = '#00f0ff'; ctx.shadowBlur = 5;
                ctx.fillRect(posX + 10, posY + 14, 12, 4); ctx.shadowBlur = 0;
            } else if ((gridX + gridY) % 4 === 2) {
                ctx.fillStyle = '#ef4444'; ctx.shadowColor = '#ef4444'; ctx.shadowBlur = 4;
                ctx.beginPath(); ctx.arc(posX + 16, posY + 16, 2.5, 0, Math.PI * 2); ctx.fill(); ctx.shadowBlur = 0;
            }
        }
        // 2. VERTICAL WALL (N && S && !W && !E)
        else if (N && S && !W && !E) {
            ctx.fillRect(posX + 4, posY, p - 8, p);
            ctx.strokeRect(posX + 4, posY, p - 8, p);

            // Highlight Left & Right Border Bevel Edges
            ctx.strokeStyle = '#94a3b8';
            ctx.beginPath();
            ctx.moveTo(posX + 4, posY); ctx.lineTo(posX + 4, posY + p);
            ctx.moveTo(posX + p - 4, posY); ctx.lineTo(posX + p - 4, posY + p);
            ctx.stroke();

            // Metallic Center Pillar
            ctx.fillStyle = '#334155';
            ctx.fillRect(posX + 10, posY, 12, p);
            ctx.strokeStyle = 'rgba(0, 240, 255, 0.4)';
            ctx.beginPath(); ctx.moveTo(posX + 16, posY); ctx.lineTo(posX + 16, posY + p); ctx.stroke();

            // Sparse Detail (Vertical Conduit Line)
            if ((gridX + gridY) % 3 === 0) {
                ctx.fillStyle = '#38bdf8'; ctx.shadowColor = '#38bdf8'; ctx.shadowBlur = 4;
                ctx.fillRect(posX + 14, posY + 10, 4, 12); ctx.shadowBlur = 0;
            }
        }
        // 3. CORNERS (L-Junctions)
        else if ((S && E && !N && !W) || (S && W && !N && !E) || (N && E && !S && !W) || (N && W && !S && !E)) {
            const cornerVariant = Math.abs(gridX * 13 + gridY * 37) % 4;

            if (S && E && !N && !W) { // Top-Left Corner
                ctx.beginPath();
                ctx.moveTo(posX + 4, posY + p); ctx.lineTo(posX + 4, posY + 4);
                ctx.lineTo(posX + p, posY + 4); ctx.lineTo(posX + p, posY + p - 4);
                ctx.lineTo(posX + p - 4, posY + p - 4); ctx.lineTo(posX + p - 4, posY + p);
                ctx.closePath(); ctx.fill(); ctx.stroke();
            } else if (S && W && !N && !E) { // Top-Right Corner
                ctx.beginPath();
                ctx.moveTo(posX + p - 4, posY + p); ctx.lineTo(posX + p - 4, posY + 4);
                ctx.lineTo(posX, posY + 4); ctx.lineTo(posX, posY + p - 4);
                ctx.lineTo(posX + 4, posY + p - 4); ctx.lineTo(posX + 4, posY + p);
                ctx.closePath(); ctx.fill(); ctx.stroke();
            } else if (N && E && !S && !W) { // Bottom-Left Corner
                ctx.beginPath();
                ctx.moveTo(posX + 4, posY); ctx.lineTo(posX + 4, posY + p - 4);
                ctx.lineTo(posX + p, posY + p - 4); ctx.lineTo(posX + p, posY + 4);
                ctx.lineTo(posX + p - 4, posY + 4); ctx.lineTo(posX + p - 4, posY);
                ctx.closePath(); ctx.fill(); ctx.stroke();
            } else if (N && W && !S && !E) { // Bottom-Right Corner
                ctx.beginPath();
                ctx.moveTo(posX + p - 4, posY); ctx.lineTo(posX + p - 4, posY + p - 4);
                ctx.lineTo(posX, posY + p - 4); ctx.lineTo(posX, posY + 4);
                ctx.lineTo(posX + 4, posY + 4); ctx.lineTo(posX + 4, posY);
                ctx.closePath(); ctx.fill(); ctx.stroke();
            }

            // CORNER DETAILS (Occasional screens / lights / braces)
            if (cornerVariant === 1) { // Energy Conduit Brace
                ctx.strokeStyle = '#00f0ff'; ctx.lineWidth = 1;
                ctx.beginPath(); ctx.moveTo(posX + 8, posY + 8); ctx.lineTo(posX + p - 8, posY + p - 8); ctx.stroke();
            } else if (cornerVariant === 2) { // Occasional Small Monitor Screen
                ctx.fillStyle = '#090d16'; ctx.fillRect(posX + h - 4, posY + h - 4, 8, 8);
                ctx.strokeStyle = '#38bdf8'; ctx.strokeRect(posX + h - 4, posY + h - 4, 8, 8);
                ctx.fillStyle = '#00f0ff'; ctx.shadowColor = '#00f0ff'; ctx.shadowBlur = 3;
                ctx.fillRect(posX + h - 2, posY + h - 1, 4, 2); ctx.shadowBlur = 0;
            } else if (cornerVariant === 3) { // Occasional Switch Toggle
                ctx.fillStyle = '#334155'; ctx.fillRect(posX + h - 3, posY + h - 3, 6, 6);
                ctx.fillStyle = '#f59e0b'; ctx.shadowColor = '#f59e0b'; ctx.shadowBlur = 3;
                ctx.fillRect(posX + h - 1, posY + h - 1, 2, 2); ctx.shadowBlur = 0;
            }
        }
        // 4. T-JUNCTIONS & CROSSES / GENERAL CONNECTED WALLS
        else {
            const junctionVariant = Math.abs(gridX * 19 + gridY * 41) % 4;

            ctx.fillRect(posX + 4, posY + 4, p - 8, p - 8);
            ctx.strokeRect(posX + 4, posY + 4, p - 8, p - 8);

            // Connect arms seamlessly
            if (N) ctx.fillRect(posX + 4, posY, p - 8, 6);
            if (S) ctx.fillRect(posX + 4, posY + p - 6, p - 8, 6);
            if (W) ctx.fillRect(posX, posY + 4, 6, p - 8);
            if (E) ctx.fillRect(posX + p - 6, posY + 4, 6, p - 8);

            // JUNCTION DETAILS (Occasional LED, Screen, or Switchboard)
            if (junctionVariant === 0) { // Clean Metallic Rivet Core
                ctx.fillStyle = '#475569';
                ctx.fillRect(posX + h - 3, posY + h - 3, 6, 6);
                ctx.fillStyle = '#94a3b8';
                ctx.fillRect(posX + h - 1, posY + h - 1, 2, 2);
            } else if (junctionVariant === 1) { // Status LED Light Node
                ctx.fillStyle = '#10b981'; ctx.shadowColor = '#10b981'; ctx.shadowBlur = 5;
                ctx.beginPath(); ctx.arc(posX + h, posY + h, 2.5, 0, Math.PI * 2); ctx.fill(); ctx.shadowBlur = 0;
            } else if (junctionVariant === 2) { // Occasional Telemetry Screen Core
                ctx.fillStyle = '#090d16'; ctx.fillRect(posX + h - 5, posY + h - 4, 10, 8);
                ctx.strokeStyle = '#38bdf8'; ctx.strokeRect(posX + h - 5, posY + h - 4, 10, 8);
                ctx.fillStyle = '#00f0ff'; ctx.shadowColor = '#00f0ff'; ctx.shadowBlur = 3;
                ctx.fillRect(posX + h - 3, posY + h - 1, 6, 2); ctx.shadowBlur = 0;
            } else if (junctionVariant === 3) { // Occasional Switch Matrix
                ctx.fillStyle = '#1e293b'; ctx.fillRect(posX + h - 5, posY + h - 4, 10, 8);
                ctx.fillStyle = '#ef4444'; ctx.fillRect(posX + h - 3, posY + h - 2, 2, 2);
                ctx.fillStyle = '#10b981'; ctx.fillRect(posX + h + 1, posY + h - 2, 2, 2);
                ctx.fillStyle = '#38bdf8'; ctx.fillRect(posX + h - 1, posY + h + 1, 2, 2);
            }
        }

        ctx.restore();
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

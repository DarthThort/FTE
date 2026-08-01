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
                    this.drawWall(ctx, posX, posY, x, y);
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

    /**
     * Draw high-definition sci-fi wall panel with 6 procedural metallic variants
     */
    drawWall(ctx, posX, posY, gridX = 0, gridY = 0) {
        ctx.save();

        const p = this.tileSize; // 32
        const variant = Math.abs(gridX * 17 + gridY * 31) % 6;
        const time = Date.now() / 1000;

        // Base Metallic Wall Plate
        const wallGrad = ctx.createLinearGradient(posX, posY, posX, posY + p);
        wallGrad.addColorStop(0, '#2d3748');
        wallGrad.addColorStop(0.5, '#1a202c');
        wallGrad.addColorStop(1, '#0f172a');
        ctx.fillStyle = wallGrad;
        ctx.fillRect(posX, posY, p, p);

        // Bevel Frame & Seams
        ctx.strokeStyle = '#4a5568';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(posX + 1, posY + 1, p - 2, p - 2);

        ctx.strokeStyle = 'rgba(0, 240, 255, 0.3)';
        ctx.lineWidth = 1;
        ctx.strokeRect(posX + 3, posY + 3, p - 6, p - 6);

        // Corner Rivets
        ctx.fillStyle = '#a0aec0';
        ctx.fillRect(posX + 4, posY + 4, 2, 2);
        ctx.fillRect(posX + p - 6, posY + 4, 2, 2);
        ctx.fillRect(posX + 4, posY + p - 6, 2, 2);
        ctx.fillRect(posX + p - 6, posY + p - 6, 2, 2);

        // VARIANT SPECIFIC WALL FEATURES
        if (variant === 0) { // Armored Cross-Braced Panel
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.moveTo(posX + 6, posY + 6); ctx.lineTo(posX + p - 6, posY + p - 6);
            ctx.moveTo(posX + p - 6, posY + 6); ctx.lineTo(posX + 6, posY + p - 6);
            ctx.stroke();
        } else if (variant === 1) { // Status LED Light Bar Panel
            const pulse = Math.sin(time * 5 + gridX + gridY) * 0.5 + 0.5;

            // Cyan Light Strip
            ctx.fillStyle = '#00f0ff';
            ctx.shadowColor = '#00f0ff';
            ctx.shadowBlur = 6;
            ctx.fillRect(posX + 6, posY + 7, p - 12, 2);

            // Status LEDs (Red, Green, Cyan)
            ctx.fillStyle = '#ef4444'; ctx.shadowColor = '#ef4444';
            ctx.beginPath(); ctx.arc(posX + 8, posY + 16, 2, 0, Math.PI * 2); ctx.fill();

            ctx.fillStyle = `rgba(16, 185, 129, ${0.4 + pulse * 0.6})`; ctx.shadowColor = '#10b981';
            ctx.beginPath(); ctx.arc(posX + 16, posY + 16, 2, 0, Math.PI * 2); ctx.fill();

            ctx.fillStyle = '#38bdf8'; ctx.shadowColor = '#38bdf8';
            ctx.beginPath(); ctx.arc(posX + 24, posY + 16, 2, 0, Math.PI * 2); ctx.fill();

            ctx.shadowBlur = 0;
        } else if (variant === 2) { // Telemetry Monitor Screen Panel
            ctx.fillStyle = '#090d16';
            ctx.fillRect(posX + 7, posY + 7, p - 14, p - 14);
            ctx.strokeStyle = '#38bdf8';
            ctx.strokeRect(posX + 7, posY + 7, p - 14, p - 14);

            // Telemetry Waveform Line
            ctx.strokeStyle = '#00f0ff';
            ctx.shadowColor = '#00f0ff';
            ctx.shadowBlur = 4;
            ctx.lineWidth = 1;
            ctx.beginPath();
            const offset = (time * 15) % 8;
            ctx.moveTo(posX + 9, posY + 16);
            ctx.lineTo(posX + 13, posY + 12 - (offset > 4 ? 2 : 0));
            ctx.lineTo(posX + 18, posY + 20);
            ctx.lineTo(posX + 23, posY + 16);
            ctx.stroke();
            ctx.shadowBlur = 0;
        } else if (variant === 3) { // Power Conduit Pipes
            ctx.fillStyle = '#475569';
            ctx.fillRect(posX + 10, posY + 4, 4, p - 8);
            ctx.fillRect(posX + 18, posY + 4, 4, p - 8);

            ctx.fillStyle = '#94a3b8';
            ctx.fillRect(posX + 11, posY + 4, 1, p - 8);
            ctx.fillRect(posX + 19, posY + 4, 1, p - 8);

            // Glowing Cyan Energy Band Across Pipes
            ctx.fillStyle = '#00f0ff';
            ctx.shadowColor = '#00f0ff';
            ctx.shadowBlur = 8;
            ctx.fillRect(posX + 8, posY + 14, 16, 3);
            ctx.shadowBlur = 0;
        } else if (variant === 4) { // Thermal Exhaust Vent Slats
            ctx.fillStyle = '#0a0f1d';
            ctx.fillRect(posX + 7, posY + 7, p - 14, p - 14);

            ctx.fillStyle = '#475569';
            for (let i = 0; i < 4; i++) {
                ctx.fillRect(posX + 9, posY + 9 + i * 4, p - 18, 2);
            }
        } else { // Switchboard Control Buttons Panel
            ctx.fillStyle = '#090d16';
            ctx.fillRect(posX + 6, posY + 10, p - 12, 14);

            // Buttons matrix
            ctx.fillStyle = '#f59e0b'; ctx.fillRect(posX + 8, posY + 12, 4, 4);
            ctx.fillStyle = '#38bdf8'; ctx.fillRect(posX + 14, posY + 12, 4, 4);
            ctx.fillStyle = '#10b981'; ctx.fillRect(posX + 20, posY + 12, 4, 4);

            ctx.fillStyle = '#ef4444'; ctx.fillRect(posX + 8, posY + 18, 4, 4);
            ctx.fillStyle = '#00f0ff'; ctx.fillRect(posX + 14, posY + 18, 4, 4);
            ctx.fillStyle = '#a855f7'; ctx.fillRect(posX + 20, posY + 18, 4, 4);
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

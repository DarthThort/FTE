class ShipRenderer {
    constructor(gameEngine) {
        this.game = gameEngine;
        this.tileSize = 32;
        this.offsetX = 0;
        this.offsetY = 0;

        // Layout is now pulled from GameState

        // Fog of War State
        this.explored = []; // 2D array matching layout
        this.visible = [];  // 2D array matching layout
    }

    initFog(layout) {
        if (this.explored.length !== layout.length || (layout.length > 0 && this.explored[0].length !== layout[0].length)) {
            this.explored = Array(layout.length).fill().map(() => Array(layout[0].length).fill(false));
            this.visible = Array(layout.length).fill().map(() => Array(layout[0].length).fill(false));
        }
    }

    computeVisibility(player) {
        const ship = this.game.state.ship;
        if (!ship || !ship.layout) return;

        this.initFog(ship.layout);

        // Reset visibility for this frame
        this.visible = this.visible.map(row => row.map(() => false));

        const playerGridX = Math.floor((player.x + player.size / 2) / this.tileSize);
        const playerGridY = Math.floor((player.y + player.size / 2) / this.tileSize);
        const viewRadius = 8; // Tiles

        // Simple Raycasting to all tiles within radius
        for (let y = 0; y < ship.layout.length; y++) {
            for (let x = 0; x < ship.layout[0].length; x++) {
                const dist = Math.sqrt((x - playerGridX) ** 2 + (y - playerGridY) ** 2);

                if (dist <= viewRadius) {
                    if (this.hasLineOfSight(playerGridX, playerGridY, x, y, ship.layout)) {
                        this.visible[y][x] = true;
                        this.explored[y][x] = true;
                    }
                }
            }
        }
    }

    hasLineOfSight(x0, y0, x1, y1, layout) {
        // Bresenham's Line Algorithm / Raycast
        let dx = Math.abs(x1 - x0);
        let dy = Math.abs(y1 - y0);
        let sx = (x0 < x1) ? 1 : -1;
        let sy = (y0 < y1) ? 1 : -1;
        let err = dx - dy;

        let x = x0;
        let y = y0;

        while (true) {
            if (x === x1 && y === y1) return true; // Reached target

            // Check if current tile blocks sight (Wall = 1, Closed Door = 4)
            // We allow seeing *into* a wall, but not *through* it.
            if (layout[y][x] === 1 || layout[y][x] === 4) return false;

            let e2 = 2 * err;
            if (e2 > -dy) {
                err -= dy;
                x += sx;
            }
            if (e2 < dx) {
                err += dx;
                y += sy;
            }
        }
    }

    render(ctx) {
        const ship = this.game.state.ship;
        if (!ship || !ship.layout) {
            console.error("ShipRenderer: No ship layout found!", ship);
            return;
        }
        const layout = ship.layout;

        // Ensure fog arrays are initialized
        this.initFog(layout);

        // Center the ship
        const mapWidth = layout[0].length * this.tileSize;
        const mapHeight = layout.length * this.tileSize;
        this.offsetX = (ctx.canvas.width - mapWidth) / 2;
        this.offsetY = (ctx.canvas.height - mapHeight) / 2;

        ctx.save();
        ctx.translate(this.offsetX, this.offsetY);

        this.drawGrid(ctx, layout, ship.systems);
        this.drawFog(ctx, layout);

        ctx.restore();
    }

    drawGrid(ctx, layout, systems) {
        for (let y = 0; y < layout.length; y++) {
            for (let x = 0; x < layout[y].length; x++) {
                const tile = layout[y][x];
                const posX = x * this.tileSize;
                const posY = y * this.tileSize;

                if (tile === 0) continue; // Void

                // --- PROCEDURAL RENDERING ---

                // 1. Floor (Base for all non-void tiles)
                // Dark metallic floor with subtle grid
                ctx.fillStyle = '#0b1120'; // Very dark blue-grey
                ctx.fillRect(posX, posY, this.tileSize, this.tileSize);

                // Subtle grid lines
                ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
                ctx.lineWidth = 1;
                ctx.strokeRect(posX, posY, this.tileSize, this.tileSize);

                if (tile === 1) {
                    // WALL: 3D Block look with Neon Edge
                    // Top face
                    ctx.fillStyle = '#1e293b'; // Slate 800
                    ctx.fillRect(posX + 2, posY + 2, this.tileSize - 4, this.tileSize - 4);

                    // Neon Border effect
                    ctx.shadowColor = '#00f0ff';
                    ctx.shadowBlur = 10;
                    ctx.strokeStyle = '#00f0ff';
                    ctx.lineWidth = 1.5;
                    ctx.strokeRect(posX + 4, posY + 4, this.tileSize - 8, this.tileSize - 8);
                    ctx.shadowBlur = 0; // Reset

                } else if (tile === 3) {
                    // SLOT: Tech Crosshair
                    ctx.strokeStyle = '#334155';
                    ctx.lineWidth = 2;
                    ctx.strokeRect(posX + 4, posY + 4, this.tileSize - 8, this.tileSize - 8);

                    // Corner accents
                    ctx.fillStyle = '#64748b';
                    const s = 4;
                    ctx.fillRect(posX + 4, posY + 4, s, s);
                    ctx.fillRect(posX + this.tileSize - 4 - s, posY + 4, s, s);
                    ctx.fillRect(posX + 4, posY + this.tileSize - 4 - s, s, s);
                    ctx.fillRect(posX + this.tileSize - 4 - s, posY + this.tileSize - 4 - s, s, s);

                } else if (tile === 4) {
                    // DOOR (CLOSED): Hazard Stripes
                    ctx.fillStyle = '#1e293b';
                    ctx.fillRect(posX, posY, this.tileSize, this.tileSize);

                    // Stripes
                    ctx.save();
                    ctx.beginPath();
                    ctx.rect(posX + 2, posY + 2, this.tileSize - 4, this.tileSize - 4);
                    ctx.clip();

                    ctx.fillStyle = '#d97706'; // Amber 600
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

                    // Frame
                    ctx.strokeStyle = '#d97706';
                    ctx.lineWidth = 2;
                    ctx.strokeRect(posX + 2, posY + 2, this.tileSize - 4, this.tileSize - 4);

                } else if (tile === 5) {
                    // DOOR (OPEN): Recessed Frame
                    ctx.fillStyle = '#0f172a';
                    ctx.fillRect(posX, posY, this.tileSize, this.tileSize);

                    // Side Panels
                    ctx.fillStyle = '#059669'; // Emerald 600
                    ctx.fillRect(posX, posY, 6, this.tileSize);
                    ctx.fillRect(posX + this.tileSize - 6, posY, 6, this.tileSize);

                    // Light strip
                    ctx.fillStyle = '#34d399'; // Emerald 400
                    ctx.fillRect(posX + 2, posY + this.tileSize / 2 - 2, 2, 4);
                    ctx.fillRect(posX + this.tileSize - 4, posY + this.tileSize / 2 - 2, 2, 4);
                }
            }
        }

        // Draw Systems (Holographic Look)
        for (const sys of systems) {
            const posX = sys.x * this.tileSize;
            const posY = sys.y * this.tileSize;

            // Base Glow
            ctx.shadowColor = sys.color;
            ctx.shadowBlur = 15;
            ctx.fillStyle = sys.color;
            ctx.globalAlpha = 0.2;
            ctx.fillRect(posX + 2, posY + 2, this.tileSize - 4, this.tileSize - 4);
            ctx.globalAlpha = 1.0;
            ctx.shadowBlur = 0;

            // Tech Borders
            ctx.strokeStyle = sys.color;
            ctx.lineWidth = 2;
            ctx.strokeRect(posX + 4, posY + 4, this.tileSize - 8, this.tileSize - 8);

            // Label
            ctx.fillStyle = '#fff';
            ctx.font = 'bold 10px "Courier New", monospace';
            ctx.textAlign = 'center';
            ctx.fillText(sys.id.substring(0, 3).toUpperCase(), posX + this.tileSize / 2, posY + this.tileSize / 2 + 4);
        }
    }

    drawFog(ctx, layout) {
        for (let y = 0; y < layout.length; y++) {
            for (let x = 0; x < layout[0].length; x++) {
                const posX = x * this.tileSize;
                const posY = y * this.tileSize;

                if (!this.explored[y][x]) {
                    // Unexplored: Pitch Black
                    ctx.fillStyle = '#000000';
                    ctx.fillRect(posX, posY, this.tileSize, this.tileSize);
                } else if (!this.visible[y][x]) {
                    // Explored but not visible: Dimmed (Shroud)
                    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
                    ctx.fillRect(posX, posY, this.tileSize, this.tileSize);
                }
            }
        }
    }
}

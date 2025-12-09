/**
 * OxygenBarsRenderer.js
 * Handles rendering of oxygen level indicators for ship rooms
 * Extracted from ShipRenderer.js
 */

class OxygenBarsRenderer {
    constructor(tileSize) {
        this.tileSize = tileSize;
    }

    /**
     * Render oxygen level indicators for each room
     * Shows compact horizontal bars at room centers using HazardManager data
     */
    render(ctx, ship, hazardManager) {
        // Use HazardManager data if available, otherwise fall back to old system
        if (hazardManager && hazardManager.rooms.length > 0) {
            // Use new HazardManager room data
            for (const room of hazardManager.rooms) {
                if (!room.tiles || room.tiles.length === 0) continue;

                // Calculate room center from tiles
                let sumX = 0, sumY = 0;
                for (const tile of room.tiles) {
                    sumX += tile.x;
                    sumY += tile.y;
                }
                const centerX = (sumX / room.tiles.length) * this.tileSize + this.tileSize / 2;
                const centerY = (sumY / room.tiles.length) * this.tileSize + this.tileSize / 2;

                const roomOxygen = hazardManager.roomOxygen[room.id];
                if (!roomOxygen) continue;

                const oxygenLevel = roomOxygen.level;

                // Calculate oxygen color based on level
                let color;
                if (oxygenLevel >= 75) {
                    color = '#00ff00'; // Green
                } else if (oxygenLevel >= 50) {
                    color = '#90ff00'; // Yellow-green
                } else if (oxygenLevel >= 25) {
                    color = '#ffff00'; // Yellow
                } else if (oxygenLevel >= 10) {
                    color = '#ff8800'; // Orange
                } else {
                    color = '#ff0000'; // Red
                }

                // Bar dimensions
                const maxWidth = 20;
                const barHeight = 3;
                const width = (oxygenLevel / 100) * maxWidth;

                // Draw bar background (dark)
                ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
                ctx.fillRect(
                    centerX - maxWidth / 2,
                    centerY - barHeight / 2 - 8,
                    maxWidth,
                    barHeight
                );

                // Draw oxygen bar
                ctx.fillStyle = color;
                ctx.shadowColor = color;
                ctx.shadowBlur = 4;
                ctx.fillRect(
                    centerX - maxWidth / 2,
                    centerY - barHeight / 2 - 8,
                    width,
                    barHeight
                );
                ctx.shadowBlur = 0;

                // Optional: Add warning icon for critical oxygen
                if (oxygenLevel < 25) {
                    ctx.fillStyle = color;
                    ctx.font = '10px monospace';
                    ctx.textAlign = 'center';
                    ctx.fillText('!', centerX, centerY + 6);
                }
            }
        } else if (ship.rooms && ship.rooms.length > 0) {
            // Fallback to old system
            ship.rooms.forEach(room => {
                // Safety check: ensure room has center
                if (!room.center || typeof room.center.x === 'undefined' || typeof room.center.y === 'undefined') {
                    console.warn('Room missing center coordinates:', room);
                    return;
                }

                const centerX = room.center.x * this.tileSize;
                const centerY = room.center.y * this.tileSize;

                // Calculate oxygen color based on level
                let color;
                if (room.oxygen >= 75) {
                    color = '#00ff00'; // Green
                } else if (room.oxygen >= 50) {
                    color = '#90ff00'; // Yellow-green
                } else if (room.oxygen >= 25) {
                    color = '#ffff00'; // Yellow
                } else if (room.oxygen >= 10) {
                    color = '#ff8800'; // Orange
                } else {
                    color = '#ff0000'; // Red
                }

                // Bar dimensions
                const maxWidth = 20;
                const barHeight = 3;
                const width = (room.oxygen / 100) * maxWidth;

                // Draw bar background (dark)
                ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
                ctx.fillRect(
                    centerX - maxWidth / 2,
                    centerY - barHeight / 2 - 8,
                    maxWidth,
                    barHeight
                );

                // Draw oxygen bar
                ctx.fillStyle = color;
                ctx.shadowColor = color;
                ctx.shadowBlur = 4;
                ctx.fillRect(
                    centerX - maxWidth / 2,
                    centerY - barHeight / 2 - 8,
                    width,
                    barHeight
                );
                ctx.shadowBlur = 0;

                // Optional: Add warning icon for critical oxygen
                if (room.oxygen < 25) {
                    ctx.fillStyle = color;
                    ctx.font = '10px monospace';
                    ctx.textAlign = 'center';
                    ctx.fillText('!', centerX, centerY + 6);
                }
            });
        }
    }
}

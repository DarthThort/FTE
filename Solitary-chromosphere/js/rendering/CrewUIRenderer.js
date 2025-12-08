/**
 * CrewUIRenderer.js
 * Handles rendering of crew members, UI overlays, and fog of war
 * Extracted from ShipRenderer.js to reduce file size
 */

class CrewUIRenderer {
    constructor(gameEngine) {
        this.game = gameEngine;
        this.tileSize = 32;
    }

    /**
     * Draw all crew members on the ship
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     * @param {Object} ship - Ship object with crew array
     * @param {Array} visible - Visibility grid for fog of war
     */
    drawCrew(ctx, ship, visible) {
        if (!ship.crew || ship.crew.length === 0) return;

        for (const crewMember of ship.crew) {
            const posX = crewMember.x || 0;
            const posY = crewMember.y || 0;
            const radius = 8;

            // Draw crew circle with role color
            ctx.save();
            ctx.shadowColor = this.getCrewColor(crewMember.role);
            ctx.shadowBlur = 12;
            ctx.fillStyle = this.getCrewColor(crewMember.role);
            ctx.beginPath();
            ctx.arc(posX, posY, radius, 0, Math.PI * 2);
            ctx.fill();

            // Inner white ring
            ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
            ctx.beginPath();
            ctx.arc(posX, posY, radius - 3, 0, Math.PI * 2);
            ctx.fill();

            // Inner color dot
            ctx.fillStyle = this.getCrewColor(crewMember.role);
            ctx.beginPath();
            ctx.arc(posX, posY, radius - 5, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();

            // Draw name and UI only if tile is visible
            const gridX = Math.floor(posX / this.tileSize);
            const gridY = Math.floor(posY / this.tileSize);
            if (visible && visible[gridY] && visible[gridY][gridX]) {
                // Crew name
                ctx.fillStyle = '#fff';
                ctx.font = '9px "Courier New", monospace';
                ctx.textAlign = 'center';
                ctx.fillText(crewMember.name.split(' ')[0], posX, posY - radius - 4);

                // REPAIRING indicator + progress bar
                if (crewMember.state === 'repairing' && crewMember.repairProgress !== undefined) {
                    this.drawRepairIndicator(ctx, posX, posY, radius, crewMember.repairProgress);
                }
            }
        }
    }

    /**
     * Draw repair indicator for crew member
     */
    drawRepairIndicator(ctx, posX, posY, radius, progress) {
        // "REPAIRING" text
        ctx.fillStyle = '#00ff00';
        ctx.font = 'bold 10px "Rajdhani", sans-serif';
        ctx.fillText('REPAIRING', posX, posY - radius - 18);

        // Progress bar
        const barWidth = 40;
        const barHeight = 4;
        const barX = posX - barWidth / 2;
        const barY = posY - radius - 30;

        // Background
        ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        ctx.fillRect(barX, barY, barWidth, barHeight);

        // Progress fill
        ctx.fillStyle = '#00ff00';
        ctx.fillRect(barX, barY, barWidth * progress, barHeight);

        // Border
        ctx.strokeStyle = '#00f0ff';
        ctx.lineWidth = 1;
        ctx.strokeRect(barX, barY, barWidth, barHeight);
    }

    /**
     * Get color for crew role
     */
    getCrewColor(role) {
        const colors = {
            'Engineer': '#fbbf24',
            'Pilot': '#60a5fa',
            'Gunner': '#ef4444',
            'Medic': '#34d399'
        };
        return colors[role] || '#9ca3af';
    }

    /**
     * Draw fog of war over non-visible tiles
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     * @param {Array} layout - Ship layout array
     * @param {Array} visible - Visibility grid
     */
    drawFog(ctx, layout, visible) {
        for (let y = 0; y < layout.length; y++) {
            for (let x = 0; x < layout[0].length; x++) {
                const posX = x * this.tileSize;
                const posY = y * this.tileSize;

                // Skip tile 0 (outer space) - let starfield show through
                if (layout[y][x] === 0) {
                    continue;
                }

                // Only draw shadow for non-visible tiles
                if (!visible[y][x]) {
                    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
                    ctx.fillRect(posX, posY, this.tileSize, this.tileSize);
                }
            }
        }
    }
}

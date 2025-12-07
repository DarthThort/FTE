/**
 * HazardUIRenderer.js
 * Handles all visual rendering for hazard UI: prompts, progress bars, oxygen HUD
 */

class HazardUIRenderer {
    constructor(gameState) {
        this.state = gameState;
    }

    /**
     * Render "Press E/R" prompt near breach
     */
    renderRepairPrompt(ctx, breach, shipRenderer) {
        const posX = breach.x * shipRenderer.tileSize + shipRenderer.offsetX;
        const posY = breach.y * shipRenderer.tileSize + shipRenderer.offsetY - 40;

        ctx.save();

        // Background
        ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        ctx.fillRect(posX - 80, posY - 25, 160, 45);

        // Border
        ctx.strokeStyle = '#ff8800';
        ctx.lineWidth = 2;
        ctx.strokeRect(posX - 80, posY - 25, 160, 45);

        // Text
        ctx.fillStyle = '#fff';
        ctx.font = '12px "Rajdhani", sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('Press E to Repair', posX, posY - 5);
        ctx.fillText('Press R to Assign Crew', posX, posY + 10);

        // Severity indicator
        const severity = breach.severity;
        ctx.fillStyle = '#ff5555';
        for (let i = 0; i < severity; i++) {
            ctx.beginPath();
            ctx.arc(posX - 20 + i * 15, posY + 25, 4, 0, Math.PI * 2);
            ctx.fill();
        }

        ctx.restore();
    }

    /**
     * Render player repair progress bar
     */
    renderPlayerRepairProgress(ctx, breach, progress, shipRenderer) {
        const posX = breach.x * shipRenderer.tileSize + shipRenderer.offsetX;
        const posY = breach.y * shipRenderer.tileSize + shipRenderer.offsetY - 50;

        ctx.save();

        // Background
        ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        ctx.fillRect(posX - 60, posY - 15, 120, 25);

        // Progress bar background
        ctx.fillStyle = '#333';
        ctx.fillRect(posX - 55, posY - 5, 110, 10);

        // Progress bar fill
        ctx.fillStyle = '#00ff88';
        ctx.fillRect(posX - 55, posY - 5, 110 * progress, 10);

        // Progress text
        ctx.fillStyle = '#fff';
        ctx.font = '10px "Rajdhani", sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(`Repairing... ${Math.floor(progress * 100)}%`, posX, posY + 15);

        ctx.restore();
    }

    /**
     * Render crew repair progress (for future use when crew repair visuals are needed)
     */
    renderCrewRepairProgress(ctx, crewMember, breach, shipRenderer) {
        if (!crewMember.repairProgress) return;

        const posX = breach.x * shipRenderer.tileSize + shipRenderer.offsetX;
        const posY = breach.y * shipRenderer.tileSize + shipRenderer.offsetY - 70;

        const progress = crewMember.repairProgress;

        ctx.save();

        // Background
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(posX - 60, posY - 15, 120, 25);

        // Progress bar background
        ctx.fillStyle = '#333';
        ctx.fillRect(posX - 55, posY - 5, 110, 10);

        // Progress bar fill (blue for crew)
        ctx.fillStyle = '#00c8ff';
        ctx.fillRect(posX - 55, posY - 5, 110 * progress, 10);

        // Progress text with crew name
        ctx.fillStyle = '#fff';
        ctx.font = '9px "Rajdhani", sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(`${crewMember.name}: ${Math.floor(progress * 100)}%`, posX, posY + 15);

        ctx.restore();
    }

    /**
     * Render oxygen level in HUD
     */
    renderOxygenHUD(ctx, player) {
        if (!player) return;

        const gridX = Math.floor(player.x / 32);
        const gridY = Math.floor(player.y / 32);

        const oxygenLevel = this.state.hazardManager.getOxygenAt(gridX, gridY);

        // Position in top-left HUD
        const posX = 20;
        const posY = 120;

        ctx.save();

        // Background
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(posX, posY, 120, 30);

        // Border
        ctx.strokeStyle = '#444';
        ctx.lineWidth = 1;
        ctx.strokeRect(posX, posY, 120, 30);

        // Oxygen level color
        let color;
        if (oxygenLevel >= 70) color = '#00ff00';
        else if (oxygenLevel >= 30) color = '#ffff00';
        else color = '#ff0000';

        // Label
        ctx.fillStyle = '#aaa';
        ctx.font = '12px "Rajdhani", sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText('O₂:', posX + 10, posY + 20);

        // Level
        ctx.fillStyle = color;
        ctx.font = 'bold 14px "Rajdhani", sans-serif';
        ctx.fillText(`${Math.round(oxygenLevel)}%`, posX + 45, posY + 20);

        // Bar
        ctx.fillStyle = '#333';
        ctx.fillRect(posX + 90, posY + 10, 20, 15);
        ctx.fillStyle = color;
        ctx.fillRect(posX + 90, posY + 10, 20 * (oxygenLevel / 100), 15);

        ctx.restore();
    }
}

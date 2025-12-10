/**
 * HazardUI.js (Simplified)
 * Handles player repair mechanics and proximity detection
 * Crew assignment now uses HTML-based CrewRepairUI
 */

class HazardUI {
    constructor(gameState) {
        this.state = gameState;

        // Core state
        this.nearestBreach = null;
        this.playerRepairing = false;
        this.currentRepairBreach = null;
        this.repairProgress = 0;
    }

    /**
     * Update - check proximity and handle player repair
     */
    update(deltaTime, player) {
        if (!player) return;

        this.checkPlayerProximity(player);

        // Update player repair progress
        if (this.playerRepairing && this.currentRepairBreach !== null) {
            const breach = this.state.hazardManager.breaches[this.currentRepairBreach];

            if (!breach) {
                // Breach was repaired or removed
                this.stopPlayerRepair();
                return;
            }

            // Check if player moved too far
            const dist = Math.sqrt(
                Math.pow(player.x / 32 - breach.x, 2) +
                Math.pow(player.y / 32 - breach.y, 2)
            );

            if (dist > 1.5) {
                // Player moved away, cancel repair
                this.stopPlayerRepair();
                return;
            }

            // Continue repair
            const playerSkill = player.engineeringSkill || 0;
            this.repairProgress += deltaTime;

            const repairTime = Math.max(2, 10 - playerSkill);

            if (this.repairProgress >= repairTime) {
                // Repair complete!
                this.state.hazardManager.removeBreach(this.currentRepairBreach);
                this.stopPlayerRepair();
                console.log('[HazardUI] Player completed breach repair');
            }
        }
    }

    /**
     * Check if player is near any breach
     */
    checkPlayerProximity(player) {
        if (!player) return;

        const breaches = this.state.hazardManager.breaches;

        let nearest = null;
        let minDist = 1.5; // Max interaction distance

        for (let i = 0; i < breaches.length; i++) {
            const breach = breaches[i];
            const dist = Math.sqrt(
                Math.pow(player.x / 32 - breach.x, 2) +
                Math.pow(player.y / 32 - breach.y, 2)
            );

            if (dist < minDist) {
                minDist = dist;
                nearest = { breach, index: i, distance: dist };
            }
        }

        this.nearestBreach = nearest;
    }

    /**
     * Start player repair
     */
    startPlayerRepair() {
        if (!this.nearestBreach || this.playerRepairing) return false;

        this.playerRepairing = true;
        this.currentRepairBreach = this.nearestBreach.index;
        this.repairProgress = 0;
        console.log('[HazardUI] Player started repairing breach');
        return true;
    }

    /**
     * Stop player repair
     */
    stopPlayerRepair() {
        this.playerRepairing = false;
        this.currentRepairBreach = null;
        this.repairProgress = 0;
    }

    /**
     * Render UI elements (repair prompts on canvas)
     */
    render(ctx, shipRenderer, player) {
        // Render fire alert banner if there are active fires
        if (this.state.hazardManager && this.state.hazardManager.fires.length > 0) {
            this.renderFireAlert(ctx);
        }

        // Render "Press E to Repair" prompt if near breach
        if (this.nearestBreach && !this.playerRepairing) {
            this.renderRepairPrompt(ctx, this.nearestBreach.breach, shipRenderer);
        }

        // Render player repair progress bar
        if (this.playerRepairing && this.currentRepairBreach !== null) {
            const breach = this.state.hazardManager.breaches[this.currentRepairBreach];
            if (breach) {
                this.renderRepairProgress(ctx, breach, player, shipRenderer);
            }
        }

        // Render oxygen HUD
        this.renderOxygenHUD(ctx, player);
    }

    /**
     * Render fire alert banner
     */
    renderFireAlert(ctx) {
        const fireCount = this.state.hazardManager.fires.length;
        const time = Date.now() / 1000;

        ctx.save();

        // Pulsing effect
        const pulse = 0.7 + Math.sin(time * 3) * 0.3;

        // Banner background
        const bannerWidth = 300;
        const bannerHeight = 50;
        const x = (ctx.canvas.width - bannerWidth) / 2;
        const y = 80;

        ctx.fillStyle = `rgba(255, 100, 0, ${pulse * 0.9})`;
        ctx.fillRect(x, y, bannerWidth, bannerHeight);

        // Border
        ctx.strokeStyle = `rgba(255, 200, 0, ${pulse})`;
        ctx.lineWidth = 3;
        ctx.strokeRect(x, y, bannerWidth, bannerHeight);

        // Text
        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 20px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('🔥 FIRE DETECTED 🔥', x + bannerWidth / 2, y + bannerHeight / 2 - 5);

        // Fire count
        ctx.font = '14px Arial';
        ctx.fillText(`${fireCount} tile${fireCount > 1 ? 's' : ''} burning`, x + bannerWidth / 2, y + bannerHeight / 2 + 12);

        ctx.restore();
    }

    /**
     * Render repair prompt near breach
     */
    renderRepairPrompt(ctx, breach, shipRenderer) {
        // Calculate screen position manually
        const screenPos = {
            x: breach.x * shipRenderer.tileSize + shipRenderer.tileSize / 2,
            y: breach.y * shipRenderer.tileSize + shipRenderer.tileSize / 2
        };

        ctx.save();
        ctx.font = 'bold 14px "Rajdhani", sans-serif';
        ctx.textAlign = 'center';

        // Background
        ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        const text = 'Press E to Repair';
        const textWidth = ctx.measureText(text).width;
        ctx.fillRect(screenPos.x - textWidth / 2 - 10, screenPos.y - 50, textWidth + 20, 25);

        // Border
        ctx.strokeStyle = '#00f0ff';
        ctx.strokeRect(screenPos.x - textWidth / 2 - 10, screenPos.y - 50, textWidth + 20, 25);

        // Text
        ctx.fillStyle = '#00f0ff';
        ctx.fillText(text, screenPos.x, screenPos.y - 33);
        ctx.restore();
    }

    /**
     * Render player repair progress bar
     */
    renderPlayerRepairProgress(ctx, breach, progress, shipRenderer) {
        // Calculate screen position manually
        const screenPos = {
            x: breach.x * shipRenderer.tileSize + shipRenderer.tileSize / 2,
            y: breach.y * shipRenderer.tileSize + shipRenderer.tileSize / 2
        };

        ctx.save();
        const barWidth = 100;
        const barHeight = 10;
        const x = screenPos.x - barWidth / 2;
        const y = screenPos.y - 60;

        // Background
        ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        ctx.fillRect(x, y, barWidth, barHeight);

        // Progress
        ctx.fillStyle = '#00ff00';
        ctx.fillRect(x, y, barWidth * progress, barHeight);

        // Border
        ctx.strokeStyle = '#00f0ff';
        ctx.strokeRect(x, y, barWidth, barHeight);

        // Text
        ctx.font = 'bold 12px "Rajdhani", sans-serif';
        ctx.textAlign = 'center';
        ctx.fillStyle = '#fff';
        ctx.fillText(`Repairing... ${Math.floor(progress * 100)}%`, screenPos.x, y - 5);
        ctx.restore();
    }

    /**
     * Render oxygen level HUD
     */
    renderOxygenHUD(ctx, player) {
        if (!player || player.oxygenLevel === undefined) return;

        const x = 20;
        const y = ctx.canvas.height - 100;
        const barWidth = 200;
        const barHeight = 30;

        ctx.save();

        // Title
        ctx.font = 'bold 14px "Rajdhani", sans-serif';
        ctx.fillStyle = '#00f0ff';
        ctx.textAlign = 'left';
        ctx.fillText('OXYGEN', x, y - 10);

        // Background
        ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        ctx.fillRect(x, y, barWidth, barHeight);

        // Oxygen bar
        const oxygenPercent = player.oxygenLevel / 100;
        const oxygenColor = oxygenPercent > 0.5 ? '#00ff00' : oxygenPercent > 0.25 ? '#ffaa00' : '#ff0000';
        ctx.fillStyle = oxygenColor;
        ctx.fillRect(x, y, barWidth * oxygenPercent, barHeight);

        // Border
        ctx.strokeStyle = '#00f0ff';
        ctx.lineWidth = 2;
        ctx.strokeRect(x, y, barWidth, barHeight);

        // Text
        ctx.font = 'bold 16px "Rajdhani", sans-serif';
        ctx.textAlign = 'center';
        ctx.fillStyle = '#fff';
        ctx.fillText(`${Math.floor(player.oxygenLevel)}%`, x + barWidth / 2, y + 20);

        ctx.restore();
    }

    /**
     * Get nearest breach (for external use)
     */
    getNearestBreach() {
        return this.nearestBreach;
    }

    /**
     * Check if player is currently repairing
     */
    isPlayerRepairing() {
        return this.playerRepairing;
    }
}

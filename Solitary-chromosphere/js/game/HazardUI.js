/**
 * HazardUI.js (Simplified)
 * Handles player repair mechanics and proximity detection
 * Crew assignment now uses HTML-based CrewRepairUI
 */

class HazardUI {
    constructor(gameState) {
        this.state = gameState;

        // Breach repair state
        this.nearestBreach = null;
        this.playerRepairing = false;
        this.currentRepairBreach = null;
        this.repairProgress = 0;

        // Fire fighting state
        this.nearestFire = null;
        this.playerFightingFire = false;
        this.currentFire = null;
        this.fireFightProgress = 0;
    }

    /**
     * Update - check proximity and handle player actions
     */
    update(deltaTime, player) {
        if (!player) return;

        this.checkPlayerProximity(player);

        // Update player breach repair progress
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

        // Update player fire fighting progress
        if (this.playerFightingFire && this.currentFire !== null) {
            const fire = this.state.hazardManager.getFireAt(this.currentFire.x, this.currentFire.y);

            if (!fire) {
                // Fire was extinguished
                this.stopPlayerFireFighting();
                return;
            }

            // Check if player moved too far
            const dist = Math.sqrt(
                Math.pow(player.x / 32 - fire.x, 2) +
                Math.pow(player.y / 32 - fire.y, 2)
            );

            if (dist > 1.5) {
                // Player moved away, cancel fire fighting
                this.stopPlayerFireFighting();
                return;
            }

            // Continue fighting fire
            const playerSkill = player.engineeringSkill || 0;
            this.fireFightProgress += deltaTime;

            const fightTime = Math.max(3, 5 - playerSkill); // 3-5 seconds

            // Reduce fire intensity while fighting
            fire.intensity = Math.max(0, fire.intensity - (20 * deltaTime)); // 20% per second

            if (fire.intensity <= 0 || this.fireFightProgress >= fightTime) {
                // Fire extinguished!
                this.state.hazardManager.extinguishFireAt(fire.x, fire.y);
                this.stopPlayerFireFighting();
                console.log('[HazardUI] Player extinguished fire');
            }
        }
    }

    /**
     * Check if player is near any breach or fire
     */
    checkPlayerProximity(player) {
        const playerGridX = Math.floor((player.x + player.size / 2) / 32);
        const playerGridY = Math.floor((player.y + player.size / 2) / 32);

        // Check for nearest breach
        let nearestBreach = null;
        let minBreachDist = Infinity;

        for (let i = 0; i < this.state.hazardManager.breaches.length; i++) {
            const breach = this.state.hazardManager.breaches[i];
            const dist = Math.sqrt(
                Math.pow(breach.x - playerGridX, 2) +
                Math.pow(breach.y - playerGridY, 2)
            );

            if (dist < minBreachDist && dist <= 1.5) {
                minBreachDist = dist;
                nearestBreach = { breach, index: i };
            }
        }

        this.nearestBreach = nearestBreach;

        // Check for nearest fire (only if not already repairing)
        if (!this.playerRepairing) {
            let nearestFire = null;
            let minFireDist = Infinity;

            for (const fire of this.state.hazardManager.fires) {
                const dist = Math.sqrt(
                    Math.pow(fire.x - playerGridX, 2) +
                    Math.pow(fire.y - playerGridY, 2)
                );

                if (dist < minFireDist && dist <= 1.5) {
                    minFireDist = dist;
                    nearestFire = fire;
                }
            }

            this.nearestFire = nearestFire;
        } else {
            this.nearestFire = null;
        }
    }

    /**
     * Attempt to start repair or fire fighting (E key)
     */
    attemptRepair() {
        // Priority: breach repair > fire fighting
        if (this.nearestBreach && !this.playerRepairing && !this.playerFightingFire) {
            this.playerRepairing = true;
            this.currentRepairBreach = this.nearestBreach.index;
            this.repairProgress = 0;
            console.log('[HazardUI] Started breach repair');
            return true;
        }

        // Fight fire if near one
        if (this.nearestFire && !this.playerRepairing && !this.playerFightingFire) {
            this.playerFightingFire = true;
            this.currentFire = this.nearestFire;
            this.fireFightProgress = 0;
            console.log('[HazardUI] Started fighting fire');
            return true;
        }

        return false;
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
     * Stop player fire fighting
     */
    stopPlayerFireFighting() {
        this.playerFightingFire = false;
        this.currentFire = null;
        this.fireFightProgress = 0;
    }

    /**
     * Render UI elements (repair prompts on canvas)
     */
    render(ctx, shipRenderer, player) {
        // Render fire alert banner if there are active fires
        if (this.state.hazardManager && this.state.hazardManager.fires.length > 0) {
            this.renderFireAlert(ctx);
        }

        // Render "Press E to Repair" prompt if near breach (and not fighting fire)
        if (this.nearestBreach && !this.playerRepairing && !this.playerFightingFire) {
            this.renderRepairPrompt(ctx, this.nearestBreach.breach, shipRenderer);
        }

        // Render "Press E to Fight Fire" prompt if near fire (and not repairing)
        if (this.nearestFire && !this.playerFightingFire && !this.playerRepairing) {
            this.renderFirePrompt(ctx, this.nearestFire, shipRenderer);
        }

        // Render player repair progress bar
        if (this.playerRepairing && this.currentRepairBreach !== null) {
            const breach = this.state.hazardManager.breaches[this.currentRepairBreach];
            if (breach) {
                this.renderRepairProgress(ctx, breach, player, shipRenderer);
            }
        }

        // Render player fire fighting progress bar
        if (this.playerFightingFire && this.currentFire) {
            this.renderFireFightProgress(ctx, this.currentFire, player, shipRenderer);
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

    /**
     * Render "Press E to Fight Fire" prompt
     */
    renderFirePrompt(ctx, fire, shipRenderer) {
        const screenPos = {
            x: fire.x * shipRenderer.tileSize + shipRenderer.tileSize / 2,
            y: fire.y * shipRenderer.tileSize + shipRenderer.tileSize / 2
        };

        ctx.save();
        ctx.fillStyle = 'rgba(255, 100, 0, 0.9)';
        ctx.strokeStyle = '#ff6600';
        ctx.lineWidth = 2;
        ctx.font = 'bold 12px Arial';
        ctx.textAlign = 'center';

        const text = 'Press E to Fight Fire';
        const metrics = ctx.measureText(text);
        const padding = 6;
        const boxWidth = metrics.width + padding * 2;
        const boxHeight = 20;
        const boxX = screenPos.x - boxWidth / 2;
        const boxY = screenPos.y - 40;

        ctx.fillRect(boxX, boxY, boxWidth, boxHeight);
        ctx.strokeRect(boxX, boxY, boxWidth, boxHeight);

        ctx.fillStyle = '#ffffff';
        ctx.fillText(text, screenPos.x, screenPos.y - 27);

        // Fire extinguisher icon
        ctx.fillStyle = '#ffffff';
        ctx.font = '16px Arial';
        ctx.fillText('🧯', screenPos.x, screenPos.y - 50);

        ctx.restore();
    }

    /**
     * Render fire fighting progress bar
     */
    renderFireFightProgress(ctx, fire, player, shipRenderer) {
        const screenPos = {
            x: fire.x * shipRenderer.tileSize + shipRenderer.tileSize / 2,
            y: fire.y * shipRenderer.tileSize + shipRenderer.tileSize / 2
        };

        const playerSkill = player.engineeringSkill || 0;
        const fightTime = Math.max(3, 5 - playerSkill);
        const progress = Math.min(1, this.fireFightProgress / fightTime);

        ctx.save();

        // Progress bar background
        const barWidth = 50;
        const barHeight = 8;
        const barX = screenPos.x - barWidth / 2;
        const barY = screenPos.y - 30;

        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(barX, barY, barWidth, barHeight);

        // Progress fill (orange/red gradient)
        const gradient = ctx.createLinearGradient(barX, 0, barX + barWidth * progress, 0);
        gradient.addColorStop(0, '#ff9933');
        gradient.addColorStop(1, '#ff3300');
        ctx.fillStyle = gradient;
        ctx.fillRect(barX, barY, barWidth * progress, barHeight);

        // Border
        ctx.strokeStyle = '#ff6600';
        ctx.lineWidth = 2;
        ctx.strokeRect(barX, barY, barWidth, barHeight);

        // Text
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 10px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Fighting Fire...', screenPos.x, barY - 5);

        // Fire intensity indicator
        ctx.font = '9px Arial';
        ctx.fillStyle = '#ffaa00';
        const intensityText = ` ${Math.round(fire.intensity)}%`;
        ctx.fillText(intensityText, screenPos.x, barY + barHeight + 12);

        ctx.restore();
    }
}

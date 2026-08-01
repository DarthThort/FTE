/**
 * HazardUI.js
 * Handles Hazard UI overlays, repair prompts, oxygen HUD, and progress bars.
 */

class HazardUI {
    constructor(gameState) {
        this.state = gameState;
        this.playerRepairing = false;
        this.currentRepairBreach = null;
        this.repairProgress = 0;

        this.playerFightingFire = false;
        this.currentFire = null;
        this.fireFightProgress = 0;

        this.nearestBreach = null;
        this.nearestFire = null;
    }

    update(dt, player) {
        if (!player || !this.state.hazardManager) return;

        const playerTile = {
            x: Math.floor(player.x / 32),
            y: Math.floor(player.y / 32)
        };

        // Check nearest breach
        this.nearestBreach = this.findNearestBreach(playerTile);
        // Check nearest fire
        this.nearestFire = this.findNearestFire(playerTile);

        // Handle repair action (Hold E near breach)
        if (this.nearestBreach && this.nearestBreach.distance <= 1.5) {
            if (player.input && player.input.isDown('KeyE')) {
                this.startPlayerRepair(this.nearestBreach.index, player, dt);
            } else {
                this.stopPlayerRepair();
            }
        } else {
            this.stopPlayerRepair();
        }

        // Handle fire fighting action (Hold E near fire)
        if (this.nearestFire && this.nearestFire.distance <= 1.5 && !this.playerRepairing) {
            if (player.input && player.input.isDown('KeyE')) {
                this.startPlayerFireFighting(this.nearestFire, player, dt);
            } else {
                this.stopPlayerFireFighting();
            }
        } else {
            this.stopPlayerFireFighting();
        }
    }

    findNearestBreach(playerTile) {
        const breaches = this.state.hazardManager.breaches || [];
        let nearest = null;
        let minDistance = Infinity;

        breaches.forEach((breach, index) => {
            const dx = breach.x - playerTile.x;
            const dy = breach.y - playerTile.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < minDistance) {
                minDistance = dist;
                nearest = { breach, index, distance: dist };
            }
        });

        return nearest;
    }

    findNearestFire(playerTile) {
        const fires = this.state.hazardManager.fires || [];
        let nearest = null;
        let minDistance = Infinity;

        fires.forEach((fire) => {
            const dx = fire.x - playerTile.x;
            const dy = fire.y - playerTile.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < minDistance) {
                minDistance = dist;
                nearest = fire;
                nearest.distance = dist;
            }
        });

        return nearest;
    }

    startPlayerRepair(breachIndex, player, dt) {
        this.playerRepairing = true;
        this.currentRepairBreach = breachIndex;

        const playerSkill = player.engineeringSkill || 0;
        const repairSpeed = (1.0 + playerSkill * 0.2) * dt;

        this.repairProgress += repairSpeed / 4.0;

        if (this.repairProgress >= 1.0) {
            this.state.hazardManager.repairBreach(breachIndex, 1);
            this.repairProgress = 0;
            this.playerRepairing = false;

            if (this.state.hud) {
                this.state.hud.showNotification('Brecha reparada por el jugador', 'success');
            }
        }
    }

    startPlayerFireFighting(fire, player, dt) {
        this.playerFightingFire = true;
        this.currentFire = fire;

        const playerSkill = player.engineeringSkill || 0;
        const fightSpeed = (1.0 + playerSkill * 0.2) * dt * 25;

        this.fireFightProgress += dt;

        fire.intensity -= fightSpeed;

        if (fire.intensity <= 0) {
            this.state.hazardManager.extinguishFire(fire.x, fire.y);
            this.fireFightProgress = 0;
            this.playerFightingFire = false;
            this.currentFire = null;

            if (this.state.hud) {
                this.state.hud.showNotification('Incendio extinguido por el jugador', 'success');
            }
        }
    }

    stopPlayerRepair() {
        this.playerRepairing = false;
        this.currentRepairBreach = null;
        this.repairProgress = 0;
    }

    stopPlayerFireFighting() {
        this.playerFightingFire = false;
        this.currentFire = null;
        this.fireFightProgress = 0;
    }

    render(ctx, shipRenderer, player) {
        if (!shipRenderer) return;

        // Render fire alert banner if there are active fires
        if (this.state.hazardManager && this.state.hazardManager.fires.length > 0) {
            this.renderFireAlert(ctx);
        }

        // Render "Press E to Repair" prompt if near breach
        if (this.nearestBreach && !this.playerRepairing && !this.playerFightingFire) {
            this.renderRepairPrompt(ctx, this.nearestBreach.breach, shipRenderer);
        }

        // Render "Press E to Fight Fire" prompt if near fire
        if (this.nearestFire && !this.playerFightingFire && !this.playerRepairing) {
            this.renderFirePrompt(ctx, this.nearestFire, shipRenderer);
        }

        // Render player repair progress bar
        if (this.playerRepairing && this.currentRepairBreach !== null) {
            const breach = this.state.hazardManager.breaches[this.currentRepairBreach];
            if (breach) {
                this.renderPlayerRepairProgress(ctx, breach, this.repairProgress, shipRenderer);
            }
        }

        // Render player fire fighting progress bar
        if (this.playerFightingFire && this.currentFire) {
            this.renderFireFightProgress(ctx, this.currentFire, player, shipRenderer);
        }

        // Render oxygen HUD
        this.renderOxygenHUD(ctx, player);
    }

    renderRepairProgress(ctx, breach, player, shipRenderer) {
        this.renderPlayerRepairProgress(ctx, breach, this.repairProgress, shipRenderer || player);
    }

    renderFireAlert(ctx) {
        const fireCount = this.state.hazardManager.fires.length;
        const time = Date.now() / 1000;

        ctx.save();
        const pulse = Math.sin(time * 8) * 0.2 + 0.8;

        ctx.fillStyle = `rgba(239, 68, 68, ${0.2 * pulse})`;
        ctx.fillRect(0, 0, ctx.canvas.width, 36);

        ctx.strokeStyle = 'rgba(239, 68, 68, 0.8)';
        ctx.lineWidth = 1;
        ctx.strokeRect(0, 0, ctx.canvas.width, 36);

        ctx.font = 'bold 14px "Orbitron", sans-serif';
        ctx.fillStyle = '#ef4444';
        ctx.textAlign = 'center';
        ctx.fillText(`🔥 ALERTA DE INCENDIO A BORDO (${fireCount} FUEGOS ACTIVOS)`, ctx.canvas.width / 2, 23);

        ctx.restore();
    }

    renderRepairPrompt(ctx, breach, shipRenderer) {
        const screenPos = {
            x: breach.x * shipRenderer.tileSize + shipRenderer.tileSize / 2,
            y: breach.y * shipRenderer.tileSize + shipRenderer.tileSize / 2
        };

        ctx.save();
        ctx.font = 'bold 13px "Rajdhani", sans-serif';
        ctx.textAlign = 'center';

        const text = '[MANTÉN E PARA REPARAR CASCO]';
        const textWidth = ctx.measureText(text).width;

        ctx.fillStyle = 'rgba(3, 7, 18, 0.9)';
        ctx.fillRect(screenPos.x - textWidth / 2 - 10, screenPos.y - 45, textWidth + 20, 26);

        ctx.strokeStyle = '#00f0ff';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(screenPos.x - textWidth / 2 - 10, screenPos.y - 45, textWidth + 20, 26);

        ctx.fillStyle = '#00f0ff';
        ctx.fillText(text, screenPos.x, screenPos.y - 28);
        ctx.restore();
    }

    renderPlayerRepairProgress(ctx, breach, progress, shipRenderer) {
        const screenPos = {
            x: breach.x * shipRenderer.tileSize + shipRenderer.tileSize / 2,
            y: breach.y * shipRenderer.tileSize + shipRenderer.tileSize / 2
        };

        ctx.save();
        const barWidth = 110;
        const barHeight = 10;
        const x = screenPos.x - barWidth / 2;
        const y = screenPos.y - 55;

        ctx.fillStyle = 'rgba(3, 7, 18, 0.9)';
        ctx.fillRect(x, y, barWidth, barHeight);

        ctx.fillStyle = '#10b981';
        ctx.fillRect(x, y, barWidth * progress, barHeight);

        ctx.strokeStyle = '#00f0ff';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(x, y, barWidth, barHeight);

        ctx.font = 'bold 11px "Rajdhani", sans-serif';
        ctx.textAlign = 'center';
        ctx.fillStyle = '#ffffff';
        ctx.fillText(`REPARANDO CASCO... ${Math.floor(progress * 100)}%`, screenPos.x, y - 5);
        ctx.restore();
    }

    renderOxygenHUD(ctx, player) {
        if (!player || player.oxygenLevel === undefined) return;

        const x = 20;
        const y = ctx.canvas.height - 90;
        const barWidth = 180;
        const barHeight = 22;

        ctx.save();

        ctx.font = 'bold 12px "Orbitron", sans-serif';
        ctx.fillStyle = '#00f0ff';
        ctx.textAlign = 'left';
        ctx.fillText('NIVEL DE OXÍGENO', x, y - 8);

        ctx.fillStyle = 'rgba(3, 7, 18, 0.85)';
        ctx.fillRect(x, y, barWidth, barHeight);

        const oxygenPercent = player.oxygenLevel / 100;
        const oxygenColor = oxygenPercent > 0.5 ? '#10b981' : oxygenPercent > 0.25 ? '#f59e0b' : '#ef4444';
        ctx.fillStyle = oxygenColor;
        ctx.fillRect(x, y, barWidth * oxygenPercent, barHeight);

        ctx.strokeStyle = '#00f0ff';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(x, y, barWidth, barHeight);

        ctx.font = 'bold 13px "Rajdhani", sans-serif';
        ctx.textAlign = 'center';
        ctx.fillStyle = '#ffffff';
        ctx.fillText(`${Math.floor(player.oxygenLevel)}%`, x + barWidth / 2, y + 16);

        ctx.restore();
    }

    renderFirePrompt(ctx, fire, shipRenderer) {
        const screenPos = {
            x: fire.x * shipRenderer.tileSize + shipRenderer.tileSize / 2,
            y: fire.y * shipRenderer.tileSize + shipRenderer.tileSize / 2
        };

        ctx.save();
        ctx.font = 'bold 13px "Rajdhani", sans-serif';
        ctx.textAlign = 'center';

        const text = '[MANTÉN E PARA EXTINGUIR FUEGO]';
        const textWidth = ctx.measureText(text).width;

        ctx.fillStyle = 'rgba(3, 7, 18, 0.9)';
        ctx.fillRect(screenPos.x - textWidth / 2 - 10, screenPos.y - 45, textWidth + 20, 26);

        ctx.strokeStyle = '#f59e0b';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(screenPos.x - textWidth / 2 - 10, screenPos.y - 45, textWidth + 20, 26);

        ctx.fillStyle = '#f59e0b';
        ctx.fillText(text, screenPos.x, screenPos.y - 28);
        ctx.restore();
    }

    renderFireFightProgress(ctx, fire, player, shipRenderer) {
        const screenPos = {
            x: fire.x * shipRenderer.tileSize + shipRenderer.tileSize / 2,
            y: fire.y * shipRenderer.tileSize + shipRenderer.tileSize / 2
        };

        const playerSkill = player.engineeringSkill || 0;
        const fightTime = Math.max(3, 5 - playerSkill);
        const progress = Math.min(1, this.fireFightProgress / fightTime);

        ctx.save();

        const barWidth = 110;
        const barHeight = 10;
        const barX = screenPos.x - barWidth / 2;
        const barY = screenPos.y - 55;

        ctx.fillStyle = 'rgba(3, 7, 18, 0.9)';
        ctx.fillRect(barX, barY, barWidth, barHeight);

        const gradient = ctx.createLinearGradient(barX, 0, barX + barWidth * progress, 0);
        gradient.addColorStop(0, '#f59e0b');
        gradient.addColorStop(1, '#ef4444');
        ctx.fillStyle = gradient;
        ctx.fillRect(barX, barY, barWidth * progress, barHeight);

        ctx.strokeStyle = '#f59e0b';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(barX, barY, barWidth, barHeight);

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 11px "Rajdhani", sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('EXTINGUIENDO INCENDIO...', screenPos.x, barY - 5);

        ctx.restore();
    }
}

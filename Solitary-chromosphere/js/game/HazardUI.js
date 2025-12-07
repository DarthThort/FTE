/**
 * HazardUI.js
 * UI for hazard interactions: repair prompts, progress bars, crew assignment, oxygen display
 */

class HazardUI {
    constructor(gameState) {
        this.state = gameState;
        this.nearestBreach = null;
        this.showingCrewMenu = false;
        this.selectedBreach = null;  // Selected breach for crew assignment
        this.menuBounds = [];  // Clickable areas for mouse detection
        this.playerRepairing = false;
        this.currentRepairBreach = null;
        this.repairProgress = 0;
    }

    /**
     * Update - check proximity and handle input
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
     * Toggle crew assignment menu (accessible anywhere)
     */
    toggleCrewMenu() {
        // Toggle menu - no proximity check needed
        this.showingCrewMenu = !this.showingCrewMenu;

        // Reset selection when opening
        if (this.showingCrewMenu) {
            this.selectedBreach = null;
        }
    }

    /**
     * Assign crew to breach
     */
    assignCrewToBreach(crewMember, breachIndex) {
        const breach = this.state.hazardManager.breaches[breachIndex];
        if (!breach) return false;

        // Set crew target
        crewMember.targetBreach = breachIndex;
        crewMember.targetX = breach.x * 32 + 16;
        crewMember.targetY = breach.y * 32 + 16;
        crewMember.state = 'moving';  // Start moving to breach
        crewMember.path = [];  // Reset path

        this.showingCrewMenu = false;
        this.selectedBreach = null;
        console.log(`[HazardUI] Assigned ${crewMember.name} to breach at (${breach.x}, ${breach.y})`);
        return true;
    }

    /**
     * Render all UI elements
     */
    render(ctx, shipRenderer, player) {
        // Render repair prompt if near breach
        if (this.nearestBreach && !this.playerRepairing && !this.showingCrewMenu) {
            this.renderRepairPrompt(ctx, shipRenderer);
        }

        // Render repair progress if player is repairing
        if (this.playerRepairing && this.currentRepairBreach !== null) {
            this.renderRepairProgress(ctx, shipRenderer, player);
        }

        // Render crew assignment menu
        if (this.showingCrewMenu && this.nearestBreach) {
            this.renderCrewMenu(ctx);
        }

        // Render oxygen level in HUD
        this.renderOxygenHUD(ctx, player);
    }

    /**
     * Render "Press E/R" prompt near breach
     */
    renderRepairPrompt(ctx, shipRenderer) {
        const breach = this.nearestBreach.breach;
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
     * Render repair progress bar
     */
    renderRepairProgress(ctx, shipRenderer, player) {
        const breach = this.state.hazardManager.breaches[this.currentRepairBreach];
        if (!breach || !player) return;

        const posX = breach.x * shipRenderer.tileSize + shipRenderer.offsetX;
        const posY = breach.y * shipRenderer.tileSize + shipRenderer.offsetY - 50;

        const playerSkill = player.engineeringSkill || 0;
        const repairTime = Math.max(2, 10 - playerSkill);
        const progress = Math.min(1, this.repairProgress / repairTime);

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
     * Render crew assignment menu
     */
    renderCrewMenu(ctx) {
        const menuX = ctx.canvas.width / 2 - 150;
        const menuY = ctx.canvas.height / 2 - 100;

        ctx.save();

        // Background
        ctx.fillStyle = 'rgba(0, 0, 0, 0.9)';
        ctx.fillRect(menuX, menuY, 300, 200);

        // Border
        ctx.strokeStyle = '#00f0ff';
        ctx.lineWidth = 2;
        ctx.strokeRect(menuX, menuY, 300, 200);

        // Title
        ctx.fillStyle = '#00f0ff';
        ctx.font = 'bold 16px "Rajdhani", sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('Assign Crew to Repair', menuX + 150, menuY + 25);

        // Crew list
        const crew = this.state.ship.crew || [];
        ctx.font = '14px "Rajdhani", sans-serif';
        ctx.textAlign = 'left';

        let yOffset = 50;
        for (let i = 0; i < crew.length; i++) {
            const member = crew[i];
            const skill = member.skills?.engineering || 0;

            // Highlight on hover (simplified - would need mouse tracking)
            ctx.fillStyle = '#fff';
            ctx.fillText(`${member.name} - ${member.role}`, menuX + 20, menuY + yOffset);
            ctx.fillText(`Engineering: ${skill}`, menuX + 200, menuY + yOffset);

            yOffset += 25;
        }

        // Instructions
        ctx.fillStyle = '#888';
        ctx.font = '12px "Rajdhani", sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('Click crew member to assign | ESC to cancel', menuX + 150, menuY + 185);

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
